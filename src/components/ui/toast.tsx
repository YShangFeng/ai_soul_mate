"use client";

import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast(props: ToastProps): void;
function toast(title: string, description?: string): void;
function toast(propsOrTitle: string | ToastProps, description?: string): void {
  if (typeof propsOrTitle === "string") {
    sonnerToast(propsOrTitle, { description });
  } else {
    const { title, description: desc, variant } = propsOrTitle;
    if (variant === "destructive") {
      sonnerToast.error(title ?? "", { description: desc });
    } else {
      sonnerToast(title ?? "", { description: desc });
    }
  }
}

export { toast };
export type { ToastProps };
