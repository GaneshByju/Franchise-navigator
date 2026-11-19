import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, FranchiseListing, Category, Application, Contract } from './types';
import { api } from './services/api';
import { authStorage } from './utils/authStorage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldCheck, X } from 'lucide-react';

// Common Components
import { FranchiseDetailModal } from './components/common/FranchiseDetailModal';
import { CompareModal } from './components/common/CompareModal';
import { ApplyModal } from './components/common/ApplyModal';
import { DashboardLayout } from './components/common/DashboardLayout';
import { MessagingAndMeetingModal } from './components/common/MessagingAndMeetingModal';
import { DirectMessagingView } from './components/common/DirectMessagingView';





// Public Components
import { PublicNavbar } from './components/public/PublicNavbar';
import { LandingPage } from './components/public/LandingPage';
import { PublicDiscover } from './components/public/PublicDiscover';
import { AuthModal } from './components/public/AuthModal';

// Investor Components
import { InvestorDashboard } from './components/investor/InvestorDashboard';
import { FeasibilityDSS } from './components/investor/FeasibilityDSS';
import { InvestmentAnalysisView } from './components/investor/InvestmentAnalysisView';
import { InvestorApplicationsView } from './components/investor/InvestorApplicationsView';
import { InvestorPortfolioView } from './components/investor/InvestorPortfolioView';
import { InvestorContractsView } from './components/investor/InvestorContractsView';
import { InvestorSubscriptionView } from './components/investor/InvestorSubscriptionView';
import { InvestorProfileView } from './components/investor/InvestorProfileView';

// Franchiser Components
import { FranchiserDashboard } from './components/franchiser/FranchiserDashboard';
import { FranchiserListingsView } from './components/franchiser/FranchiserListingsView';
import { FranchiserApplicationsView } from './components/franchiser/FranchiserApplicationsView';
import { FranchiserPartnersView } from './components/franchiser/FranchiserPartnersView';
import { TerritoryManager } from './components/franchiser/TerritoryManager';
import { FranchiserDocumentsView } from './components/franchiser/FranchiserDocumentsView';
import { FranchiserBillingView } from './components/franchiser/FranchiserBillingView';
import { FranchiserSupportView } from './components/franchiser/FranchiserSupportView';
import { AddFranchiseModal } from './components/franchiser/AddFranchiseModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminFranchisesView } from './components/admin/AdminFranchisesView';
import { AdminPlatformRevenueView } from './components/admin/AdminPlatformRevenueView';
import { AdminAuditLogsView } from './components/admin/AdminAuditLogsView';
import { AdminSupportTicketsView } from './components/admin/AdminSupportTicketsView';

export default function App() {

  // Authentication & Demo User State (stored in sessionStorage to ensure strict per-tab isolation)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = authStorage.getUser();
    if (authStorage.isValidUser(user)) {
      return user;
    }
    authStorage.clearUser();
    return null;
  });

  // Navigation State with URL Hash Sync
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    return hash || 'dashboard';
  });
  const [publicView, setPublicView] = useState<'landing' | 'discover'>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    return hash === 'discover' ? 'discover' : 'landing';
  });

  // Core Data
  const [franchises, setFranchises] = useState<FranchiseListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicStats, setPublicStats] = useState({
    totalActiveFranchises: 0,
    verifiedFranchisers: 0,
    registeredInvestors: 0,
    successfulPartnerships: 0,
    totalInvestmentVolume: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseListing | null>(null);
  const [compareList, setCompareList] = useState<FranchiseListing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [applyFranchise, setApplyFranchise] = useState<FranchiseListing | null>(null);
  const [isAddFranchiseOpen, setIsAddFranchiseOpen] = useState<boolean>(false);
  const [dssPreselectedFranchise, setDssPreselectedFranchise] = useState<FranchiseListing | null>(null);

  // Messaging & Meeting Modal
  const [messagingModalOpen, setMessagingModalOpen] = useState<boolean>(false);
  const [messagingFranchise, setMessagingFranchise] = useState<FranchiseListing | null>(null);
  const [messagingTab, setMessagingTab] = useState<'chat' | 'meeting'>('chat');

  // Franchiser Support / Quota Revision State
  const [supportInitialListing, setSupportInitialListing] = useState<FranchiseListing | null>(null);

  // Direct Investor-Franchiser Chat State
  const [chatPreselectedFranchise, setChatPreselectedFranchise] = useState<FranchiseListing | null>(null);

  // User & tab tracking refs to enable safe browser back navigation lock
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isLoggingOutRef = useRef(false);

  // Modal tracking refs to enable safe browser back button handling
  const selectedFranchiseRef = useRef(selectedFranchise);
  selectedFranchiseRef.current = selectedFranchise;
  const isCompareOpenRef = useRef(isCompareOpen);
  isCompareOpenRef.current = isCompareOpen;
  const applyFranchiseRef = useRef(applyFranchise);
  applyFranchiseRef.current = applyFranchise;
  const authModalOpenRef = useRef(authModalOpen);
  authModalOpenRef.current = authModalOpen;
  const messagingModalOpenRef = useRef(messagingModalOpen);
  messagingModalOpenRef.current = messagingModalOpen;
  const isAddFranchiseOpenRef = useRef(isAddFranchiseOpen);
  isAddFranchiseOpenRef.current = isAddFranchiseOpen;

  // Protected session notification toast
  const [sessionLockToast, setSessionLockToast] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const triggerSessionLockToast = useCallback(() => {
    setSessionLockToast("🔒 You are securely signed in. Use the 'Sign Out' button to exit your session.");
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSessionLockToast(null);
    }, 4500);
  }, []);

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    if (window.location.hash !== `#/${tab}`) {
      window.history.pushState({ protectedSession: true, tab }, '', `#/${tab}`);
    }
  }, []);

  const navigatePublic = useCallback((view: 'landing' | 'discover') => {
    setPublicView(view);
    const targetHash = view === 'discover' ? '#/discover' : '#/';
    if (window.location.hash !== targetHash) {
      window.history.pushState({ view }, '', targetHash);
    }
  }, []);

  // Ensure history has a protected buffer whenever user is logged in
  useEffect(() => {
    if (currentUser && !isLoggingOutRef.current) {
      window.history.pushState(
        { protectedSession: true, tab: activeTab },
        '',
        window.location.hash || `#/${activeTab}`
      );
    }
  }, [currentUser]);

  // Listen for browser Back/Forward (popstate) to navigate views safely and lock authenticated session
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isLoggingOutRef.current) return;

      const user = currentUserRef.current || authStorage.getUser();

      // === AUTHENTICATED SESSION: PREVENT EXITING TO BLANK PAGE ON BACK BUTTON ===
      if (user) {
        // 1. If any modal is active, close it and stay in the current tab
        if (selectedFranchiseRef.current) {
          setSelectedFranchise(null);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }
        if (isCompareOpenRef.current) {
          setIsCompareOpen(false);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }
        if (applyFranchiseRef.current) {
          setApplyFranchise(null);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }
        if (authModalOpenRef.current) {
          setAuthModalOpen(false);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }
        if (messagingModalOpenRef.current) {
          setMessagingModalOpen(false);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }
        if (isAddFranchiseOpenRef.current) {
          setIsAddFranchiseOpen(false);
          window.history.pushState({ protectedSession: true, tab: activeTabRef.current }, '', `#/${activeTabRef.current}`);
          return;
        }

        // 2. If user is on a non-dashboard tab, take them back to 'dashboard'
        if (activeTabRef.current !== 'dashboard') {
          setActiveTab('dashboard');
          window.history.pushState({ protectedSession: true, tab: 'dashboard' }, '', '#/dashboard');
          return;
        }

        // 3. If user is already on 'dashboard', DO NOT let them exit to a blank page!
        // Lock history on dashboard and inform user to use Sign Out button
        window.history.pushState({ protectedSession: true, tab: 'dashboard' }, '', '#/dashboard');
        triggerSessionLockToast();
        return;
      }

      // === GUEST NAVIGATION ===
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (hash === 'discover' || e.state?.view === 'discover') {
        setPublicView('discover');
      } else {
        setPublicView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [triggerSessionLockToast]);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = currentUser?.role === 'admin';
      const isFranchiser = currentUser?.role === 'franchiser';
      const franchisePromise = isAdmin
        ? api.getAdminListings()
        : isFranchiser
        ? api.getFranchises({ franchiserId: currentUser.id })
        : api.getFranchises();

      const [franchiseRes, catRes, statsRes] = await Promise.all([
        franchisePromise,
        api.getCategories(),
        api.getPublicStats(),
      ]);

      if (franchiseRes.success && franchiseRes.data) {
        setFranchises(franchiseRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (statsRes && statsRes.success && statsRes.data) {
        setPublicStats(statsRes.data);
      }

      // Load user-specific datasets if logged in
      if (currentUser) {
        if (currentUser.role === 'investor') {
          const [appRes, contRes, portRes] = await Promise.all([
            api.getApplications({ investorId: currentUser.id }),
            api.getContracts({ userId: currentUser.id, role: 'investor' }),
            api.getInvestorPortfolio(currentUser.id),
          ]);
          if (appRes.success) setApplications(appRes.data);
          if (contRes.success) setContracts(contRes.data);
          if (portRes.success) setPortfolioData(portRes.data);
        } else if (currentUser.role === 'franchiser') {
          const [appRes, contRes] = await Promise.all([
            api.getApplications({ franchiserId: currentUser.id }),
            api.getContracts({ userId: currentUser.id, role: 'franchiser' }),
          ]);
          if (appRes.success) setApplications(appRes.data);
          if (contRes.success) setContracts(contRes.data);
        } else if (currentUser.role === 'admin') {
          try {
            const usersRes = await api.getUsers();
            if (usersRes.success && usersRes.data) {
              setAllUsers(usersRes.data);
            }
          } catch (e) {
            console.error('Failed to load admin users', e);
          }

          try {
            const [appRes, contRes] = await Promise.all([
              api.getApplications({}),
              api.getContracts({}),
            ]);
            if (appRes && appRes.success && appRes.data) setApplications(appRes.data);
            if (contRes && contRes.success && contRes.data) setContracts(contRes.data);
          } catch (e) {
            console.error('Failed to load admin applications/contracts', e);
          }
        }

        // Sync fresh profile state from backend
        try {
          const meRes = await api.getMe(currentUser.id);
          if (meRes.success && meRes.data && meRes.data.id === currentUser.id) {
            setCurrentUser((prev) => {
              if (!prev || prev.id !== meRes.data.id) return prev;
              if (prev.is_verified !== meRes.data.is_verified || prev.name !== meRes.data.name) {
                authStorage.setUser(meRes.data);
                return meRes.data;
              }
              return prev;
            });
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Switch User (Demo Perspective)
  const handleSwitchUser = async (role: 'investor' | 'franchiser' | 'admin' | 'guest') => {
    if (role === 'guest') {
      api.logout();
      authStorage.clearUser();
      setCurrentUser(null);
      navigatePublic('landing');
      setActiveTab('dashboard');
      return;
    }

    try {
      const res = await api.loginAsDemo(role);
      if (res.success && res.data) {
        authStorage.setUser(res.data.user);
        setCurrentUser(res.data.user);
        navigateToTab('dashboard');
      }
    } catch (e) {
      console.error('Failed demo login', e);
    }
  };

  const handleLoginSuccess = (user: User) => {
    isLoggingOutRef.current = false;
    authStorage.setUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
    window.history.pushState({ protectedSession: true, tab: 'dashboard' }, '', '#/dashboard');
  };

  useEffect(() => {
    if (currentUser) {
      authStorage.setUser(currentUser);
    }
  }, [currentUser]);

  const handleLogout = () => {
    isLoggingOutRef.current = true;
    api.logout();
    authStorage.clearUser();
    setCurrentUser(null);
    setPublicView('landing');
    setActiveTab('dashboard');
    window.location.hash = '#/';
    window.history.replaceState({ view: 'landing' }, '', '#/');
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 400);
  };

  // Compare List Management (Restricted to Registered Investor Profiles)
  const handleOpenCompare = () => {
    if (!currentUser) {
      alert('⚡ Investor Feature Required: The Brand Comparison Matrix is an exclusive feature reserved for registered Investor accounts. Please sign in or register an Investor account to access side-by-side financial comparison.');
      setAuthModalMode('register');
      setAuthModalOpen(true);
      return;
    }

    if (currentUser.role !== 'investor') {
      alert('The Brand Comparison Matrix is an exclusive feature designed for Investor accounts.');
      return;
    }

    setIsCompareOpen(true);
  };

  const handleToggleCompare = (franchise: FranchiseListing) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === franchise.id);
      if (exists) {
        return prev.filter((item) => item.id !== franchise.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 franchises simultaneously.');
        return prev;
      }
      return [...prev, franchise];
    });
  };

  const handleRemoveCompare = (franchiseId: number) => {
    setCompareList((prev) => prev.filter((item) => item.id !== franchiseId));
  };

  // Run Feasibility DSS Action (Restricted to Premium Investors)
  const handleRunFeasibility = (franchise?: FranchiseListing) => {
    setSelectedFranchise(null);
    setIsCompareOpen(false);

    if (!currentUser) {
      alert('The Feasibility DSS Engine is an exclusive tool reserved for Premium Investors. Please sign in or register a Premium Investor account to access personalized 5-factor feasibility scoring.');
      setAuthModalMode('register');
      setAuthModalOpen(true);
      return;
    }

    if (currentUser.role !== 'investor') {
      alert('The Feasibility DSS Engine is designed for Investor accounts.');
      return;
    }

    const plan = (currentUser.profile as any)?.plan_type || 'Standard';
    if (plan !== 'Premium' && plan !== 'Professional') {
      alert('⚡ Premium Feature Required: The Feasibility DSS Engine is restricted to Premium & Professional Investor subscribers. Please upgrade your subscription to unlock feasibility calculations.');
      setActiveTab('subscription');
      return;
    }

    if (franchise) {
      setDssPreselectedFranchise(franchise);
    }
    setActiveTab('feasibility');
  };

  // Open Apply Modal
  const handleApplyClick = (franchise: FranchiseListing) => {
    setSelectedFranchise(null);
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setApplyFranchise(franchise);
  };

  // Refresh User State after profile/subscription updates
  const handleRefreshUser = async (updatedUserData?: User) => {
    if (updatedUserData) {
      setCurrentUser(updatedUserData);
      authStorage.setUser(updatedUserData);
      return;
    }
    if (!currentUser) return;
    try {
      const res = await api.getMe(currentUser.id);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        authStorage.setUser(res.data);
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  // -------------------------------------------------------------
  // RENDER UNAUTHENTICATED / PUBLIC EXPERIENCE
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Public Navigation */}
        <PublicNavbar
          currentView={publicView === 'landing' ? 'home' : publicView}
          onNavigate={(view) => {
            if (view === 'home' || view === 'landing') navigatePublic('landing');
            else navigatePublic('discover');
          }}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'login');
            setAuthModalOpen(true);
            window.history.pushState({ modal: 'auth' }, '', window.location.hash || '#/');
          }}
          onOpenCompare={handleOpenCompare}
          onOpenFeasibility={() => handleRunFeasibility()}
        />

        {/* Public Views */}
        <main className="flex-1">
          <ErrorBoundary onReset={() => navigatePublic('landing')}>
            {publicView === 'discover' ? (
              <PublicDiscover
                franchises={franchises}
                categories={categories}
                currentUser={currentUser}
                onSelectFranchise={(f) => {
                  setSelectedFranchise(f);
                  if (f) window.history.pushState({ modal: 'detail', id: f.id }, '', window.location.hash || '#/');
                }}
                onApply={(f: FranchiseListing) => handleApplyClick(f)}
                onRunFeasibility={(f) => handleRunFeasibility(f)}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenCompareModal={handleOpenCompare}
              />
            ) : (
              <LandingPage
                stats={publicStats}
                featuredFranchises={franchises}
                categories={categories}
                onSearch={() => navigatePublic('discover')}
                onSelectFranchise={(f) => {
                  setSelectedFranchise(f);
                  if (f) window.history.pushState({ modal: 'detail', id: f.id }, '', window.location.hash || '#/');
                }}
                onNavigate={(view) => {
                  if (view === 'discover') navigatePublic('discover');
                  else navigatePublic('landing');
                }}
                onOpenAuth={(mode) => {
                  setAuthModalMode(mode || 'login');
                  setAuthModalOpen(true);
                  window.history.pushState({ modal: 'auth' }, '', window.location.hash || '#/');
                }}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenCompare={handleOpenCompare}
                onOpenFeasibility={() => handleRunFeasibility()}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Modals */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={handleLoginSuccess}
        />

        <FranchiseDetailModal
          isOpen={selectedFranchise !== null}
          onClose={() => setSelectedFranchise(null)}
          franchise={selectedFranchise}
          currentUser={currentUser}
          onApply={(f) => handleApplyClick(f)}
          onRunFeasibility={(f) => handleRunFeasibility(f)}
          isComparing={compareList.some((c) => c.id === selectedFranchise?.id)}
          onToggleCompare={(f) => handleToggleCompare(f)}
        />

        <CompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          compareList={compareList}
          allFranchises={franchises}
          onRemove={handleRemoveCompare}
          onAddCompare={handleToggleCompare}
          onSelectFranchise={(f) => {
            setSelectedFranchise(f);
            if (f) window.history.pushState({ modal: 'detail', id: f.id }, '', window.location.hash || '#/');
          }}
          onRunFeasibility={(f) => handleRunFeasibility(f)}
        />

        <ApplyModal
          isOpen={applyFranchise !== null}
          onClose={() => setApplyFranchise(null)}
          franchise={applyFranchise}
          currentUser={currentUser}
          onSuccess={loadData}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
            window.history.pushState({ modal: 'auth' }, '', window.location.hash || '#/');
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER AUTHENTICATED ROLE DASHBOARD
  // -------------------------------------------------------------
  const franchiserListings = franchises.filter((f) => {
    const fId = typeof f.franchiser === 'object'
      ? f.franchiser?.id
      : (f.franchiser_id !== undefined ? f.franchiser_id : f.franchiser);
    return Number(fId) === Number(currentUser?.id);
  });

  const handleOpenAddFranchise = () => {
    if (currentUser?.role === 'franchiser' && franchiserListings.length >= 1) {
      alert('🔒 1/1 Max Listing Limit Reached: You have already applied for or published a franchise listing. Each franchiser account is limited to 1 brand opportunity on the platform.');
      return;
    }
    setIsAddFranchiseOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">

      <DashboardLayout
        currentUser={currentUser}
        activeTab={activeTab}
        listingsCount={franchiserListings.length}
        listingStatus={franchiserListings[0]?.status}
        onRequireListing={handleOpenAddFranchise}
        onSelectTab={(tab) => {
          if (tab === 'compare') handleOpenCompare();
          else navigateToTab(tab);
        }}
        onLogout={handleLogout}
      >
        {/* ==================== INVESTOR VIEWS ==================== */}
        {currentUser.role === 'investor' && (
          <ErrorBoundary onReset={() => navigateToTab('dashboard')}>
            {activeTab === 'feasibility' ? (
              <FeasibilityDSS
                currentUser={currentUser}
                franchises={franchises}
                preSelectedFranchise={dssPreselectedFranchise}
                onApplyFranchise={(f) => handleApplyClick(f)}
              />
            ) : activeTab === 'investment-analysis' ? (
              <InvestmentAnalysisView
                franchises={franchises}
                onSelectFranchise={(f) => setSelectedFranchise(f)}
              />
            ) : activeTab === 'discover' ? (
              <PublicDiscover
                franchises={franchises}
                categories={categories}
                currentUser={currentUser}
                onSelectFranchise={(f) => setSelectedFranchise(f)}
                onApply={(f: FranchiseListing) => handleApplyClick(f)}
                onRunFeasibility={(f) => handleRunFeasibility(f)}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
                onOpenCompareModal={() => setIsCompareOpen(true)}
              />
            ) : activeTab === 'messages' ? (
              <DirectMessagingView
                currentUser={currentUser}
                franchises={franchises}
                initialFranchiseId={chatPreselectedFranchise?.id || dssPreselectedFranchise?.id}
                onOpenMeetingModal={(f) => {
                  setMessagingFranchise(f);
                  setMessagingTab('meeting');
                  setMessagingModalOpen(true);
                }}
                onViewFranchise={(f) => setSelectedFranchise(f)}
              />
            ) : activeTab === 'applications' ? (
              <InvestorApplicationsView
                currentUser={currentUser}
                applications={applications}
                onRefresh={loadData}
                onNavigateToContracts={() => navigateToTab('contracts')}
              />
            ) : activeTab === 'portfolio' ? (
              <InvestorPortfolioView
                currentUser={currentUser}
                portfolioData={portfolioData}
                onNavigateToContracts={() => navigateToTab('contracts')}
              />
            ) : activeTab === 'contracts' ? (
              <InvestorContractsView
                currentUser={currentUser}
                contracts={contracts}
                onRefresh={loadData}
              />
            ) : activeTab === 'subscription' ? (
              <InvestorSubscriptionView
                currentUser={currentUser}
                onRefreshUser={handleRefreshUser}
              />
            ) : activeTab === 'profile' ? (
              <InvestorProfileView
                currentUser={currentUser}
                onRefreshUser={handleRefreshUser}
              />
            ) : (
              /* Fallback default to dashboard for any unmatched/back tab */
              <InvestorDashboard
                currentUser={currentUser}
                franchises={franchises}
                applications={applications}
                portfolioData={portfolioData}
                onNavigate={navigateToTab}
                onSelectFranchise={(f) => setSelectedFranchise(f)}
                onRunFeasibility={(f) => handleRunFeasibility(f)}
              />
            )}
          </ErrorBoundary>
        )}

        {/* ==================== FRANCHISER VIEWS ==================== */}
        {currentUser.role === 'franchiser' && (
          <ErrorBoundary onReset={() => navigateToTab('dashboard')}>
            {activeTab === 'listings' ? (
              <FranchiserListingsView
                listings={franchiserListings}
                onOpenAddModal={handleOpenAddFranchise}
                onRefresh={loadData}
                onRequestQuotaRevision={(listing) => {
                  setSupportInitialListing(listing);
                  navigateToTab('support');
                }}
              />
            ) : activeTab === 'messages' ? (
              <DirectMessagingView
                currentUser={currentUser}
                franchises={franchises}
                onOpenMeetingModal={(f) => {
                  setMessagingFranchise(f);
                  setMessagingTab('meeting');
                  setMessagingModalOpen(true);
                }}
                onViewFranchise={(f) => setSelectedFranchise(f)}
              />
            ) : activeTab === 'applications' ? (
              <FranchiserApplicationsView
                applications={applications}
                onRefresh={loadData}
              />
            ) : activeTab === 'partners' ? (
              <FranchiserPartnersView contracts={contracts} />
            ) : activeTab === 'territories' ? (
              <TerritoryManager
                listings={franchiserListings}
              />
            ) : activeTab === 'documents' ? (
              <FranchiserDocumentsView
                currentUser={currentUser}
                listings={franchiserListings}
                onRefresh={loadData}
              />
            ) : activeTab === 'franchiser-billing' ? (
              <FranchiserBillingView
                listings={franchiserListings}
                currentUser={currentUser}
                onRefresh={loadData}
              />
            ) : activeTab === 'support' ? (
              <FranchiserSupportView
                currentUser={currentUser}
                listings={franchiserListings}
                initialCategory={supportInitialListing ? 'Quota Revision Request' : undefined}
                initialListing={supportInitialListing}
                onRefreshListings={loadData}
              />
            ) : (
              /* Fallback default to dashboard for any unmatched/back tab */
              <FranchiserDashboard
                currentUser={currentUser}
                listings={franchiserListings}
                applications={applications}
                onNavigate={navigateToTab}
                onOpenAddModal={handleOpenAddFranchise}
                onPayListingFee={(id) => api.payListingFee(id).then(loadData)}
              />
            )}
          </ErrorBoundary>
        )}

        {/* ==================== ADMIN VIEWS ==================== */}
        {currentUser.role === 'admin' && (
          <ErrorBoundary onReset={() => navigateToTab('dashboard')}>
            {activeTab === 'admin-franchises' ? (
              <AdminFranchisesView
                franchises={franchises}
                onRefresh={loadData}
                onSelectFranchise={(f) => setSelectedFranchise(f)}
              />
            ) : activeTab === 'admin-revenue' ? (
              <AdminPlatformRevenueView franchises={franchises} />
            ) : activeTab === 'admin-support' ? (
              <AdminSupportTicketsView
                franchises={franchises}
                onRefresh={loadData}
              />
            ) : activeTab === 'admin-audit' ? (
              <AdminAuditLogsView />
            ) : (
              /* Fallback default to dashboard for any unmatched/back tab */
              <AdminDashboard
                franchises={franchises}
                users={allUsers}
                onNavigate={navigateToTab}
                onRefresh={loadData}
              />
            )}
          </ErrorBoundary>
        )}

        {/* Safety catch for any unrecognized role */}
        {!['investor', 'franchiser', 'admin'].includes(currentUser.role) && (
          <div className="p-8 text-center bg-white rounded-2xl m-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Unrecognized Account Session</h3>
            <p className="text-xs text-slate-500 mb-4">The current account session has an undefined profile role.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Sign In Again
            </button>
          </div>
        )}

      </DashboardLayout>

      {/* Global Interactive Modals */}
      <FranchiseDetailModal
        isOpen={selectedFranchise !== null}
        onClose={() => setSelectedFranchise(null)}
        franchise={selectedFranchise}
        currentUser={currentUser}
        onApply={(f) => handleApplyClick(f)}
        onRunFeasibility={(f) => handleRunFeasibility(f)}
        onStartChat={(f) => {
          setSelectedFranchise(null);
          setChatPreselectedFranchise(f);
          setActiveTab('messages');
        }}

        onOpenScheduleMeeting={(f) => {
          setMessagingFranchise(f);
          setMessagingTab('meeting');
          setMessagingModalOpen(true);
        }}
        isComparing={compareList.some((c) => c.id === selectedFranchise?.id)}
        onToggleCompare={(f) => handleToggleCompare(f)}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        allFranchises={franchises}
        onRemove={handleRemoveCompare}
        onAddCompare={handleToggleCompare}
        onSelectFranchise={(f) => setSelectedFranchise(f)}
        onApply={(f) => handleApplyClick(f)}
        onRunFeasibility={(f) => handleRunFeasibility(f)}
      />

      <ApplyModal
        isOpen={applyFranchise !== null}
        onClose={() => setApplyFranchise(null)}
        franchise={applyFranchise}
        currentUser={currentUser}
        onSuccess={loadData}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
      />

      <AddFranchiseModal
        isOpen={isAddFranchiseOpen}
        onClose={() => setIsAddFranchiseOpen(false)}
        categories={categories}
        currentUser={currentUser}
        existingListingsCount={franchiserListings.length}
        onSuccess={loadData}
      />

      <MessagingAndMeetingModal
        isOpen={messagingModalOpen}
        onClose={() => setMessagingModalOpen(false)}
        franchise={messagingFranchise}
        currentUser={currentUser}
        initialTab={messagingTab}
      />

      {/* Session Lock Notification Toast */}
      {sessionLockToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-fade-in max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-xs text-white">Session Protected</div>
            <div className="text-[11px] text-slate-300 font-medium leading-snug">{sessionLockToast}</div>
          </div>
          <button
            onClick={() => setSessionLockToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

