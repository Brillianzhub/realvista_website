"use client";

import { useState, useEffect } from "react";
import { RefreshCw, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from "@/config/apiClient";
import DashboardLayout from "../DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Currency {
    id: number;
    currency_code: string;
    description: string | null;
    rate: string;
    base: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const currencySchema = z.object({
    currencies: z
        .array(
            z.object({
                id: z.number().optional(),
                currency_code: z
                    .string()
                    .min(3, { message: "Must be 3 characters." })
                    .max(3, { message: "Must be 3 characters." }),
                description: z.string().nullable().optional(),
                rate: z.string().refine(
                    (val) => !isNaN(Number(val)) && Number(val) > 0,
                    { message: "Rate must be a positive number." }
                ),
                base: z.string(),
                isBase: z.boolean().default(false),
            })
        )
        .min(1, { message: "At least one currency is required." }),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// ─── SectionHeader ────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CurrencyRatesPage() {
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [baseCurrency, setBaseCurrency] = useState<string>("EUR");
    const [currentPage, setCurrentPage] = useState(1);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const {
        register,
        watch,
        setValue,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(currencySchema) as any,
        defaultValues: { currencies: [] as CurrencyFormValues["currencies"] },
    });

    const { fields, replace } = useFieldArray({ control, name: "currencies" });

    useEffect(() => { setCurrentPage(1); }, [currencies.length]);
    useEffect(() => { fetchCurrencyRates(); }, []);

    const fetchCurrencyRates = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get("/currencies/", {
                headers: { Authorization: `Token ${token}` },
            });
            const data: Currency[] = response.data;
            setCurrencies(data);

            const base = data.find((c) => c.base === c.currency_code);
            if (base) setBaseCurrency(base.currency_code);

            replace(
                data.map((c) => ({
                    id: c.id,
                    currency_code: c.currency_code,
                    description: c.description,
                    rate: c.rate,
                    base: c.base,
                    isBase: c.base === c.currency_code,
                }))
            );
        } catch (error) {
            setStatus({ success: false, message: "Failed to fetch currency rates. Please try again." });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleUpdateCurrencyRates = async () => {
        setUpdateLoading(true);
        setStatus(null);
        try {
            await api.get("/update-currency-rates/", {
                headers: { Authorization: `Token ${token}` },
            });
            setStatus({ success: true, message: "Currency rates updated successfully from external source!" });
            await fetchCurrencyRates();
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to update currency rates. Please try again.",
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleBaseChange = (index: number, checked: boolean) => {
        if (!checked) return;
        fields.forEach((_, i) => {
            if (i !== index) setValue(`currencies.${i}.isBase`, false);
        });
        const newBase = watch(`currencies.${index}.currency_code`);
        setBaseCurrency(newBase);
        fields.forEach((_, i) => setValue(`currencies.${i}.base`, newBase));
        setValue(`currencies.${index}.rate`, "1.000000");
    };

    // Pagination
    const totalPages = Math.ceil(fields.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedFields = fields.slice(start, start + ITEMS_PER_PAGE);

    const inputClass =
        "bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-lg h-8 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all";

    return (
        <DashboardLayout
            title="Currency Rates"
            description="Manage exchange rates for your application"
        >
            <div className="max-w-6xl mx-auto space-y-2">

                {/* ── Status Alert ── */}
                {status && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 mb-6 ${status.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                        <div className={`absolute inset-0 opacity-10 ${status.success ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-rose-400 to-pink-400"}`} />
                        <div className="relative">
                            <h3 className={`font-semibold text-sm mb-0.5 ${status.success ? "text-emerald-900" : "text-rose-900"}`}>
                                {status.success ? "Success" : "Something went wrong"}
                            </h3>
                            <p className={`text-sm ${status.success ? "text-emerald-700" : "text-rose-700"}`}>
                                {status.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Header Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SectionHeader
                            icon={DollarSign}
                            title="Exchange Rates"
                            description={`${currencies.length} currenc${currencies.length !== 1 ? "ies" : "y"} · Base: ${baseCurrency}`}
                        />
                        <Button
                            onClick={handleUpdateCurrencyRates}
                            disabled={updateLoading || fetchLoading}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-sm cursor-pointer"
                        >
                            {updateLoading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" />Updating…</>
                            ) : (
                                <><RefreshCw className="w-4 h-4" />Fetch Latest Rates</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* ── Connector ── */}
                <div className="flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {fetchLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <DollarSign className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-1">No currencies loaded</h3>
                            <p className="text-xs text-slate-500 mb-4">Fetch the latest rates to populate the table.</p>
                            <Button
                                onClick={handleUpdateCurrencyRates}
                                disabled={updateLoading}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />Fetch Rates
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pl-6 w-28">Code</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Description</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 w-44 text-right pr-4">Exchange Rate</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pr-6 text-center w-20">Base</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedFields.map((field, localIdx) => {
                                            const index = start + localIdx;
                                            const isBase = watch(`currencies.${index}.isBase`);

                                            return (
                                                <TableRow key={field.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">

                                                    {/* Code */}
                                                    <TableCell className="py-3.5 pl-6">
                                                        <input
                                                            {...register(`currencies.${index}.currency_code`)}
                                                            maxLength={3}
                                                            style={{ textTransform: "uppercase" }}
                                                            className={`${inputClass} w-16 text-center font-mono font-semibold`}
                                                        />
                                                        {errors.currencies?.[index]?.currency_code && (
                                                            <p className="text-xs text-rose-500 mt-1">
                                                                {errors.currencies[index]?.currency_code?.message}
                                                            </p>
                                                        )}
                                                    </TableCell>

                                                    {/* Description */}
                                                    <TableCell className="py-3.5">
                                                        <input
                                                            {...register(`currencies.${index}.description`)}
                                                            placeholder="—"
                                                            className={`${inputClass} w-full`}
                                                        />
                                                    </TableCell>

                                                    {/* Rate */}
                                                    <TableCell className="py-3.5 pr-4">
                                                        <input
                                                            {...register(`currencies.${index}.rate`)}
                                                            type="text"
                                                            placeholder="1.000000"
                                                            disabled={isBase}
                                                            {...(isBase ? { value: "1.000000" } : {})}
                                                            className={`${inputClass} w-full text-right font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        />
                                                        {errors.currencies?.[index]?.rate && (
                                                            <p className="text-xs text-rose-500 mt-1">
                                                                {errors.currencies[index]?.rate?.message}
                                                            </p>
                                                        )}
                                                    </TableCell>

                                                    {/* Base checkbox */}
                                                    <TableCell className="py-3.5 pr-6 text-center">
                                                        <input
                                                            type="checkbox"
                                                            {...register(`currencies.${index}.isBase`)}
                                                            onChange={(e) => {
                                                                setValue(`currencies.${index}.isBase`, e.target.checked);
                                                                handleBaseChange(index, e.target.checked);
                                                            }}
                                                            className="h-4 w-4 accent-teal-600 cursor-pointer"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        Showing{" "}
                                        <span className="font-medium text-slate-700">{start + 1}</span>–
                                        <span className="font-medium text-slate-700">
                                            {Math.min(start + ITEMS_PER_PAGE, fields.length)}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-slate-700">{fields.length}</span> currencies
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
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
                                                        type="button"
                                                        onClick={() => setCurrentPage(p as number)}
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
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Footer info bar ── */}
                            <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-xs text-slate-400">
                                    Rates are relative to base currency{" "}
                                    <span className="font-semibold text-slate-600">{baseCurrency}</span>
                                </p>
                                <p className="text-xs text-slate-400">{currencies.length} currencies loaded</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}