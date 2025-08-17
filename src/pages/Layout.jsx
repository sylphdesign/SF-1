
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Palette,
  Settings,
  Zap,
  ChevronRight,
  ChevronDown,
  Megaphone,
  Target,
  BoxSelect,
  LogOut
} from "lucide-react";
import { User } from "@/api/entities";
import OrganizationSwitcher from "./components/layout/OrganizationSwitcher";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Landing Pages",
    icon: FileText,
    items: [
      { title: "Pages", url: createPageUrl("Pages") },
      { title: "Templates", url: createPageUrl("Templates") },
      { title: "Funnel Creator", url: createPageUrl("FunnelCreator"), icon: BoxSelect }
    ]
  },
  {
    title: "Ads",
    icon: Megaphone,
    items: [
      { title: "Ad Campaigns", url: createPageUrl("AdCampaigns") },
      { title: "Ad Templates", url: createPageUrl("AdTemplates") }
    ]
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings
  },
];

const settingsItem = navigationItems.find(item => item.title === "Settings");
const mainNavItems = navigationItems.filter(item => item.title !== "Settings");

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['Landing Pages', 'Ads']);

  useEffect(() => {
    // Only run auth check once when component mounts
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setAuthChecked(true);
      
      // Handle authenticated user with no organization
      if (!currentUser.current_organization_id) {
        const urlParams = new URLSearchParams(window.location.search);
        const forceOrgSelection = urlParams.get('force') === 'true';
        
        if (!forceOrgSelection && currentPageName !== 'Auth') {
          navigate(createPageUrl("Auth"));
        }
      } else {
        // User is fully authenticated and has an org
        // If they're on Landing or Auth page, redirect to dashboard
        if (currentPageName === 'Landing') {
          navigate(createPageUrl("Pages"));
        }
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
      setAuthChecked(true);
      
      // No redirection here - let the render logic handle it
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await User.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear state and redirect
      setUser(null);
      setAuthChecked(false);
      // Hard redirect to clear all state
      window.location.href = '/Landing';
    }
  };

  // Always show children for these special pages
  if (['Builder', 'AdBuilder', 'Auth', 'Landing'].includes(currentPageName)) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to Landing
  if (!user) {
    navigate(createPageUrl("Landing"));
    return null;
  }

  // If user doesn't have an organization, redirect to Auth
  if (!user.current_organization_id) {
    navigate(createPageUrl("Auth"));
    return null;
  }

  // Show the full authenticated layout
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Fixed Position */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm fixed top-0 left-0 h-full z-30">

        {/* Top Part: Logo + Org Switcher */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">PageCraft AI</h2>
          </div>
           <OrganizationSwitcher />
        </div>

        {/* Middle Part: Navigation (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-2">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              // Check if this is a section with sub-items
              if (item.items) {
                const isExpanded = expandedSections.includes(item.title);
                const hasActiveItem = item.items.some(subItem => location.pathname === subItem.url);

                return (
                  <div key={item.title}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(item.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasActiveItem
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        {item.title}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Sub-items */}
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.items.map((subItem) => {
                          const isActive = location.pathname === subItem.url;
                          const SubItemIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.title}
                              to={subItem.url}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              {SubItemIcon && <SubItemIcon className="w-4 h-4" />}
                              {subItem.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              }
            })}
          </nav>
        </div>

        {/* Bottom Part: Settings + User Info + Logout */}
        <div className="p-4 border-t border-slate-200 space-y-4">
          {settingsItem && (
            <Link
              to={settingsItem.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === settingsItem.url
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <settingsItem.icon className="w-4 h-4" />
              {settingsItem.title}
            </Link>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - with margin to accommodate fixed sidebar */}
      <main className="flex-1 overflow-auto bg-slate-50 ml-64">
        {children}
      </main>
    </div>
  );
}
