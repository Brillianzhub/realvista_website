"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Edit, RefreshCw, Mail, Phone, MessageCircle,
  Building2, MapPin, FileText,
  CheckCircle, XCircle, UserCog, Lock, Eye, EyeOff,
  CreditCard, Camera, Upload, AlertCircle, Check,
} from "lucide-react";
import { Agent, AgentFormValues } from "@/app/types/types";
import { FieldWrapper, inputClass } from "@/lib/AgentUi";
import { AgentFormModal } from "./AgentModal";
import { toast } from "sonner";
import api from "@/config/apiClient";

interface AgentProfileTabProps {
  agent: Agent;
  onAgentUpdate: (updated: Agent) => void;
  onAgentEdit: (values: AgentFormValues) => Promise<void>;
  editLoading?: boolean;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-slate-500" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">
        {value ?? <span className="text-slate-300 font-normal">Not provided</span>}
      </p>
    </div>
  </div>
);

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-50">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const defaultFiles = { id_card: null as File | null, photo: null as File | null, business_registration: null as File | null };

export const AgentProfileTab = ({
  agent,
  onAgentUpdate,
  onAgentEdit,
  editLoading = false,
}: AgentProfileTabProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwError, setPwError] = useState("");

  // ── ID Verification state ─────────────────────────────────
  const [files, setFiles] = useState(defaultFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const idCardInputRef = useRef<any>(null);
  const photoInputRef = useRef<any>(null);
  const businessRegInputRef = useRef<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = { Authorization: `Token ${token}` };

  const isFileSelected = (type: keyof typeof defaultFiles) => !!files[type];

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => () => {
    ref.current?.click();
  };

  const handleFileSelect = (type: keyof typeof defaultFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFiles((prev) => ({ ...prev, [type]: selectedFile }));
    }
  };

  const resetVerifyForm = () => {
    setFiles(defaultFiles);
    setSubmitStatus(null);
    setStatusMessage("");
  };

  const handleVerificationSubmit = async () => {
    if (!files.id_card || !files.photo) {
      setSubmitStatus("error");
      setStatusMessage("ID card and photo are required.");
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const formData = new FormData();
      formData.append("id_card", files.id_card);
      formData.append("photo", files.photo);
      if (files.business_registration) {
        formData.append("business_registration", files.business_registration);
      }
      await api.post(
        "/agents/verifications/",
        formData,
        { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
      );
      toast.success("ID verification submitted successfully.");
      setIsIdVerified(true);
      setSubmitStatus("success");
      setStatusMessage("Verification submitted successfully!");
      setTimeout(() => setShowVerifyModal(false), 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Something went wrong. Please try again.";
      setSubmitStatus("error");
      setStatusMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit profile ──────────────────────────────────────────
  const handleProfileUpdate = async (values: AgentFormValues) => {
    await onAgentEdit(values);
    setShowEditModal(false);
  };

  // ── Reset password ────────────────────────────────────────
  const handlePasswordChange = async () => {
    setPwError("");
    if (!newPassword) { setPwError("New password is required."); return; }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    setPasswordLoading(true);
    try {
      await api.post(
        "/accounts/set-password/",
        { token: String(agent.user_id), password: newPassword },
        { headers: authHeader }
      );
      toast.success("Agent password updated successfully.");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setPwError("");
    } catch (error: any) {
      setPwError(error.response?.data?.message ?? "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Toggle verified status ────────────────────────────────
  const handleToggleStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await api.patch(
        `/accounts/my_agent/${agent.id}/`,
        { verified: !agent.verified },
        { headers: authHeader }
      );
      const updated: Agent = { ...agent, ...response.data };
      onAgentUpdate(updated);
      toast.success(`Agent ${updated.verified ? "verified" : "unverified"} successfully.`);
      setShowStatusModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to update agent status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const fullName = `${agent.first_name} ${agent.last_name}`.trim();
  const initials = `${agent.first_name?.[0] ?? ""}${agent.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-4">

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {agent.avatar ? (
              <img src={agent.avatar} alt={fullName} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold shrink-0">
                {initials || "—"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{fullName || "—"}</h2>
              <p className="text-sm text-slate-500">{agent.agency_name ?? "Agent"} · {agent.user}</p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${agent.verified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                  {agent.verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowEditModal(true)}
            disabled={editLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm font-medium gap-2 cursor-pointer"
          >
            {editLoading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Edit className="w-4 h-4" /> Edit Profile</>
            }
          </Button>
        </div>
      </div>

      {/* ── Personal Information ── */}
      <SectionCard title="Personal Information" description="Basic contact and identity details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Mail} label="Email Address" value={agent.user} />
          <InfoRow icon={Phone} label="Phone Number" value={agent.phone_number} />
          <InfoRow icon={MessageCircle} label="WhatsApp Number" value={agent.whatsapp_number} />
        </div>
      </SectionCard>

      {/* ── Agency Information ── */}
      <SectionCard title="Agency Information" description="Professional and business details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Building2} label="Agency Name" value={agent.agency_name} />
          <InfoRow icon={MapPin} label="Agency Address" value={agent.agency_address} />
          <InfoRow
            icon={FileText}
            label="Years of Experience"
            value={agent.experience_years !== undefined ? `${agent.experience_years} years` : null}
          />
          <InfoRow icon={MessageCircle} label="Preferred Contact" value={agent.preferred_contact_mode} />
        </div>
        {agent.bio && (
          <div className="mt-5 pt-5 border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400 mb-2">Professional Bio</p>
            <p className="text-sm text-slate-700 leading-relaxed">{agent.bio}</p>
          </div>
        )}
      </SectionCard>

      {/* ── Stats ── */}
      <SectionCard title="Performance Overview" description="Activity and engagement metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Listings", value: agent.total_listings },
            { label: "Views", value: agent.total_views },
            { label: "Inquiries", value: agent.total_inquiries },
            { label: "Bookmarks", value: agent.total_bookmarks },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Account Settings ── */}
      <SectionCard title="Account Settings" description="Manage this agent's account access and security">
        <div className="divide-y divide-slate-50">

          {/* Reset Password */}
          {/* <div className="flex items-center justify-between py-4 first:pt-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Reset Password</p>
                <p className="text-xs text-slate-500 mt-0.5">Set a new password for this agent</p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => setShowPasswordModal(true)}
              className="rounded-xl h-9 text-sm border-slate-200 cursor-pointer"
            >
              Update Password
            </Button>
          </div> */}

          {/* Verified Status */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${agent.verified ? "bg-emerald-50" : "bg-slate-100"
                }`}>
                {agent.verified
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-slate-400" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Verification Status</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently{" "}
                  <span className={`font-medium ${agent.verified ? "text-emerald-600" : "text-slate-500"}`}>
                    {agent.verified ? "Verified" : "Unverified"}
                  </span>
                </p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => setShowStatusModal(true)}
              className={`rounded-xl h-9 text-sm cursor-pointer border-slate-200 ${agent.verified
                  ? "hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50"
                  : "hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
            >
              {agent.verified ? "Unverify" : "Verify"}
            </Button>
          </div>

          {/* ID Card Verification */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isIdVerified ? "bg-emerald-50" : "bg-slate-100"
                }`}>
                <CreditCard className={`w-4 h-4 ${isIdVerified ? "text-emerald-500" : "text-slate-500"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">ID Card Verification</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isIdVerified
                    ? <span className="text-emerald-600 font-medium">Documents submitted</span>
                    : "Verify identity with a government-issued ID"
                  }
                </p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => { resetVerifyForm(); setShowVerifyModal(true); }}
              disabled={isIdVerified}
              className={`rounded-xl h-9 text-sm cursor-pointer border-slate-200 ${isIdVerified
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50"
                }`}
            >
              {isIdVerified
                ? <><Check className="w-3.5 h-3.5 mr-1.5" /> Verified</>
                : <><CreditCard className="w-3.5 h-3.5 mr-1.5" /> Verify ID</>
              }
            </Button>
          </div>

    
        </div>
      </SectionCard>

      {/* ── Edit Profile Modal ── */}
      <AgentFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleProfileUpdate}
        editingAgent={agent}
        loading={editLoading}
      />

      {/* ── Reset Password Modal ── */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Reset Password</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Set a new password for{" "}
              <span className="font-medium text-slate-700">{fullName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <FieldWrapper label="New Password">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`${inputClass} pr-10`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FieldWrapper>
            <FieldWrapper label="Confirm Password" error={pwError}>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Repeat new password"
                  className={`${inputClass} pr-10`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FieldWrapper>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={passwordLoading}
              onClick={() => { setShowPasswordModal(false); setNewPassword(""); setConfirmPassword(""); setPwError(""); }}
              className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={passwordLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer">
              {passwordLoading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                : "Update Password"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Verify / Unverify Modal ── */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${agent.verified ? "bg-rose-50" : "bg-emerald-50"
              }`}>
              {agent.verified
                ? <XCircle className="w-5 h-5 text-rose-500" />
                : <CheckCircle className="w-5 h-5 text-emerald-500" />
              }
            </div>
            <DialogTitle className="text-base font-semibold text-slate-900">
              {agent.verified ? "Unverify Agent" : "Verify Agent"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {agent.verified
                ? `Removing verification from ${fullName} will hide their verified badge on the platform.`
                : `Verifying ${fullName} will display a verified badge on their public profile.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowStatusModal(false)} disabled={statusLoading}
              className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleToggleStatus} disabled={statusLoading}
              className={`rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer text-white ${agent.verified ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
                }`}>
              {statusLoading
                ? <><RefreshCw className="w-4 h-4 animate-spin" />{agent.verified ? "Removing…" : "Verifying…"}</>
                : agent.verified ? "Remove Verification" : "Verify Agent"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ID Card Verification Modal ── */}
      <Dialog open={showVerifyModal} onOpenChange={(open) => { setShowVerifyModal(open); if (!open) resetVerifyForm(); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-teal-600" />
            </div>
            <DialogTitle className="text-base font-semibold text-slate-900">
              ID Card Verification
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Submit identity documents for{" "}
              <span className="font-medium text-slate-700">{fullName}</span>
            </DialogDescription>
          </DialogHeader>

          {submitStatus && (
            <Alert variant={submitStatus === "success" ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{submitStatus === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">

            {/* ID Card Upload */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                ID Card <span className="text-rose-400">*</span>
              </p>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isFileSelected("id_card")
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-teal-300"
                }`}>
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className={`w-6 h-6 ${isFileSelected("id_card") ? "text-emerald-500" : "text-slate-400"}`} />
                  <p className="text-xs text-slate-500">
                    {isFileSelected("id_card") ? files.id_card!.name : "Upload a government-issued ID"}
                  </p>
                  <input type="file" className="hidden" ref={idCardInputRef}
                    accept="image/*" onChange={handleFileSelect("id_card")} />
                  <Button variant="outline" size="sm" type="button"
                    onClick={triggerFileInput(idCardInputRef)}
                    className="rounded-xl h-8 text-xs border-slate-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {isFileSelected("id_card") ? "Change File" : "Select File"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Your Photo <span className="text-rose-400">*</span>
              </p>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isFileSelected("photo")
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-teal-300"
                }`}>
                <div className="flex flex-col items-center gap-2">
                  <Camera className={`w-6 h-6 ${isFileSelected("photo") ? "text-emerald-500" : "text-slate-400"}`} />
                  <p className="text-xs text-slate-500">
                    {isFileSelected("photo") ? files.photo!.name : "Upload a recent photo"}
                  </p>
                  <input type="file" className="hidden" ref={photoInputRef}
                    accept="image/*" onChange={handleFileSelect("photo")} />
                  <Button variant="outline" size="sm" type="button"
                    onClick={triggerFileInput(photoInputRef)}
                    className="rounded-xl h-8 text-xs border-slate-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {isFileSelected("photo") ? "Change File" : "Select File"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Business Registration Upload (Optional) */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Business Registration{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </p>
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isFileSelected("business_registration")
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-teal-300"
                }`}>
                <div className="flex flex-col items-center gap-2">
                  <FileText className={`w-6 h-6 ${isFileSelected("business_registration") ? "text-emerald-500" : "text-slate-400"}`} />
                  <p className="text-xs text-slate-500">
                    {isFileSelected("business_registration")
                      ? files.business_registration!.name
                      : "Upload business registration if applicable"
                    }
                  </p>
                  <input type="file" className="hidden" ref={businessRegInputRef}
                    accept="image/*,application/pdf" onChange={handleFileSelect("business_registration")} />
                  <Button variant="outline" size="sm" type="button"
                    onClick={triggerFileInput(businessRegInputRef)}
                    className="rounded-xl h-8 text-xs border-slate-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {isFileSelected("business_registration") ? "Change File" : "Select File"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={isSubmitting}
              onClick={() => { setShowVerifyModal(false); resetVerifyForm(); }}
              className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleVerificationSubmit}
              disabled={isSubmitting || !files.id_card || !files.photo}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
            >
              {isSubmitting
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</>
                : <><CheckCircle className="w-4 h-4" /> Submit for Verification</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};