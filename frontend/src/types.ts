export type UserRole = 'investor' | 'franchiser' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  is_verified: boolean;
  is_suspended?: boolean;
  created_at?: string;
  profile?: InvestorProfile | FranchiserProfile;
}

export interface InvestorProfile {
  id?: number;
  user_id: number;
  min_budget: number;
  max_budget: number;
  preferred_categories: string; // JSON string or array
  preferred_investment_type: string;
  expected_roi: number;
  preferred_payback_months: number;
  experience_level: string;
  preferred_locations: string; // JSON string
  max_distance_km: number;
  plan_type: 'Standard' | 'Premium';
  max_investments: number;
  active_investments: number;
}

export interface FranchiserProfile {
  id?: number;
  user_id: number;
  company_name: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  founded_year?: number;
  headquarters?: string;
  business_address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  registration_number?: string;
  tax_gst_number?: string;
  business_type?: string;
  operating_locations?: string;
  expansion_locations?: string;
  verification_status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  avg_investment_min: number;
  avg_investment_max: number;
  avg_roi: number;
  is_active: number;
}

export interface Territory {
  id?: number;
  franchise_id: number;
  country: string;
  state: string;
  city: string;
  territory_name: string;
  is_exclusive: number;
  status: 'Available' | 'Reserved' | 'Sold';
}

export interface LicenseRequirement {
  id?: number;
  franchise_id: number;
  license_name: string;
  license_number?: string;
  issuing_authority: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Expired';
  estimated_cost: number;
  acquisition_time_weeks: number;
  responsible_party: string;
  franchiser_assistance: number;
}

export interface SectorChallenge {
  id?: number;
  franchise_id: number;
  sector: string;
  challenge_title: string;
  description: string;
  mitigation_strategy: string;
}

export interface FranchiseDocument {
  id: number;
  franchise_id: number;
  doc_type: string;
  title: string;
  file_url?: string;
  issue_date?: string;
  expiry_date?: string;
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Expired';
  admin_notes?: string;
  franchise_name?: string;
  company_name?: string;
}

export interface FranchiseListing {
  id: number;
  franchiser?: any;
  franchiser_id?: number;
  name: string;
  slug: string;
  category_slug: string;
  business_type: string;
  description: string;
  business_model: string;
  founded_year: number;
  headquarters: string;
  website: string;
  contact_phone: string;
  contact_email: string;

  // Investment
  min_investment: number;
  max_investment: number;
  franchise_fee: number;
  setup_cost: number;
  equipment_cost: number;
  interior_cost: number;
  working_capital: number;
  training_cost: number;
  tech_cost: number;
  license_cost: number;
  other_costs: number;
  gst_rate: number;
  total_investment_est: number;

  // Royalties & Sharing
  royalty_type: 'Fixed Royalty' | 'Percentage Royalty' | 'Revenue Sharing' | 'Profit Sharing';
  royalty_value: number;
  marketing_fee: number;
  tech_fee: number;
  maintenance_fee: number;
  payment_frequency: string;
  other_recurring_fees: string;

  // Financials
  est_monthly_revenue: number;
  est_monthly_expenses: number;
  est_monthly_profit: number;
  est_annual_profit: number;
  est_roi: number;
  payback_months: number;
  breakeven_months: number;

  // Units
  total_units: number;
  available_units: number;
  reserved_units: number;
  sold_units: number;

  // Status
  status: 'Draft' | 'Pending Approval' | 'Documents Required' | 'Document Audit Pending' | 'Under Review' | 'Active' | 'Available' | 'Verified' | 'Suspended' | 'Sold Out';
  is_featured: number;
  is_beginner_friendly: number;
  listing_fee_paid: number;
  listing_fee_amount?: number;
  listing_fee_status?: string;
  tax_gst_number?: string;
  maintenance_fee_status: 'Paid' | 'Grace Period' | 'Overdue';
  maintenance_due_date?: string;
  views_count: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  image_url?: string;
  images?: string[];
  franchiser_name?: string;
  franchiser_email?: string;
  franchiser_phone?: string;
  company_name?: string;
  franchiser_logo?: string;
  franchiser_verification?: string;
  avg_rating?: number | null;
  review_count?: number;
  available_territories_count?: number;
  territories?: Territory[];
  licenses?: LicenseRequirement[];
  challenges?: SectorChallenge[];
  documents?: FranchiseDocument[];
  reviews?: Review[];
}

export interface Application {
  id: number;
  franchise_id: number;
  investor_id: number;
  proposed_budget: number;
  target_location: string;
  experience_years: number;
  message: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Withdrawn';
  submitted_at: string;
  updated_at: string;
  franchise_name?: string;
  category_slug?: string;
  total_investment_est?: number;
  est_roi?: number;
  company_name?: string;
  franchiser_name?: string;
  investor_name?: string;
  investor_email?: string;
  investor_phone?: string;
  experience_level?: string;
  investor_plan?: string;
  contract_id?: number;
  contract_status?: string;
  is_contract_signed?: boolean;
  is_payment_completed?: boolean;
}

export interface Contract {
  id: number;
  application_id?: number;
  franchise_id: number;
  investor_id: number;
  franchiser_id: number;
  territory: string;
  total_investment: number;
  royalty_terms: string;
  duration_years: number;
  terms_text: string;
  status: 'Draft' | 'Investor Review' | 'Franchiser Review' | 'Signed' | 'Active' | 'Terminated';
  investor_signed_at?: string;
  franchiser_signed_at?: string;
  digital_signature_name?: string;
  generated_at: string;
  franchise_name?: string;
  category_slug?: string;
  business_type?: string;
  investor_name?: string;
  investor_email?: string;
  franchiser_name?: string;
  franchiser_email?: string;
  company_name?: string;
}

export interface PaymentRecord {
  id: number;
  user_id: number;
  related_franchise_id?: number;
  related_contract_id?: number;
  transaction_ref: string;
  purpose: string;
  amount: number;
  payment_type: 'Listing Fee' | 'Monthly Maintenance' | 'Investor Subscription' | 'Franchise Investment Deposit';
  status: 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Refunded' | 'Overdue';
  payment_method: string;
  payment_date: string;
  user_name?: string;
  user_email?: string;
  franchise_name?: string;
}

export interface Conversation {
  id: number;
  franchise_id?: number;
  investor_id: number;
  franchiser_id: number;
  created_at: string;
  updated_at: string;
  franchise_name?: string;
  investor_name: string;
  investor_avatar?: string;
  franchiser_name: string;
  franchiser_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface MessageItem {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  is_read: number;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface MeetingItem {
  id: number;
  franchise_id: number;
  investor_id: number;
  franchiser_id: number;
  meeting_type: 'Online Video Meeting' | 'Phone Call' | 'Physical In-Person Meeting';
  scheduled_at: string;
  status: 'Requested' | 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  meet_link?: string;
  franchise_name?: string;
  investor_name?: string;
  investor_email?: string;
  franchiser_name?: string;
  franchiser_email?: string;
}

export interface Review {
  id: number;
  franchise_id: number;
  investor_id: number;
  overall_rating: number;
  communication_rating: number;
  transparency_rating: number;
  support_rating: number;
  roi_rating: number;
  comment: string;
  created_at: string;
  investor_name?: string;
  investor_avatar?: string;
}

export interface FeasibilityResult {
  id?: number;
  financial_score: number;
  location_score: number;
  market_score: number;
  competition_score: number;
  experience_score: number;
  overall_score: number;
  suitability_label: string;
  recommendations: string;
  breakdown?: {
    est_roi: number;
    est_monthly_profit: number;
    payback_months: number;
    breakeven_months: number;
  };
}

export interface FeasibilityHistoryItem extends FeasibilityResult {
  franchise_name: string;
  category_slug: string;
  total_investment_est: number;
  est_roi: number;
  budget: number;
  location: string;
  experience_level: string;
  created_at: string;
}

export interface PlatformSettings {
  id: number;
  listing_issuance_fee: number;
  monthly_maintenance_fee: number;
  free_investor_max_units: number;
  premium_investor_max_units: number;
  platform_gst_rate: number;
  maintenance_grace_days: number;
}

export interface SupportTicket {
  id: number;
  user_id?: number;
  user?: number;
  ticket_number: string;
  subject: string;
  category: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Normal';
  admin_response?: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
}

export interface FraudReport {
  id: number;
  reporter_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  details: string;
  status: 'Under Investigation' | 'Resolved' | 'Dismissed';
  admin_notes?: string;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}


