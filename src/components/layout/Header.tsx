import { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BellIcon, SearchIcon, MenuIcon } from "../icons";
import { getTimeBasedGreeting } from "../../utils/greeting";
import { logout } from "../../redux/slices/auth-slice/authSlice";
import type { RootState } from "../../redux/store";

interface HeaderProps {
  userName: string;
  onMobileMenuToggle?: () => void;
}

export function Header({ userName, onMobileMenuToggle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth!);
  const isDashboard = location.pathname === "/home";
  const isChat = location.pathname === "/chat";
  const { greeting, icon } = getTimeBasedGreeting();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDesktop = desktopDropdownRef.current?.contains(target);
      const isInsideMobile = mobileDropdownRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      setTimeout(() => document.addEventListener("click", handleClickOutside, true), 0);
    }
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [isProfileDropdownOpen]);

  const initial = (user?.username || userName || "M")[0].toUpperCase();

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      {/* Desktop Layout */}
      <div className={`hidden sm:flex items-center gap-4 ${isDashboard ? 'justify-between' : 'justify-end'}`}>
        {isDashboard && (
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {greeting}{user?.username || userName ? `, ${user?.username || userName}` : ''}!
            </h2>
            {icon}
          </div>
        )}
        <div className="flex items-center gap-4">
          {!isChat && (
            <>
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-700" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </>
          )}
          <div className="relative" ref={desktopDropdownRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}
              className="hover:opacity-80 transition-opacity"
              aria-label="Profile menu"
            >
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">{initial}</span>
              </div>
            </button>
            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile</Link>
                <Link to="/settings" onClick={() => setIsProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Settings</Link>
                <div className="border-t border-gray-200 my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                >Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden flex-col gap-3">
        <div className="flex items-center justify-between">
          <button onClick={onMobileMenuToggle} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Open menu">
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            {!isChat && (
              <>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><SearchIcon className="w-5 h-5 text-gray-700" /></button>
                <div className="relative">
                  <BellIcon className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </>
            )}
            <div className="relative" ref={mobileDropdownRef}>
              <button onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }} className="hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">{initial}</span>
                </div>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]"
                  onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile</Link>
                  <Link to="/settings" onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Settings</Link>
                  <div className="border-t border-gray-200 my-1" />
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}>Log Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {isDashboard && (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{greeting}{user?.username || userName ? `, ${user?.username || userName}` : ''}!</h2>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
