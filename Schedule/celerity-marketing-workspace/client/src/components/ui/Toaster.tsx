import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const COLORS = {
  success: "text-teal-700 bg-teal-50 border-teal-200",
  error: "text-red-700 bg-red-50 border-red-200",
  info: "text-brand-700 bg-brand-50 border-brand-200",
};

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium shadow-popover animate-slide-in-right",
              COLORS[toast.kind]
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{toast.text}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
