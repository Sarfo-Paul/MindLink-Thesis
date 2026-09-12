import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, to, isCollapsed = false, onClick }: NavItemProps) {
  const location = useLocation();
  const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors group`}
      title={isCollapsed ? label : undefined}
    >
      <div className={`p-2 rounded-full transition-colors ${
        active ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-gray-200'
      }`}>
        <span className={active ? "text-purple-600" : "text-gray-600"}>{icon}</span>
      </div>
      {!isCollapsed && (
        <span className={`text-sm font-medium ${active ? 'text-purple-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {label}
        </span>
      )}
    </Link>
  );
}
