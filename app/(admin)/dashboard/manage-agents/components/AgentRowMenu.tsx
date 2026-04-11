"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

interface AgentRowMenuProps {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const AgentRowMenu = ({ onView, onEdit, onDelete }: AgentRowMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Agent options"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/60 overflow-hidden py-1">
                    <button
                        onClick={() => { onView(); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        View Agent
                    </button>
                    <button
                        onClick={() => { onEdit(); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                        <Edit className="w-3.5 h-3.5 shrink-0" />
                        Edit Agent
                    </button>
                    <div className="h-px bg-slate-100 mx-2 my-1" />
                    <button
                        onClick={() => { onDelete(); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        Delete Agent
                    </button>
                </div>
            )}
        </div>
    );
};