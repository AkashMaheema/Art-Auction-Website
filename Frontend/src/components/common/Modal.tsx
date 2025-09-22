import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-lg bg-white shadow-xl
                        max-h-[90vh] flex flex-col"
        >
          {" "}
          {/* <= max height + column layout */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {/* Scroll only the body */}
          <div className="p-4 overflow-y-auto">
            {" "}
            {/* <= vertical scroll here */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
