import { WithdrawStatus } from "@/store/dexie/db";
import { Check, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface StepInfo {
  name: WithdrawStatus;
  label: string;
  link?: string;
}

interface WithdrawTxStatusProps {
  currentStep: WithdrawStatus;
  withdrawalHash?: string;
  proveHash?: string;
  finalizeHash?: string;
}

const steps: StepInfo[] = [
  { name: "initiating", label: "Requesting withdraw" },
  { name: "initiated", label: "Initiating" },
  { name: "ready_to_prove", label: "Waiting until ready to prove" },
  { name: "proving", label: "Proving" },
  { name: "proved", label: "Waiting for proof" },
  { name: "finalizing", label: "Finalizing" },
];

export default function WithdrawTxStatus({
  currentStep,
  withdrawalHash,
  proveHash,
  finalizeHash,
}: WithdrawTxStatusProps) {
  const link = (step: WithdrawStatus) => {
    switch (step) {
      case "initiating":
        if (!withdrawalHash) return "";
        return `${process.env.NEXT_PUBLIC_L2_EXPLORER_URL}/tx/${withdrawalHash}`;
      case "proving":
        if (!proveHash) return "";
        return `${process.env.NEXT_PUBLIC_L1_EXPLORER_URL}/tx/${proveHash}`;
      case "finalizing":
        if (!finalizeHash) return "";
        return `${process.env.NEXT_PUBLIC_L1_EXPLORER_URL}/tx/${finalizeHash}`;
      default:
        return "";
    }
  };

  if (!steps || steps.length === 0) {
    return <div className="text-destructive">Error: No steps provided</div>;
  }

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.name === currentStep);

  return (
    <div className="w-full max-w-md mx-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-5">
      <div className="space-y-3 relative">
        {steps.map((step, index) => {
          const stepIndex = getCurrentStepIndex();
          let status: "completed" | "current" | "upcoming" = "upcoming";

          if (index <= stepIndex) {
            status = "completed";
          } else if (index === stepIndex + 1) {
            status = "current";
          }

          return (
            <div key={step.name} className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status === "completed"
                      ? "bg-primary text-primary-foreground"
                      : status === "current"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "completed" ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : status === "current" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-6 bottom-0 w-0.5 -ml-px bg-border" />
                )}
              </div>
              <div className="flex-grow pt-1">
                <p
                  className={`text-sm font-medium ${
                    status === "completed"
                      ? "text-secondary-foreground font-semibold dark:text-primary"
                      : status === "current"
                      ? "text-secondary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {link(step.name) && (
                  <Link
                    href={link(step.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-foreground dark:text-primary hover:opacity-60 dark:hover:opacity-80 flex items-center text-xs mt-1"
                  >
                    View details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
