// src/components/MobileWarning.tsx
import React, { useEffect, useState } from "react";

export const MobileWarning: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkScreenSize(); // Run on mount
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-md shadow-md max-w-sm text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Mobile Not Supported</h2>
        <p className="text-gray-700">
          This game is best experienced on a tablet, desktop or larger screen. Please switch to a bigger device.
        </p>
      </div>
    </div>
  );
};
