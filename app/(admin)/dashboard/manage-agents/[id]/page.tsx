"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Building2, RefreshCw } from "lucide-react";
import { Agent, AgentFormValues } from "@/app/types/types";
import DashboardLayout from "../../DashboardLayout";
import { AgentProfileTab } from "../components/AgentProfileTab";
import { AgentListingsTab } from "../components/AgentListingsTab";
import api from "@/config/apiClient";
import { toast } from "sonner";

const AgentDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const agentId = Number(params?.id);

    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [editLoading, setEditLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchAgent = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/accounts/my_agent/${agentId}/`,
                { headers: { Authorization: `Token ${token}` } }
            );
            setAgent(response.data);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? "Failed to load agent details."
            );
            setAgent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!agentId) return;
        fetchAgent();
    }, [agentId]);

    // ── Edit agent ────────────────────────────────────────────────
    const handleEditAgent = async (values: AgentFormValues) => {
        if (!agent) return;
        setEditLoading(true);
        try {
            const response = await api.put(
                `/accounts/profile/admin/${agent.user_id}/`,
                values,
                { headers: { Authorization: `Token ${token}` } }
            );
            const updatedAgent: Agent = { ...agent, ...response.data };
            setAgent(updatedAgent);
            toast.success("Agent updated successfully!");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? "Failed to update agent."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────────
    if (loading) {
        return (
            <DashboardLayout title="Agent Details" description="Loading agent profile…">
                <div className="max-w-6xl mx-auto flex items-center justify-center py-24">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                </div>
            </DashboardLayout>
        );
    }

    // ── Not found state ───────────────────────────────────────────
    if (!agent) {
        return (
            <DashboardLayout title="Agent Details" description="Agent not found">
                <div className="max-w-4xl mx-auto py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-2">Agent not found</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        The agent you're looking for doesn't exist or has been removed.
                    </p>
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title={`${agent.first_name} ${agent.last_name}`.trim() || agent.user}
            description="Agent profile, listings and account settings"
        >
            <div className="max-w-6xl mx-auto space-y-4">

                {/* Back button + breadcrumb */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 text-slate-500 hover:text-slate-800 cursor-pointer rounded-xl h-9 px-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Agents
                    </Button>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500 truncate max-w-[200px]">
                        {`${agent.first_name} ${agent.last_name}`.trim() || agent.user}
                    </span>

                    {/* Verified badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${agent.verified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                        {agent.verified ? "Verified" : "Unverified"}
                    </span>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="profile">
                    <TabsList className="bg-white border border-slate-100 rounded-2xl p-1 h-auto gap-1 shadow-sm">
                        <TabsTrigger
                            value="profile"
                            className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 transition-all cursor-pointer"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="listings"
                            className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 transition-all cursor-pointer"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Listings
                            {agent.total_listings > 0 && (
                                <span className="ml-2 bg-teal-100 text-teal-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                                    {agent.total_listings}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4">
                        <AgentProfileTab
                            agent={agent}
                            onAgentUpdate={setAgent}
                            onAgentEdit={handleEditAgent}
                            editLoading={editLoading}
                        />
                    </TabsContent>

                    <TabsContent value="listings" className="mt-4">
                        <AgentListingsTab
                            agentId={agent.id}
                            initialListings={agent.properties ?? []}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default AgentDetailPage;