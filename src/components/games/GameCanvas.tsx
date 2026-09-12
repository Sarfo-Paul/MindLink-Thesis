import React from "react";

export const GameCanvas: React.FC<{ children: React.ReactNode; gameTitle: string }> = ({ children }) => (
  <div className="relative w-full h-full rounded-md">
    {children}
  </div>
);
