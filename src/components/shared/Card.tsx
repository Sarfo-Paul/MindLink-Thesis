import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

