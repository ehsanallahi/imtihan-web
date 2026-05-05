
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    className: "bg-blue-50 text-blue-700 border-blue-100",
    iconClassName: "animate-spin",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-teal-50 text-teal-700 border-teal-100",
  },
  FAILED: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-crimson-50 text-crimson-700 border-crimson-100",
  },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
      config.className
    )}>
      <Icon className={cn("h-3.5 w-3.5", config.iconClassName)} />
      {config.label}
    </div>
  );
}
