"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus, Edit, Save, X, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, TrendingUp, Eye, Calendar, BookOpen, Link2
} from 'lucide-react';
import DashboardLayout from '../DashboardLayout';
import api from '@/config/apiClient';
import TipTapEditor from '@/app/_components/TipTapEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
}

interface Trend {
  id: number;
  title: string;
  body: string;
  category: string;
  source: string;
  url?: string;
  attachment?: string;
  publish: boolean;
  views: number;
  date_created: string;
  date_updated: string;
}

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const trendSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  body: z.string(),
  category: z.string().min(1, 'Category is required'),
  source: z.string().min(1, 'Source is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type TrendFormData = z.infer<typeof trendSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-teal-600" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
  </div>
);

const FieldInput = ({
  label,
  placeholder,
  type = "text",
  error,
  registration,
  colSpan,
}: {
  label: string;
  placeholder: string;
  type?: string;
  error?: string;
  registration: any;
  colSpan?: string;
}) => (
  <div className={colSpan}>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
      {...registration}
    />
    {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Trends: React.FC = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingTrend, setEditingTrend] = useState<Trend | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<TrendFormData>({
    resolver: zodResolver(trendSchema),
    defaultValues: { title: '', body: '', category: '', source: '', url: '' }
  });

  useEffect(() => { fetchCategories(); fetchTrends(); }, []);
  useEffect(() => { setCurrentPage(1); }, [trends.length]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get('/trends/categories/', { headers: { Authorization: `Token ${token}` } });
      setCategories(response.data);
    } catch { showAlert('Error fetching categories', 'error'); }
  };

  const fetchTrends = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.get('/trends/get-all-reports/', { headers: { Authorization: `Token ${token}` } });
      setTrends(Array.isArray(response.data) ? response.data : []);
    } catch { showAlert('Error fetching trends', 'error'); setTrends([]); }
    finally { setIsLoading(false); }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { showAlert('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showAlert('File size must be less than 5MB', 'error'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = (): void => {
    setSelectedFile(null);
    setFilePreview(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'success'): void => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const onSubmit = async (data: TrendFormData): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('body', data.body);
      formData.append('category', data.category);
      formData.append('source', data.source);
      if (data.url) formData.append('url', data.url);
      if (selectedFile) formData.append('attachment', selectedFile);

      const headers = { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' };

      if (editingTrend) {
        const response = await api.put(`/trends/update-trend/${editingTrend.id}/`, formData, { headers });
        setTrends(prev => prev.map(t => t.id === editingTrend.id ? { ...t, ...response.data } : t));
        showAlert('Trend updated successfully!');
        setEditingTrend(null);
      } else {
        const response = await api.post('/trends/create-trend/', formData, { headers });
        setTrends(prev => [response.data, ...prev]);
        showAlert('Trend created successfully!');
        setShowCreateForm(false);
      }
      reset();
      setSelectedFile(null);
      setFilePreview(null);
    } catch { showAlert('Error saving trend', 'error'); }
  };

  const togglePublish = async (trendId: number, currentStatus: boolean): Promise<void> => {
    try {
      const response = await api.post(`/trends/toggle-publish/${trendId}/`,
        { publish: !currentStatus },
        { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' } }
      );
      setTrends(prev => prev.map(t => t.id === trendId ? { ...t, ...response.data } : t));
      showAlert(`Trend ${response.data.publish ? 'published' : 'unpublished'} successfully!`);
    } catch { showAlert('Error toggling publish status', 'error'); }
  };

  const startEdit = (trend: Trend): void => {
    setEditingTrend(trend);
    setValue('title', trend.title);
    setValue('body', trend.body);
    setValue('category', trend.category);
    setValue('source', trend.source);
    setValue('url', trend.url || '');
    if (trend.attachment) setFilePreview(trend.attachment);
    setShowCreateForm(false);
  };

  const cancelEdit = (): void => {
    setEditingTrend(null);
    setShowCreateForm(false);
    setSelectedFile(null);
    setFilePreview(null);
    reset();
  };

  const startCreate = (): void => {
    setShowCreateForm(true);
    setEditingTrend(null);
    setSelectedFile(null);
    setFilePreview(null);
    reset();
  };

  // Pagination
  const totalPages = Math.ceil(trends.length / ITEMS_PER_PAGE);
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTrends = trends.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  return (
    <DashboardLayout title="Trends" description="Send trends and news to your users">
      <div className="max-w-6xl mx-auto space-y-2">

        {/* ── Status Alert ── */}
        {alert && (
          <div className={`relative overflow-hidden rounded-xl border p-4 mb-2 ${alert.type === 'success' ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
            <div className={`absolute inset-0 opacity-10 ${alert.type === 'success' ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-rose-400 to-pink-400"}`} />
            <div className="relative flex items-start gap-2">
              {alert.type === 'error'
                ? <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                : <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />}
              <div>
                <h3 className={`font-semibold text-sm mb-0.5 ${alert.type === 'success' ? "text-emerald-900" : "text-rose-900"}`}>
                  {alert.type === 'success' ? 'Success' : 'Something went wrong'}
                </h3>
                <p className={`text-sm ${alert.type === 'success' ? "text-emerald-700" : "text-rose-700"}`}>{alert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionHeader
              icon={TrendingUp}
              title="All Trends"
              description={`${trends.length} trend${trends.length !== 1 ? 's' : ''} in your database`}
            />
            <Button
              onClick={startCreate}
              disabled={showCreateForm || editingTrend !== null}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              New Trend
            </Button>
          </div>
        </div>

        {/* ── Connector ── */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-slate-200" />
        </div>

        {/* ── Create / Edit Form ── */}
        {(showCreateForm || editingTrend) && (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <SectionHeader
                  icon={editingTrend ? Edit : Plus}
                  title={editingTrend ? 'Edit Trend' : 'Create New Trend'}
                  description={editingTrend ? 'Update the trend information below' : 'Fill in the details to publish a new trend'}
                />
                <button
                  onClick={cancelEdit}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldInput
                  label="Title *"
                  placeholder="Enter trend title…"
                  error={errors.title?.message}
                  registration={register('title')}
                  colSpan="md:col-span-2"
                />

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                  <Select onValueChange={(v) => setValue('category', v)} value={watch('category')}>
                    <SelectTrigger className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 text-sm text-slate-800 transition-all">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>}
                </div>

                <FieldInput
                  label="Source *"
                  placeholder="e.g., Vanguard, TechCrunch"
                  error={errors.source?.message}
                  registration={register('source')}
                />

                <FieldInput
                  label="Source URL"
                  placeholder="https://example.com/article"
                  error={errors.url?.message}
                  registration={register('url')}
                />

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Image Upload</label>
                  <input
                    id="attachment"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-sm text-slate-700 transition-all file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, WebP · Max 5MB</p>
                  {filePreview && (
                    <div className="relative inline-block mt-2">
                      <img src={filePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rich Text Body */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content *</label>
                  <TipTapEditor
                    content={watch('body') || ''}
                    onChange={(html: any) => setValue('body', html, { shouldValidate: true, shouldDirty: true })}
                    error={errors.body?.message}
                  />
                  {errors.body && <p className="text-xs text-rose-500 mt-1">{errors.body.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                  className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{editingTrend ? 'Updating…' : 'Creating…'}</>
                  ) : (
                    <><Save className="w-4 h-4" />{editingTrend ? 'Update Trend' : 'Create Trend'}</>
                  )}
                </Button>
              </div>
            </div>

            {/* connector between form and list */}
            <div className="flex justify-center">
              <div className="w-px h-4 bg-slate-200" />
            </div>
          </>
        )}

        {/* ── Trends List ── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-6 h-6 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : trends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">No trends yet</h3>
              <p className="text-xs text-slate-500 mb-4">Create your first trend to get started</p>
              <Button
                onClick={startCreate}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />Create New Trend
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {currentTrends.map((trend) => (
                  <div key={trend.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {trend.attachment && (
                        <img
                          src={trend.attachment}
                          alt="Trend"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                            {trend.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${trend.publish ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {trend.publish ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{trend.title}</h4>

                        {/* Body preview */}
                        <div
                          className="text-xs text-slate-500 line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{ __html: trend.body }}
                        />

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />{trend.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />{trend.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(trend.date_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {trend.url && (
                            <a href={trend.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-500 hover:text-teal-700 transition-colors">
                              <Link2 className="w-3 h-3" />Source link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`publish-${trend.id}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                          Publish
                        </label>
                        <Switch
                          id={`publish-${trend.id}`}
                          checked={trend.publish}
                          onCheckedChange={() => togglePublish(trend.id, trend.publish)}
                          className="cursor-pointer"
                          style={trend.publish ? { backgroundColor: '#0d9488' } : undefined}
                        />
                      </div>
                      <button
                        onClick={() => startEdit(trend)}
                        disabled={editingTrend !== null || showCreateForm}
                        className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-medium text-slate-700">{indexOfFirst + 1}</span>–
                    <span className="font-medium text-slate-700">{Math.min(indexOfFirst + ITEMS_PER_PAGE, trends.length)}</span> of{' '}
                    <span className="font-medium text-slate-700">{trends.length}</span> trends
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "…" ? (
                          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === p ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trends;