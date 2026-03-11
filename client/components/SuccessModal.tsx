import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  autoClose?: number; // ms before auto close
}

export default function SuccessModal({
  isOpen,
  title = "Success!",
  message = "Your data has been saved successfully.",
  onClose,
  autoClose = 3000,
}: SuccessModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoClose);

    return () => clearTimeout(timer);
  }, [visible, autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 mx-4 w-full max-w-sm transform rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl transition-all duration-300",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Animated circle background */}
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur-lg transition-all duration-500",
                visible ? "scale-100" : "scale-0",
              )}
            />
            {/* Icon container */}
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg transition-all duration-500",
                visible ? "scale-100" : "scale-0",
              )}
            >
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          {title}
        </h2>

        {/* Message */}
        <p className="mb-6 text-center text-slate-300 leading-relaxed">
          {message}
        </p>

        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
            style={{
              animation: `progress ${autoClose}ms linear`,
            }}
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-green-400/30 blur-sm" />
        <div className="absolute bottom-4 left-4 h-1 w-1 rounded-full bg-green-400/20 blur-sm" />
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
