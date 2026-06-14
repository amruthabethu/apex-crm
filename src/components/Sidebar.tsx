import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  darkMode,
  onToggleDarkMode
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Lead Management", icon: Users },
    { id: "add-lead", label: "Add New Lead", icon: UserPlus },
    { id: "settings", label: "CRM Settings", icon: Settings }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-colors duration-200">
      {/* Brand & Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
        <div 
          onClick={() => handleNavClick("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-slate-900 dark:text-white leading-none">Apex CRM</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider uppercase font-medium mt-1">Lead Suite v1.2</p>
          </div>
        </div>
        {mobileOpen && (
          <button 
            id="close-mobile-menu"
            onClick={() => setMobileOpen(false)} 
            className="md:hidden text-slate-400 hover:text-slate-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Admin Quick Profile */}
      <div className="p-4 mx-4 mt-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm tracking-tight border border-indigo-200/20">
            {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "AD"}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || "Administrator"}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
              }`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900 space-y-2">
        {/* Theme Toggle Button */}
        <button
          id="theme-toggler"
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors"
        >
          <span className="flex items-center gap-3">
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-slate-400 border border-slate-200/40 dark:border-slate-800">
            ALT
          </span>
        </button>

        {/* Security Logout */}
        <button
          id="btn-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Complete Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar bar */}
      <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 px-4 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="font-sans font-bold text-slate-900 dark:text-white text-base">Apex CRM</span>
        </div>
        <button
          id="open-mobile-menu"
          onClick={() => setMobileOpen(true)}
          className="p-1 px-2 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop Sidebar Static Grid */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMobileOpen(false)} 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="relative flex flex-col w-full max-w-xs h-full z-50 animate-slideRight">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
