"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	createFinancingProduct,
	deleteFinancingProduct,
	listFinancingProducts,
} from "@/app/actions";
import Loader from "@/components/Loader";

type Product = {
	id: string;
	name: string;
	max_amount_usd: number;
	is_active: boolean;
};

export default function FinancingProductsPanel() {
	const t = useTranslations("FinancingAdminSettingsPage.products");
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [maxAmount, setMaxAmount] = useState("");

	const query = useQuery({
		queryKey: ["financingProducts"],
		queryFn: () => listFinancingProducts(),
	});

	const createMutation = useMutation({
		mutationFn: (body: { name: string; max_amount_usd: number }) =>
			createFinancingProduct(body),
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setMaxAmount("");
				void queryClient.invalidateQueries({
					queryKey: ["financingProducts"],
				});
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteFinancingProduct(id),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({
					queryKey: ["financingProducts"],
				});
			}
		},
	});

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = name.trim();
		const amount = Number.parseInt(maxAmount, 10);
		if (!trimmed || !Number.isFinite(amount) || amount < 1) return;
		createMutation.mutate({ name: trimmed, max_amount_usd: amount });
	}

	const products = (
		query.data?.success ? (query.data.data ?? []) : []
	) as Product[];

	const createDone = createMutation.data?.success === true;
	const createFailed =
		createMutation.isSuccess && createMutation.data?.success === false;

	return (
		<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
			<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-4 pb-4 border-b border-outline-variant/20">
				{t("title")}
			</h3>

			{query.isLoading ? (
				<Loader size={36} />
			) : !query.data?.success ? (
				<p className="text-sm text-red-600 py-4">
					{query.data?.error || t("loadError")}
				</p>
			) : products.length === 0 ? (
				<p className="text-sm text-on-surface-variant py-4">{t("empty")}</p>
			) : (
				<div className="space-y-2 mb-5">
					{products.map((p) => (
						<div
							key={p.id}
							className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
						>
							<div>
								<p className="text-sm font-semibold text-on-surface">{p.name}</p>
								<p className="text-xs text-on-surface-variant">
									{t("maxLabel", {
										amount: `$${p.max_amount_usd.toLocaleString()}`,
									})}
								</p>
							</div>
							<button
								type="button"
								onClick={() => deleteMutation.mutate(p.id)}
								disabled={
									deleteMutation.isPending && deleteMutation.variables === p.id
								}
								className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-60"
							>
								{t("remove")}
							</button>
						</div>
					))}
				</div>
			)}

			<form onSubmit={submit} className="space-y-3 pt-4 border-t border-outline-variant/20">
				<label className="block">
					<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
						{t("nameLabel")}
					</span>
					<input
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={t("namePlaceholder")}
						className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
					/>
				</label>
				<label className="block">
					<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
						{t("maxAmountLabel")}
					</span>
					<input
						type="number"
						min={1}
						required
						value={maxAmount}
						onChange={(e) => setMaxAmount(e.target.value)}
						placeholder="50000"
						className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
					/>
				</label>
				{createDone && (
					<p className="text-sm text-emerald-700 font-medium" role="status">
						{t("createSuccess")}
					</p>
				)}
				{createFailed && (
					<p className="text-sm text-red-600 font-medium" role="alert">
						{createMutation.data?.error || t("createError")}
					</p>
				)}
				<button
					type="submit"
					disabled={createMutation.isPending}
					className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 disabled:opacity-60"
				>
					{createMutation.isPending ? t("creating") : t("createSubmit")}
				</button>
			</form>
		</div>
	);
}
