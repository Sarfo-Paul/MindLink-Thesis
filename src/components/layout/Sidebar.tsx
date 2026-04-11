import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import {
  DashboardIcon,
  SessionIcon,
  PsychologistsIcon,
  CalendarIcon,
  JournalIcon,
  GamesIcon,
  ChatIcon,
  LogoutIcon,
  ChevronLeftIcon,
} from "../icons";
import { NavItem } from "../shared/NavItem";
import { logout } from "../../redux/slices/auth-slice/authSlice";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle, isMobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    if (onMobileMenuClose) onMobileMenuClose();
  };

  const navItems = [
    { icon: <DashboardIcon className="w-5 h-5" />, label: "Home", to: "/home" },
    { icon: <GamesIcon className="w-5 h-5" />, label: "Cognitive Games", to: "/games" },
    { icon: <ChatIcon className="w-5 h-5" />, label: "Chat", to: "/chat" },
    { icon: <PsychologistsIcon className="w-5 h-5" />, label: "Support Network", to: "/psychologists" },
    { icon: <SessionIcon className="w-5 h-5" />, label: "My Session", to: "/sessions" },
    { icon: <CalendarIcon className="w-5 h-5" />, label: "Calendar", to: "/calendar" },
    { icon: <JournalIcon className="w-5 h-5" />, label: "Journal", to: "/journal" },
  ];

  const user = useSelector((state: RootState) => state.auth?.user);
  if (user?.role === "PRACTITIONER") {
    navItems.splice(1, 0, { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, label: "Triage Queue", to: "/practitioner" });
  } else if (user?.role === "VOLUNTEER") {
    navItems.splice(1, 0, { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, label: "Triage Queue", to: "/volunteer" });
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white flex flex-col z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-purple-600">MindLink</h1>
          <button onClick={onMobileMenuClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close menu">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} isCollapsed={false} onClick={onMobileMenuClose} />
          ))}
        </nav>
        <div className="p-3">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={handleLogout}>
            <LogoutIcon className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 h-screen bg-white flex flex-col z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && <h1 className="text-2xl font-semibold text-purple-600">MindLink</h1>}
          {isCollapsed && <div className="flex-1" />}
          <button onClick={onToggle} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <ChevronLeftIcon className={`w-5 h-5 text-gray-700 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-hidden">
          {navItems.map((item) => (
            <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors`}
          >
            <LogoutIcon className="w-5 h-5" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
