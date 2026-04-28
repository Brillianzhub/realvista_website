"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../DashboardLayout";
import { Agent, AgentFormValues } from "@/app/types/types";
import { SectionHeader } from "@/lib/AgentUi";
import { AgentsTable } from "./components/AgentTable";
import { AgentFormModal } from "./components/AgentModal";
import { DeleteAgentModal } from "./components/DeleteAgentModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/config/apiClient";

const AgentsManagementPage = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

    // ── Fetch agents ──────────────────────────────────────────────
    const fetchAgents = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get(
                "/accounts/get-my-agents/",
                { headers: { Authorization: `Token ${token}` } }
            );
            const data = response.data;
            // Response shape: { count: number, agents: Agent[] }
            setAgents(Array.isArray(data) ? data : data.agents ?? []);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? "Failed to fetch agents. Please try again."
            );
            console.log(error.response)
        } finally {
            setFetchLoading(false);
        }
    };


    console.log("agentToDelete--->", agentToDelete)


    useEffect(() => { fetchAgents(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    // ── Filtered list ─────────────────────────────────────────────
    const filteredAgents = agents.filter((a) => {
        const q = searchQuery.toLowerCase();
        return (
            a.user?.toLowerCase().includes(q) ||          // user = email
            a.agency_name?.toLowerCase().includes(q) ||
            a.agency_address?.toLowerCase().includes(q) ||
            a.bio?.toLowerCase().includes(q)
        );
    });

    // ── Create agent ──────────────────────────────────────────────
    const handleCreateAgent = async (values: AgentFormValues) => {
        setActionLoading(true);
        setStatus(null);
        try {
            const response = await api.post(
                "/accounts/register_agent/",
                values,
                { headers: { Authorization: `Token ${token}` } }
            );
            toast.success("Agent created successfully!");
            setShowFormModal(false);
            setEditingAgent(null);
            await fetchAgents()
        } catch (error: any) {
            const message =
                error.response?.data?.error ??   // e.g. "user with this email already exists"
                "Failed to create agent. Please try again.";
            toast.error(message);
            console.log(error.response?.data)
        } finally {
            setActionLoading(false);
        }
    };

    // ── Edit agent ────────────────────────────────────────────────
    const handleEditAgent = async (values: AgentFormValues) => {
        if (!editingAgent) return;
        console.log("Values being sent:", JSON.stringify(values, null, 2));
        setActionLoading(true);
        setStatus(null);
        try {
            const response = await api.put(
                `/accounts/profile/admin/${editingAgent.user_id}/`,
                values,
                { headers: { Authorization: `Token ${token}` } }
            );
            const updatedAgent: Agent = response.data;
            setAgents((prev) =>
                prev.map((a) => (a.user_id === editingAgent.user_id ? updatedAgent : a))
            );
            await fetchAgents()
            toast.success("Agent updated successfully!");
            setShowFormModal(false);
            setEditingAgent(null);
        } catch (error: any) {
            const message =
                error.response?.data?.message ?? "Failed to update agent. Please try again.";
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Unified form submit (create or edit) ──────────────────────
    const handleFormSubmit = (values: AgentFormValues) =>
        editingAgent ? handleEditAgent(values) : handleCreateAgent(values);

    // ── Open edit modal ───────────────────────────────────────────
    const handleEditClick = async (agent: Agent) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setEditingAgent(agent);
        setStatus(null);
        setShowFormModal(true);
    };

    // ── Delete ────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!agentToDelete) return;
        setActionLoading(true);
        try {
            await api.post(
                `/accounts/agents/${agentToDelete.id}/toggle-status/`, null,
                { headers: { Authorization: `Token ${token}` } }
            );
            setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
            toast.success(
                `${agentToDelete.first_name} ${agentToDelete.last_name} was ${agentToDelete.is_active ? "deactivated" : "activated"}.`
            );
            setShowDeleteModal(false);
            await fetchAgents()
            setAgentToDelete(null);
        } catch (error: any) {
            const message =
                error.response?.data?.message ?? "Failed to deactivate agent. Please try again.";
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── View ──────────────────────────────────────────────────────
    const handleViewAgent = (agent: Agent) => {
        router.push(`/dashboard/manage-agents/${agent.id}`);
    };

    const handleCloseForm = () => {
        setShowFormModal(false);
        setEditingAgent(null);
    };

    return (
        <DashboardLayout
            title="Agents Management"
            description="Manage your team of real estate agents"
        >
            <div className="max-w-7xl mx-auto space-y-2">

                {/* ── Header bar ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SectionHeader
                            icon={Users}
                            title="All Agents"
                            description={`${filteredAgents.length} agent${filteredAgents.length !== 1 ? "s" : ""} in your team`}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="Search agents…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 w-full sm:w-56 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            {/* Refresh */}
                            <button
                                onClick={fetchAgents}
                                disabled={fetchLoading}
                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                                aria-label="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} />
                            </button>
                            {/* Create */}
                            <Button
                                onClick={() => { setEditingAgent(null); setStatus(null); setShowFormModal(true); }}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-sm cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                New Agent
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                </div>

                {/* ── Table ── */}
                <AgentsTable
                    agents={filteredAgents}
                    loading={fetchLoading}
                    searchQuery={searchQuery}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onCreateClick={() => setShowFormModal(true)}
                    onView={handleViewAgent}
                    onEdit={handleEditClick}
                    onToggle={async (agent) => {
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        setAgentToDelete(agent);
                        setShowDeleteModal(true);
                    }}
                />
            </div>

            {/* ── Form Modal (Create / Edit) ── */}
            <AgentFormModal
                open={showFormModal}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                editingAgent={editingAgent}
                loading={actionLoading}
            />

            {/* ── Delete Confirm Modal ── */}
            <DeleteAgentModal
                open={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setAgentToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                agent={agentToDelete}
                loading={actionLoading}
            />
        </DashboardLayout>
    );
};

export default AgentsManagementPage;