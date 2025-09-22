"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ConfirmationDialogProps {
	children?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive";
	onConfirm: () => void | Promise<void>;
}

export function ConfirmationDialog({
	children,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
	onConfirm,
}: ConfirmationDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	// Use controlled state if provided, otherwise use internal state
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const onOpenChange = controlledOnOpenChange || setInternalOpen;

	const handleConfirm = async () => {
		await onConfirm();
		onOpenChange(false);
	};

	const dialogContent = (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				<AlertDialogDescription>{description}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>{cancelText}</AlertDialogCancel>
				<AlertDialogAction
					onClick={handleConfirm}
					className={
						variant === "destructive"
							? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
							: ""
					}
				>
					{confirmText}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);

	// If children are provided, use trigger pattern
	if (children) {
		return (
			<AlertDialog open={open} onOpenChange={onOpenChange}>
				<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
				{dialogContent}
			</AlertDialog>
		);
	}

	// Otherwise, use controlled pattern
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{dialogContent}
		</AlertDialog>
	);
}
