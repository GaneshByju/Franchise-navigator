import React, { useState } from 'react';
import { User } from '../../types';
import {
  LayoutDashboard,
  Search,
  Calculator,
  TrendingUp,
  FileCheck,
  Briefcase,
  DollarSign,
  MessageSquare,
  CreditCard,
  UserCheck,
  Store,
  Users,
  MapPin,
  FolderLock,
  History,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  GitCompare,
  Award,
  Headphones
} from 'lucide-react';


interface NavGroup {
  groupTitle: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: number;
    isHighlight?: boolean;
  }[];
}

interface DashboardLayoutProps {
  currentUser: User;
  activeTab: string;
  listingsCount?: number;
  listingStatus?: string;
  onTabChange?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onRequireListing?: () => void;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  activeTab,
  listingsCount = 0,
  listingStatus,
  onTabChange,
  onSelectTab,
  onRequireListing,
  onLogout,
  unreadMessagesCount = 0,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleTabSelect = (tabId: string) => {
    // If Franchiser has 0 listings and tries to access downstream sections (documents is standard, not restricted!)
    if (
      currentUser.role === 'franchiser' &&
      listingsCount === 0 &&
      ['applications', 'partners', 'territories'].includes(tabId)
    ) {
      alert('⚡ Listing Required First: Please publish your first franchise opportunity to unlock territory management, investor applications, and active franchisee management.');
      if (onRequireListing) onRequireListing();
      return;
    }

    if (onSelectTab) onSelectTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const investorGroups: NavGroup[] = [
    {
      groupTitle: 'Core Workspace',
      items: [
        { id: 'dashboard', label: 'Investor Dashboard', icon: LayoutDashboard },
        { id: 'discover', label: 'Franchise Marketplace', icon: Search },
      ],
    },
    {
      groupTitle: 'Decision Engine & Analytics',
      items: [
        { id: 'feasibility', label: 'Feasibility DSS Engine', icon: Calculator, isHighlight: true },
        { id: 'compare', label: 'Brand Comparison Matrix', icon: GitCompare, isHighlight: true },
        { id: 'investment-analysis', label: 'Investment & ROI Analysis', icon: TrendingUp },
      ],
    },
    {
      groupTitle: 'Portfolio & Legal Workflow',
      items: [
        { id: 'messages', label: 'Deal Chat & Messages', icon: MessageSquare, isHighlight: true },
        { id: 'applications', label: 'My Applications', icon: FileCheck },
        { id: 'portfolio', label: 'My Portfolio & Units', icon: Briefcase },
        { id: 'contracts', label: 'Contracts & E-Sign', icon: Award },
      ],
    },

    {
      groupTitle: 'Account & Membership',
      items: [
        { id: 'subscription', label: 'Investor Plan', icon: CreditCard },
        { id: 'profile', label: 'Investor Profile', icon: UserCheck },
      ],
    },
  ];

  const isPendingApprovalPhase = listingStatus === 'Pending Approval' || listingStatus === 'Under Review' || listingStatus === 'Draft';
  const isDocPhase = listingStatus === 'Documents Required' || listingStatus === 'Document Audit Pending';

  const franchiserGroups: NavGroup[] = listingsCount === 0
    ? [
        {
          groupTitle: 'Brand Onboarding',
          items: [
            { id: 'dashboard', label: 'Overview & Stepper', icon: LayoutDashboard },
            { id: 'listings', label: '+ Publish Franchise Listing', icon: Store, isHighlight: true },
          ],
        },
        {
          groupTitle: 'Compliance Vault',
          items: [
            { id: 'documents', label: 'Licenses & Documents', icon: FileCheck },
          ],
        },
        {
          groupTitle: 'Administration & Helpdesk',
          items: [
            { id: 'support', label: 'Contact Admin & Support', icon: Headphones, isHighlight: true },
          ],
        },
      ]
    : isPendingApprovalPhase
    ? [
        {
          groupTitle: 'Brand Overview',
          items: [
            { id: 'dashboard', label: 'Franchiser Overview', icon: LayoutDashboard },
            { id: 'listings', label: 'My Franchise Listing', icon: Store },
          ],
        },
        {
          groupTitle: 'Investor Deal Pipeline',
          items: [
            { id: 'messages', label: 'Investor Messages & Chat', icon: MessageSquare, isHighlight: true },
          ],
        },
        {
          groupTitle: 'Operations & Compliance',
          items: [
            { id: 'documents', label: 'Licenses & Documents', icon: FileCheck },
            { id: 'territories', label: 'Territory Management', icon: MapPin },
          ],
        },
        {
          groupTitle: 'Platform Billing & Fees',
          items: [
            { id: 'franchiser-billing', label: 'Listing Packages & Fees', icon: CreditCard },
          ],
        },
        {
          groupTitle: 'Administration & Helpdesk',
          items: [
            { id: 'support', label: 'Contact Admin & Support', icon: Headphones, isHighlight: true },
          ],
        },
      ]
    : isDocPhase
    ? [
        {
          groupTitle: 'Brand Overview',
          items: [
            { id: 'dashboard', label: 'Franchiser Overview', icon: LayoutDashboard },
            { id: 'listings', label: 'My Franchise Listing', icon: Store },
          ],
        },
        {
          groupTitle: 'Investor Deal Pipeline',
          items: [
            { id: 'messages', label: 'Investor Messages & Chat', icon: MessageSquare, isHighlight: true },
          ],
        },
        {
          groupTitle: 'Operations & Compliance',
          items: [
            { id: 'documents', label: 'Licenses & Documents', icon: FileCheck },
            { id: 'territories', label: 'Territory Management', icon: MapPin },
          ],
        },
        {
          groupTitle: 'Platform Billing & Fees',
          items: [
            { id: 'franchiser-billing', label: 'Listing Packages & Fees', icon: CreditCard },
          ],
        },
        {
          groupTitle: 'Administration & Helpdesk',
          items: [
            { id: 'support', label: 'Contact Admin & Support', icon: Headphones, isHighlight: true },
          ],
        },
      ]
    : [
        {
          groupTitle: 'Brand Overview',
          items: [
            { id: 'dashboard', label: 'Franchiser Overview', icon: LayoutDashboard },
            { id: 'listings', label: 'My Franchise Listings', icon: Store },
          ],
        },
        {
          groupTitle: 'Investor Deal Pipeline',
          items: [
            { id: 'messages', label: 'Investor Messages & Chat', icon: MessageSquare, isHighlight: true },
            { id: 'applications', label: 'Investor Applications', icon: FileCheck },
            { id: 'partners', label: 'Active Franchisees', icon: Users },
          ],
        },

        {
          groupTitle: 'Operations & Compliance',
          items: [
            { id: 'territories', label: 'Territory Management', icon: MapPin },
            { id: 'documents', label: 'Licenses & Documents', icon: FileCheck },
          ],
        },
        {
          groupTitle: 'Platform Billing & Fees',
          items: [
            { id: 'franchiser-billing', label: 'Listing Packages & Fees', icon: CreditCard },
          ],
        },
        {
          groupTitle: 'Administration & Helpdesk',
          items: [
            { id: 'support', label: 'Contact Admin & Support', icon: Headphones, isHighlight: true },
          ],
        },
      ];

  const adminGroups: NavGroup[] = [
    {
      groupTitle: 'Command Center',
      items: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: 'Platform Governance',
      items: [
        { id: 'admin-franchises', label: 'Franchise Directory', icon: Store },
        { id: 'admin-revenue', label: 'Platform Financials', icon: DollarSign },
      ],
    },
    {
      groupTitle: 'Inquiries & Statutory Revisions',
      items: [
        { id: 'admin-support', label: 'Franchiser Inquiries & Quotas', icon: Headphones, isHighlight: true },
      ],
    },
    {
      groupTitle: 'Security & Audit',
      items: [
        { id: 'admin-audit', label: 'Audit Trail Logs', icon: History },
      ],
    },
  ];


  const currentGroups =
    currentUser.role === 'investor'
      ? investorGroups
      : currentUser.role === 'franchiser'
      ? franchiserGroups
      : adminGroups;

  const roleTheme =
    currentUser.role === 'investor'
      ? { badge: 'bg-blue-50 text-blue-700 border-blue-200', active: 'bg-blue-600 text-white font-bold shadow-sm' }
      : currentUser.role === 'franchiser'
      ? { badge: 'bg-amber-50 text-amber-700 border-amber-200', active: 'bg-amber-600 text-white font-bold shadow-sm' }
      : { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 text-white font-bold shadow-sm' };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-13 sm:h-14 flex items-center justify-between px-4 sm:px-6 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => handleTabSelect('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-2xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 text-sm tracking-tight leading-none block">
                FranchiseDSS
              </span>
              <span className="text-[9px] font-extrabold tracking-wider text-blue-600 block uppercase mt-0.5">
                {currentUser.role.toUpperCase()} PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Center space */}
        <div className="flex-1" />

        {/* Right actions & profile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser.role !== 'admin' && (
            <button
              onClick={() => handleTabSelect('messages')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-xs font-bold border shadow-xs ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Open Direct Messages & Deal Chat"
            >
              <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'messages' ? 'text-white' : 'text-blue-600'}`} />
              <span className="hidden sm:inline">Deal Chat</span>
            </button>
          )}

          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${roleTheme.badge}`}>
            {currentUser.role}
          </span>

          {currentUser.role === 'admin' ? (
            /* Admin: plain non-interactive name badge — no dropdown */
            <div className="flex items-center gap-2 p-1.5 pl-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center border border-emerald-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fade-scale">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-slate-500 truncate text-[11px]">{currentUser.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 uppercase">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleTabSelect('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-semibold"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Edit Profile & Preferences
                  </button>

                  <button
                    onClick={() => {
                      handleTabSelect('subscription');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-semibold"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Subscription & Billing
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out to Public View
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* CONTROL CENTER SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="px-5 pt-4 pb-2 border-b border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Control Center
            </span>
            <h3 className="text-xs font-bold text-slate-900 mt-0.5 capitalize">
              {currentUser.role} Workspace
            </h3>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-4 font-sans">
            {currentGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 py-1">
                  {group.groupTitle}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabSelect(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-left transition-all duration-150 ${
                        isActive
                          ? roleTheme.active
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.isHighlight ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="truncate leading-snug">{item.label}</span>
                      </div>

                      {currentUser.role === 'franchiser' && listingsCount === 0 && ['applications', 'partners', 'territories', 'documents'].includes(item.id) && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[9px] font-black uppercase tracking-wider shrink-0 border border-amber-300">
                          🔒 Required
                        </span>
                      )}

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT VIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-scale">
          {children}
        </main>
      </div>
    </div>
  );
};
