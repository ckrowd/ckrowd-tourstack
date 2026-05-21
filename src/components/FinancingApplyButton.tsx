"use client";

import { useState } from "react";
import FinancingApplyModal, {
	type ProductId,
} from "@/components/FinancingApplyModal";

export default function FinancingApplyButton({
	defaultProduct,
	applicantName,
	className,
	children,
}: {
	defaultProduct: ProductId;
	applicantName?: string;
	className?: string;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={className}
			>
				{children}
			</button>
			{open && (
				<FinancingApplyModal
					defaultProduct={defaultProduct}
					applicantName={applicantName}
					onClose={() => setOpen(false)}
				/>
			)}
		</>
	);
}
