"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Eye, EyeOff, Save, X, Trash2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../DashboardLayout';
import api from '@/config/apiClient';
import TipTapEditor from '@/app/_components/TipTapEditor';

// TypeScript interfaces
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

// Zod validation schema
const trendSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  body: z.string(),
  category: z.string().min(1, 'Category is required'),
  source: z.string().min(1, 'Source is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type TrendFormData = z.infer<typeof trendSchema>;

const Trends: React.FC = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingTrend, setEditingTrend] = useState<Trend | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<TrendFormData>({
    resolver: zodResolver(trendSchema),
    defaultValues: {
      title: '',
      body: '',
      category: '',
      source: '',
      url: ''
    }
  });

  // Mock token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchTrends();
  }, []);

  // Reset to first page when trends change
  useEffect(() => {
    setCurrentPage(1);
  }, [trends.length]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get('/trends/categories/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      showAlert('Error fetching categories', 'error');
    }
  };

  const fetchTrends = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.get('/trends/get-all-reports/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setTrends(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showAlert('Error fetching trends', 'error');
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('File size must be less than 5MB', 'error');
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (): void => {
    setSelectedFile(null);
    setFilePreview(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
      if (data.url) {
        formData.append('url', data.url);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      if (editingTrend) {
        const response = await api.put(`/trends/update-trend/${editingTrend.id}/`, formData, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        setTrends(prevTrends =>
          prevTrends.map(trend =>
            trend.id === editingTrend.id ? { ...trend, ...response.data } : trend
          )
        );

        showAlert('Trend updated successfully!');
        setEditingTrend(null);
      } else {
        const response = await api.post('/trends/create-trend/', formData, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        setTrends(prevTrends => [response.data, ...prevTrends]);
        showAlert('Trend created successfully!');
        setShowCreateForm(false);
      }

      reset();
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('API Error:', error);
      showAlert('Error saving trend', 'error');
    }
  };

  const togglePublish = async (trendId: number, currentStatus: boolean): Promise<void> => {
    try {
      const response = await api.post(`/trends/toggle-publish/${trendId}/`,
        { publish: !currentStatus },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTrends(prevTrends =>
        prevTrends.map(trend =>
          trend.id === trendId ? { ...trend, ...response.data } : trend
        )
      );

      const newStatus = response.data.publish;
      showAlert(`Trend ${newStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('API Error:', error);
      showAlert('Error toggling publish status', 'error');
    }
  };

  const startEdit = (trend: Trend): void => {
    setEditingTrend(trend);
    setValue('title', trend.title);
    setValue('body', trend.body);
    setValue('category', trend.category);
    setValue('source', trend.source);
    setValue('url', trend.url || '');

    if (trend.attachment) {
      setFilePreview(trend.attachment);
    }

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

  // Pagination calculations
  const totalPages = Math.ceil(trends.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrends = trends.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = (): void => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = (): void => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <DashboardLayout
      title="Trends"
      description="Send trends and news to your users"
    >
      <div className="space-y-6">
        {alert && (
          <Alert className={`border-l-4 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-teal-500 bg-teal-50'}`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-600 py-4 px-6 to-teal-800 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Publish and edit your trends</CardTitle>
                <CardDescription className="text-teal-100 mt-2">
                  Publish and edit your trends to your users
                </CardDescription>
              </div>
              <Button
                onClick={startCreate}
                className="bg-white/20 hover:bg-white/30 cursor-pointer text-white border-white/30"
                disabled={showCreateForm || editingTrend !== null}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Trend
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {(showCreateForm || editingTrend) && (
              <Card className="mb-6 border-2 border-dashed border-teal-200 bg-teal-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingTrend ? 'Edit Trend' : 'Create New Trend'}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          {...register('title')}
                          placeholder="Enter trend title..."
                          className="mt-1"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(value: string) => setValue('category', value)} value={watch('category')}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category: Category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="source">Source *</Label>
                        <Input
                          id="source"
                          {...register('source')}
                          placeholder="e.g., Vanguard, TechCrunch"
                          className="mt-1"
                        />
                        {errors.source && (
                          <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="url">Source URL</Label>
                        <Input
                          id="url"
                          {...register('url')}
                          placeholder="https://example.com/article"
                          className="mt-1"
                        />
                        {errors.url && (
                          <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="attachment">Image Upload</Label>
                        <div className="mt-1 space-y-2">
                          <Input
                            id="attachment"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                          <p className="text-xs text-gray-500">
                            Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                          </p>

                          {filePreview && (
                            <div className="relative inline-block">
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md border-2 border-gray-200"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeFile}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="body">Content *</Label>
                        <TipTapEditor
                          content={watch('body') || ''}
                          onChange={(html: any) => {
                            setValue('body', html, {
                              shouldValidate: true,
                              shouldDirty: true
                            });
                          }}
                          error={errors.body?.message}
                        />
                        {errors.body && (
                          <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-teal-600 cursor-pointer to-teal-800 hover:from-teal-700 hover:to-teal-900"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Saving...' : (editingTrend ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Your Trends</h3>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {trends.length} {trends.length === 1 ? 'trend' : 'trends'}
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : trends.length === 0 ? (
                <Card className="text-center py-8 border-dashed border-2 border-gray-300">
                  <CardContent>
                    <p className="text-gray-500">No trends yet. Create your first trend!</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4">
                    {currentTrends.map((trend: Trend) => (
                      <Card key={trend.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {trend.category}
                                </Badge>
                                <Badge
                                  variant={trend.publish ? "default" : "secondary"}
                                  className={trend.publish ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {trend.publish ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-lg mb-2 line-clamp-2">{trend.title}</h4>
                              <div
                                className="text-gray-600 text-sm mb-3 line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: trend.body }}
                              />
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Source: {trend.source}</span>
                                <span>Views: {trend.views}</span>
                                <span>Updated: {new Date(trend.date_updated).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {trend.attachment && (
                              <img
                                src={trend.attachment}
                                alt="Trend"
                                className="w-20 h-20 object-cover rounded-md ml-4"
                              />
                            )}
                          </div>

                          <Separator className="mb-4" />

                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`publish-${trend.id}`} className="text-sm font-medium">
                                Publish
                              </Label>
                              <Switch
                                id={`publish-${trend.id}`}
                                checked={trend.publish}
                                onCheckedChange={() => togglePublish(trend.id, trend.publish)}
                                className='cursor-pointer'
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(trend)}
                                disabled={editingTrend !== null || showCreateForm}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <Button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(indexOfLastItem, trends.length)}</span> of{' '}
                            <span className="font-medium">{trends.length}</span> trends
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                              variant="outline"
                              size="sm"
                              className="relative inline-flex items-center rounded-l-md px-2 py-2"
                            >
                              <span className="sr-only">Previous</span>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {getPageNumbers().map((pageNumber, index) => (
                              pageNumber === -1 ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                >
                                  ...
                                </span>
                              ) : (
                                <Button
                                  key={pageNumber}
                                  onClick={() => goToPage(pageNumber)}
                                  variant={currentPage === pageNumber ? "default" : "outline"}
                                  size="sm"
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                                      : 'text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                  {pageNumber}
                                </Button>
                              )
                            ))}

                            <Button
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              size="sm"
                              className="relative inline-flex items-center rounded-r-md px-2 py-2"
                            >
                              <span className="sr-only">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Trends;