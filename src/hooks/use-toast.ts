"use client";

import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  title: string;
  description?: string;
}

export function useToast() {
  return {
    toast: ({ title, description }: ToastOptions) => {
      sonnerToast(title, { description });
    },
    success: (title: string, description?: string) => {
      sonnerToast.success(title, { description });
    },
    error: (title: string, description?: string) => {
      sonnerToast.error(title, { description });
    },
    dismiss: () => {
      sonnerToast.dismiss();
    },
  };
}
