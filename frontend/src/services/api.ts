import {
  User,
  FranchiseListing,
  Category,
  Application,
  Contract,
  PaymentRecord,
  Conversation,
  MessageItem,
  MeetingItem,
  FeasibilityResult,
  PlatformSettings,
  SupportTicket,
  FraudReport,
  AuditLogItem,
  FeasibilityHistoryItem
} from '../types';

import { authStorage } from '../utils/authStorage';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = authStorage.getUser();
  if (user) {
    if (user.id && String(user.id) !== 'undefined') {
      defaultHeaders['x-user-id'] = String(user.id);
      defaultHeaders['X-User-Id'] = String(user.id);
    }
    if (user.email) {
      defaultHeaders['x-user-email'] = String(user.email);
      defaultHeaders['X-User-Email'] = String(user.email);
    }
    if (user.role) {
      defaultHeaders['x-user-role'] = String(user.role);
      defaultHeaders['X-User-Role'] = String(user.role);
    }
  }

  let path = endpoint;
  if (!path.includes('?')) {
    if (!path.endsWith('/')) path += '/';
  } else {
    const [base, query] = path.split('?');
    path = `${base.endsWith('/') ? base : base + '/'}?${query}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Public Stats
  getPublicStats: () => request<{ success: boolean; data: any }>('/stats/public'),

  // Auth
  login: async (credentials: { email: string; password: string; role?: string }) => {
    const res = await request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.user) {
      authStorage.setUser(res.user);
    }
    return res;
  },

  register: async (data: any) => {
    const res = await request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.user) {
      authStorage.setUser(res.user);
    }
    return res;
  },

  logout: () => {
    authStorage.clearUser();
  },

  getMe: (userId?: number) =>
    request<{ success: boolean; data: User }>(`/auth/me${userId ? `?userId=${userId}` : ''}`),

  loginAsDemo: async (role: 'investor' | 'franchiser' | 'admin') => {
    const res = await request<{ success: boolean; data: { user: User } }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (res.data?.user) {
      authStorage.setUser(res.data.user);
    }
    return res;
  },

  switchDemoUser: async (role: 'investor' | 'franchiser' | 'admin') => {
    const res = await request<{ success: boolean; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (res.user) {
      authStorage.setUser(res.user);
    }
    return res;
  },

  // Categories
  getCategories: () => request<{ success: boolean; data: Category[] }>('/categories'),
  createCategory: (cat: Partial<Category>) =>
    request<{ success: boolean; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    }),

  // Franchises
  getFranchises: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
    }
    return request<{ success: boolean; count: number; data: FranchiseListing[] }>(`/franchises?${query.toString()}`);
  },

  checkTrademark: (name: string, excludeId?: number) => {
    const query = new URLSearchParams({ name });
    if (excludeId) query.append('exclude_id', String(excludeId));
    return request<{
      success: boolean;
      available: boolean;
      conflict: {
        conflict: boolean;
        existing_name: string;
        reason: string;
        description: string;
      } | null;
      message: string;
    }>(`/franchises/check-trademark/?${query.toString()}`);
  },

  getFranchiseById: (id: number | string) =>
    request<{ success: boolean; data: FranchiseListing }>(`/franchises/${id}`),

  createFranchise: (data: any) =>
    request<{ success: boolean; listing_id: number; message: string }>('/franchises', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFranchiseImages: (franchiseId: number, imageUrl: string, images: string[]) =>
    request<{ success: boolean; message: string }>(`/franchises/${franchiseId}/images`, {
      method: 'PUT',
      body: JSON.stringify({ image_url: imageUrl, images }),
    }),

  payListingFee: (franchiseId: number, userId?: number) =>
    request<{ success: boolean; message: string }>(`/franchises/${franchiseId}/pay-listing-fee`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  payMaintenanceFee: (franchiseId: number, userId?: number) =>
    request<{ success: boolean; message: string }>(`/franchises/${franchiseId}/pay-maintenance`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Investor
  getInvestorProfile: (userId?: number) =>
    request<{ success: boolean; data: any }>(`/investor/profile?userId=${userId || ''}`),

  updateInvestorProfile: (data: any) =>
    request<{ success: boolean; message: string }>('/investor/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  upgradeInvestorPlan: (userId: number, plan_type: string) =>
    request<{ success: boolean; message: string; data?: any; user?: any; plan_type?: string }>('/investor/upgrade-plan', {
      method: 'POST',
      body: JSON.stringify({ userId, plan_type }),
    }),

  getFavorites: (userId?: number) =>
    request<{ success: boolean; data: FranchiseListing[] }>(`/investor/favorites?userId=${userId || ''}`),

  toggleFavorite: (franchiseId: number, userId?: number) =>
    request<{ success: boolean; favorited: boolean; message: string }>(`/investor/favorites/${franchiseId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getSavedSearches: (userId?: number) =>
    request<{ success: boolean; data: any[] }>(`/investor/saved-searches?userId=${userId || ''}`),

  saveSearch: (data: any) =>
    request<{ success: boolean; message: string }>('/investor/saved-searches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPortfolio: (userId?: number) =>
    request<{ success: boolean; data: any }>(`/investor/portfolio?userId=${userId || ''}`),

  // Decision Support System - Feasibility
  calculateFeasibility: (params: {
    investor_id?: number;
    franchise_id: number;
    budget?: number;
    location: string;
    experience_level?: string;
    capital_available?: number;
    duration_months?: number;
  }) =>
    request<{ success: boolean; data: FeasibilityResult }>('/investor/feasibility', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getFeasibilityHistory: (userId?: number) =>
    request<{ success: boolean; data: FeasibilityHistoryItem[] }>(`/investor/feasibility-history?userId=${userId || ''}`),

  // Applications
  getApplications: (params?: { investorId?: number; franchiserId?: number }) => {
    if (params?.investorId) {
      return request<{ success: boolean; data: Application[] }>(`/investor/applications?userId=${params.investorId}`);
    }
    if (params?.franchiserId) {
      return request<{ success: boolean; data: Application[] }>(`/franchiser/applications?franchiserId=${params.franchiserId}`);
    }
    return request<{ success: boolean; data: Application[] }>('/investor/applications');
  },

  getInvestorApplications: (userId?: number) =>
    request<{ success: boolean; data: Application[] }>(`/investor/applications?userId=${userId || ''}`),

  getInvestorPortfolio: (userId?: number) =>
    request<{ success: boolean; data: any }>(`/investor/portfolio?userId=${userId || ''}`),

  getUsers: () => request<{ success: boolean; data: any[] }>('/admin/users'),

  addTerritory: (franchiseId: number, data: any) =>
    request<{ success: boolean; data: any; message: string }>(`/franchises/${franchiseId}/territories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitApplication: (data: any) =>
    request<{ success: boolean; application_id: number; message: string }>('/investor/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getFranchiserApplications: (franchiserId?: number) =>
    request<{ success: boolean; data: Application[] }>(`/franchiser/applications?franchiserId=${franchiserId || ''}`),

  updateApplicationStatus: (id: number, status: string, franchiser_id?: number) =>
    request<{ success: boolean; message: string }>(`/franchiser/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, franchiser_id }),
    }),

  // Contracts
  getContracts: (params: { userId?: number; role?: string }) => {
    const q = new URLSearchParams();
    if (params.userId) q.append('userId', String(params.userId));
    if (params.role) q.append('role', params.role);
    return request<{ success: boolean; data: Contract[] }>(`/contracts?${q.toString()}`);
  },

  signContract: (id: number, data: { userId: number; role: string; digitalSignatureName: string }) =>
    request<{ success: boolean; message: string }>(`/contracts/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payments
  getPayments: (params?: { userId?: number; role?: string }) => {
    const q = new URLSearchParams();
    if (params?.userId) q.append('userId', String(params.userId));
    if (params?.role) q.append('role', params?.role || '');
    return request<{ success: boolean; data: PaymentRecord[] }>(`/payments?${q.toString()}`);
  },

  processPayment: (data: any) =>
    request<{ success: boolean; transaction_ref: string; message: string }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Messages & Meetings (Investor <-> Franchiser)
  getConversations: (userId?: number) =>
    request<{ success: boolean; data: Conversation[] }>(userId ? `/messages/conversations/?userId=${userId}` : '/messages/conversations/'),

  startConversation: (data: { franchise_id?: number; partner_id?: number; user_id?: number; sender_id?: number; message_text?: string }) =>
    request<{ success: boolean; conversation_id: number; data: Conversation }>('/messages/conversations/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMessages: (conversationId: number, userId?: number) =>
    request<{ success: boolean; data: MessageItem[] }>(`/messages/${conversationId}/?userId=${userId || ''}`),

  sendMessage: (data: {
    conversation_id?: number;
    sender_id?: number;
    receiver_id?: number;
    franchise_id?: number;
    message_text: string;
  }) =>
    request<{ success: boolean; message_id: number; conversation_id: number; data: MessageItem }>('/messages/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markMessagesAsRead: (conversationId: number) =>
    request<{ success: boolean }>(`/messages/${conversationId}/`, {
      method: 'PUT',
    }),

  getMeetings: (userId?: number) =>
    request<{ success: boolean; data: MeetingItem[] }>(`/meetings/?userId=${userId || ''}`),

  scheduleMeeting: (data: any) =>
    request<{ success: boolean; message: string }>('/meetings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reviews
  postReview: (data: any) =>
    request<{ success: boolean; message: string }>('/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Franchiser Partners & Analytics
  getFranchiserPartners: (franchiserId?: number) =>
    request<{ success: boolean; data: any[] }>(`/franchiser/partners/?franchiserId=${franchiserId || ''}`),

  getFranchiserAnalytics: (franchiserId?: number) =>
    request<{ success: boolean; data: any }>(`/franchiser/analytics/?franchiserId=${franchiserId || ''}`),



  // Admin
  getAdminStats: () => request<{ success: boolean; data: any }>('/admin/stats'),
  getAdminListings: () => request<{ success: boolean; data: FranchiseListing[] }>('/admin/listings'),
  updateListingStatus: (id: number, status: string, adminNotes?: string) =>
    request<{ success: boolean; message: string }>(`/admin/listings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    }),

  getAdminDocuments: () => request<{ success: boolean; data: any[] }>('/admin/documents'),
  uploadDocument: (data: {
    franchise_id?: number;
    title: string;
    doc_type: string;
    file_url?: string;
    license_number?: string;
    issuing_authority?: string;
    issue_date?: string;
    expiry_date?: string;
  }) =>
    request<{ success: boolean; message: string; data: any }>('/admin/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDocumentStatus: (id: number, status: string, admin_notes?: string) =>
    request<{ success: boolean; message: string }>(`/admin/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes }),
    }),

  getAdminUsers: () => request<{ success: boolean; data: any[] }>('/admin/users'),
  updateUserStatus: (id: number, data: { is_verified?: boolean; is_suspended?: boolean }) =>
    request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminSettings: () => request<{ success: boolean; data: PlatformSettings }>('/admin/settings'),
  updateAdminSettings: (data: Partial<PlatformSettings>) =>
    request<{ success: boolean; message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminAuditLogs: () => request<{ success: boolean; data: AuditLogItem[] }>('/admin/audit-logs'),
  getAdminSupportTickets: () => request<{ success: boolean; data: SupportTicket[] }>('/admin/support-tickets'),
  getSupportTickets: (userId?: number, role?: string) =>
    request<{ success: boolean; data: SupportTicket[] }>(
      `/support-tickets/?${userId ? 'userId=' + userId : ''}${role ? '&role=' + role : ''}`
    ),
  createSupportTicket: (data: {
    subject: string;
    category: string;
    description: string;
    priority?: string;
    user_id?: number;
  }) =>
    request<{ success: boolean; data: SupportTicket; message: string }>('/support-tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  replyUserSupportTicket: (id: number, message: string) =>
    request<{ success: boolean; data: SupportTicket; message: string }>(`/support-tickets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    }),

  updateSupportTicket: (
    id: number,
    data: {
      status: string;
      admin_response?: string;
      franchise_id?: number;
      new_total_units?: number;
    }
  ) =>
    request<{ success: boolean; message: string; data?: SupportTicket }>(`/admin/support-tickets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  adminUpdateListingQuota: (id: number, data: { total_units: number; available_units?: number }) =>
    request<{ success: boolean; message: string; data: FranchiseListing }>(`/admin/listings/${id}/status/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminFraudReports: () => request<{ success: boolean; data: FraudReport[] }>('/admin/fraud-reports'),
  updateFraudReport: (id: number, data: { status: string; admin_notes?: string }) =>
    request<{ success: boolean; message: string }>(`/admin/fraud-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};


