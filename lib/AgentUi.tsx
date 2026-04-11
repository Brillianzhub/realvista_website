"use client";

import { LucideIcon } from "lucide-react";

export const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
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

export const StatusBadge = ({ status }: { status: "active" | "inactive" }) =>
  status === "active" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );

export const AgentAvatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const palettes = [
    "bg-teal-100 text-teal-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const colorClass = palettes[name.charCodeAt(0) % palettes.length];

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}
    >
      {initials}
    </div>
  );
};

export const StatusAlert = ({
  status,
}: {
  status: { success: boolean; message: string } | null;
}) => {
  if (!status) return null;
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 ${
        status.success
          ? "bg-emerald-50 border-emerald-200"
          : "bg-rose-50 border-rose-200"
      }`}
    >
      <div
        className={`absolute inset-0 opacity-10 ${
          status.success
            ? "bg-gradient-to-br from-emerald-400 to-teal-400"
            : "bg-gradient-to-br from-rose-400 to-pink-400"
        }`}
      />
      <div className="relative">
        <h3
          className={`font-semibold text-sm mb-0.5 ${
            status.success ? "text-emerald-900" : "text-rose-900"
          }`}
        >
          {status.success ? "Success" : "Something went wrong"}
        </h3>
        <p
          className={`text-sm ${
            status.success ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {status.message}
        </p>
      </div>
    </div>
  );
};

export const FieldWrapper = ({
  label,
  error,
  children,
  colSpan,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  colSpan?: string;
  required?: boolean;
}) => (
  <div className={colSpan}>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
  </div>
);

export const inputClass =
  "w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all";