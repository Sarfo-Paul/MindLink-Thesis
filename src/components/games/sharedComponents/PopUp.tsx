// components/CustomModal.tsx
import React, { useEffect } from "react";
import classNames from "classnames";
import { FaTimesCircle } from "react-icons/fa";

type ModalType = "success" | "error" | "warning" | "info";

interface PopUpProps {
  isOpen: boolean;
  type?: ModalType;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// const typeColors: Record<ModalType, string> = {
//   success: "bg-green-500",
//   error: "bg-red-500",
//   warning: "bg-yellow-500",
//   info: "bg-blue-500",
// };

export const PopUp: React.FC<PopUpProps> = ({
  isOpen,
  type = "info",
  title = "",
  message = "",
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl max-w-md w-full relative">
        {/* <div className={classNames("h-2 rounded-t-xl", typeColors[type])} /> */}
        <button
          className="absolute top-2 right-2 text-green-500 hover:text-green-700"
          onClick={onClose}
        >
          <FaTimesCircle size={30} />
        </button>

        <div className="p-5 text-center space-y-3">
          {title && <h2 className="text-2xl text-green-700 font-bold">{title}</h2>}
          {message && <p className="text-gray-700 text-lg font-bold">{message}</p>}

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={onConfirm ?? onClose}
              className={classNames(
                "px-4 py-2 text-white text-lg font-bold rounded hover:opacity-90",
                {
                  "bg-green-500": type === "success",
                  "bg-red-500": type === "error",
                  "bg-green-700 text-black": type === "warning",
                  "bg-blue-500": type === "info",
                }
              )}
            >
              {confirmText}
            </button>

            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black text-lg font-bold rounded hover:bg-gray-400"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
