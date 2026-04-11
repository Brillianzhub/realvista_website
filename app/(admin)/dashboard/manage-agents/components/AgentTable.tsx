"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Agent } from "@/app/types/types";
import { AgentAvatar } from "@/lib/AgentUi";

const ITEMS_PER_PAGE = 10;

interface AgentsTableProps {
    agents: Agent[];
    loading: boolean;
    searchQuery: string;
    currentPage: number;
    onPageChange: (page: number) => void;
    onCreateClick: () => void;
    onView: (agent: Agent) => void;
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
}

export const AgentsTable = ({
    agents,
    loading,
    searchQuery,
    currentPage,
    onPageChange,
    onCreateClick,
    onView,
    onEdit,
    onDelete,
}: AgentsTableProps) => {
    const totalPages = Math.ceil(agents.length / ITEMS_PER_PAGE);
    const paginated = agents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
        .reduce<(number | string)[]>((acc, p, idx, arr) => {
            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
        }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
            </div>
        );
    }

    if (agents.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                    {searchQuery ? "No agents found" : "No agents yet"}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    {searchQuery
                        ? "Try adjusting your search terms"
                        : "Add your first agent to get started"}
                </p>
                {!searchQuery && (
                    <Button
                        onClick={onCreateClick}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create New Agent
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pl-6 w-[240px]">
                                Agent
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Email
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Phone
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Agency
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Experience
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Contact Via
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">
                                Status
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pr-6 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.map((agent) => (
                            <TableRow
                                key={agent.id}
                                className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                            >
                                {/* Avatar + agency name + email sub-label */}
                                <TableCell className="py-3.5 pl-6">
                                    <div className="flex items-center gap-2.5">
                                        {agent.avatar ? (
                                            <img
                                                src={agent.avatar}
                                                alt={agent.user}
                                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <AgentAvatar name={agent.user} />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 leading-tight">
                                                {agent.agency_name || "—"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">
                                                {agent.user}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* user = email from API */}
                                <TableCell className="py-3.5">
                                    <a
                                        href={`mailto:${agent.user}`}
                                        className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                                    >
                                        {agent.user}
                                    </a>
                                </TableCell>

                                <TableCell className="py-3.5">
                                    <span className="text-sm text-slate-600">
                                        {agent.phone_number || <span className="text-slate-300">—</span>}
                                    </span>
                                </TableCell>

                                <TableCell className="py-3.5 max-w-[140px]">
                                    <span className="text-sm text-slate-600 truncate block">
                                        {agent.agency_address || <span className="text-slate-300">—</span>}
                                    </span>
                                </TableCell>

                                <TableCell className="py-3.5">
                                    <span className="text-sm text-slate-600">
                                        {agent.experience_years !== undefined
                                            ? `${agent.experience_years} yr${agent.experience_years !== 1 ? "s" : ""}`
                                            : <span className="text-slate-300">—</span>}
                                    </span>
                                </TableCell>

                                <TableCell className="py-3.5">
                                    <span className="text-sm text-slate-600 capitalize">
                                        {agent.preferred_contact_mode || <span className="text-slate-300">—</span>}
                                    </span>
                                </TableCell>

                                {/* verified replaces status */}
                                <TableCell className="py-3.5">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${agent.verified
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            : "bg-slate-100 text-slate-500 border border-slate-200"
                                        }`}>
                                        {agent.verified ? "Verified" : "Unverified"}
                                    </span>
                                </TableCell>

                                <TableCell className="py-3.5 pr-6">
                                    <div className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem
                                                    onClick={() => onView(agent)}
                                                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Agent
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(agent)}
                                                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Edit Agent
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(agent)}
                                                    className="flex items-center gap-2.5 text-xs font-medium text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Deactivate Agent
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-medium text-slate-700">
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>
                        –
                        <span className="font-medium text-slate-700">
                            {Math.min(currentPage * ITEMS_PER_PAGE, agents.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-700">{agents.length}</span> agents
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {pageNumbers.map((p, idx) =>
                            p === "…" ? (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="w-8 h-8 flex items-center justify-center text-xs text-slate-400"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p as number)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === p
                                            ? "bg-teal-600 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};