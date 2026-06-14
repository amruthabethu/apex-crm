import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadsList from "./pages/LeadsList";
import AddLead from "./pages/AddLead";
import LeadDetails from "./pages/LeadDetails";
import Settings from "./pages/Settings";
import { Toast, ToastMessage, ToastType } from "./components/Toast";

function CRMContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Custom SPA router state
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // App floating toasts stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark light mode toggle state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_theme_dark");
    return saved === "true";
  });

  // Toggle theme class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("crm_theme_dark", darkMode.toString());
  }, [darkMode]);

  // Handle auto redirection if auth is complete
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage("login");
    } else if (currentPage === "login") {
      setCurrentPage("dashboard");
    }
  }, [isAuthenticated]);

  // Toast trigger hook helper
  const triggerToast = (message: string, type: ToastType) => {
    const freshToast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, freshToast]);
  };

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigates to a specific screen
  const handleNavigateToPage = (targetPage: string) => {
    setCurrentPage(targetPage);
    setSelectedLeadId(null);
  };

  // Selects and inspects single lead
  const handleSelectLeadToInspect = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentPage("lead-details");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors gap-3">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Synchronizing secure session...</span>
      </div>
    );
  }

  // Not Authenticated -> Force Login exclusively
  if (!isAuthenticated) {
    return (
      <>
        <Login onShowToast={triggerToast} />
        
        {/* Floating Toasts container */}
        <div className="fixed bottom-5 right-5 z-55 max-w-sm flex flex-col items-end">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={handleCloseToast} />
          ))}
        </div>
      </>
    );
  }

  // Router component solver
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            onNavigate={handleNavigateToPage} 
            onSelectLead={handleSelectLeadToInspect} 
            onShowToast={triggerToast}
            darkMode={darkMode}
          />
        );
      case "leads":
        return (
          <LeadsList 
            onSelectLead={handleSelectLeadToInspect} 
            onNavigate={handleNavigateToPage}
            onShowToast={triggerToast}
          />
        );
      case "add-lead":
        return (
          <AddLead 
            onNavigate={handleNavigateToPage} 
            onShowToast={triggerToast} 
          />
        );
      case "lead-details":
        return selectedLeadId ? (
          <LeadDetails 
            leadId={selectedLeadId} 
            onNavigate={handleNavigateToPage} 
            onShowToast={triggerToast} 
          />
        ) : (
          <LeadsList 
            onSelectLead={handleSelectLeadToInspect} 
            onNavigate={handleNavigateToPage}
            onShowToast={triggerToast}
          />
        );
      case "settings":
        return (
          <Settings 
            darkMode={darkMode} 
            onToggleDarkMode={() => setDarkMode(!darkMode)} 
            onShowToast={triggerToast} 
          />
        );
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigateToPage} 
            onSelectLead={handleSelectLeadToInspect} 
            onShowToast={triggerToast}
            darkMode={darkMode}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Sidebar navigation system */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigateToPage} 
        darkMode={darkMode} 
        onToggleDarkMode={() => setDarkMode(!darkMode)} 
      />

      {/* Main CRM Workspace Area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Floating Active Toasts Stack (Fixed bottom-right so it works great inline inside iframe) */}
      <div className="fixed bottom-5 right-5 z-55 max-w-sm flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={handleCloseToast} />
          ))}
        </div>
      </div>

    </div>
  );
}

// Global wrap over Auth context provider
export default function App() {
  return (
    <AuthProvider>
      <CRMContent />
    </AuthProvider>
  );
}
