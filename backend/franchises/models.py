from django.db import models

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('investor', 'Investor'),
        ('franchiser', 'Franchiser'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='investor')
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class InvestorProfile(models.Model):
    PLAN_CHOICES = [
        ('Standard', 'Standard'),
        ('Premium', 'Premium'),
    ]

    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='investor_profile')
    min_budget = models.FloatField(default=500000)
    max_budget = models.FloatField(default=5000000)
    preferred_categories = models.JSONField(default=list)
    preferred_investment_type = models.CharField(max_length=100, default='Full Franchise')
    expected_roi = models.FloatField(default=25.0)
    preferred_payback_months = models.IntegerField(default=18)
    experience_level = models.CharField(max_length=50, default='Intermediate')
    preferred_locations = models.JSONField(default=list)
    max_distance_km = models.IntegerField(default=50)
    plan_type = models.CharField(max_length=30, choices=PLAN_CHOICES, default='Standard')
    max_investments = models.IntegerField(default=5)
    active_investments = models.IntegerField(default=1)

    def __str__(self):
        return f"InvestorProfile for {self.user.name}"


class FranchiserProfile(models.Model):
    VERIFICATION_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
    ]

    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='franchiser_profile')
    company_name = models.CharField(max_length=200)
    logo = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, default='Food & Beverage')
    founded_year = models.IntegerField(default=2015)
    headquarters = models.CharField(max_length=150, default='Bangalore')
    business_address = models.TextField(blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    tax_gst_number = models.CharField(max_length=100, blank=True, null=True)
    business_type = models.CharField(max_length=100, default='Quick Service Restaurant')
    operating_locations = models.JSONField(default=list)
    expansion_locations = models.JSONField(default=list)
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_CHOICES, default='Verified')

    def __str__(self):
        return f"{self.company_name} ({self.user.name})"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=100, default='Utensils')
    description = models.TextField(blank=True, null=True)
    avg_investment_min = models.FloatField(default=1000000)
    avg_investment_max = models.FloatField(default=5000000)
    avg_roi = models.FloatField(default=28.0)
    is_active = models.IntegerField(default=1)

    def __str__(self):
        return self.name


class FranchiseListing(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Pending Approval', 'Pending Approval'),
        ('Documents Required', 'Documents Required'),
        ('Document Audit Pending', 'Document Audit Pending'),
        ('Active', 'Active'),
        ('Available', 'Available'),
        ('Suspended', 'Suspended'),
        ('Sold Out', 'Sold Out'),
    ]

    ROYALTY_TYPE_CHOICES = [
        ('Fixed Royalty', 'Fixed Royalty'),
        ('Percentage Royalty', 'Percentage Royalty'),
        ('Revenue Sharing', 'Revenue Sharing'),
        ('Profit Sharing', 'Profit Sharing'),
    ]

    MAINTENANCE_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Grace Period', 'Grace Period'),
        ('Overdue', 'Overdue'),
    ]

    franchiser = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='franchise_listings')
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, blank=True, null=True)
    category_slug = models.CharField(max_length=100, default='food-beverage')
    category = models.CharField(max_length=100, default='food-beverage')
    business_type = models.CharField(max_length=150, default='QSR Franchise')
    description = models.TextField(blank=True, null=True)
    business_model = models.TextField(blank=True, null=True)
    founded_year = models.IntegerField(default=2018)
    headquarters = models.CharField(max_length=150, default='Bangalore, India')
    website = models.URLField(blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    # Investment breakdown
    min_investment = models.FloatField(default=1500000)
    max_investment = models.FloatField(default=3500000)
    franchise_fee = models.FloatField(default=350000)
    setup_cost = models.FloatField(default=600000)
    equipment_cost = models.FloatField(default=400000)
    interior_cost = models.FloatField(default=300000)
    working_capital = models.FloatField(default=200000)
    training_cost = models.FloatField(default=50000)
    tech_cost = models.FloatField(default=50000)
    license_cost = models.FloatField(default=30000)
    other_costs = models.FloatField(default=20000)
    gst_rate = models.FloatField(default=18.0)
    total_investment_est = models.FloatField(default=2000000)

    # Royalties & Fees
    royalty_type = models.CharField(max_length=50, choices=ROYALTY_TYPE_CHOICES, default='Percentage Royalty')
    royalty_value = models.FloatField(default=6.0)
    marketing_fee = models.FloatField(default=2.0)
    tech_fee = models.FloatField(default=10000)
    maintenance_fee = models.FloatField(default=2500)
    payment_frequency = models.CharField(max_length=50, default='Monthly')
    other_recurring_fees = models.CharField(max_length=200, blank=True, null=True)

    # Financials
    est_monthly_revenue = models.FloatField(default=800000)
    est_monthly_expenses = models.FloatField(default=600000)
    est_monthly_profit = models.FloatField(default=200000)
    est_annual_profit = models.FloatField(default=2400000)
    est_roi = models.FloatField(default=30.0)
    payback_months = models.IntegerField(default=16)
    breakeven_months = models.IntegerField(default=6)

    # Units
    total_units = models.IntegerField(default=120)
    available_units = models.IntegerField(default=10)
    reserved_units = models.IntegerField(default=5)
    sold_units = models.IntegerField(default=105)

    # Status & Meta
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    is_featured = models.IntegerField(default=1)
    is_beginner_friendly = models.IntegerField(default=1)
    listing_fee_paid = models.IntegerField(default=1)
    listing_fee_amount = models.FloatField(default=15000)
    listing_fee_status = models.CharField(max_length=30, default='Paid')
    tax_gst_number = models.CharField(max_length=100, blank=True, null=True)
    maintenance_fee_status = models.CharField(max_length=30, choices=MAINTENANCE_STATUS_CHOICES, default='Paid')
    maintenance_due_date = models.CharField(max_length=50, blank=True, null=True)
    views_count = models.IntegerField(default=1240)
    rating = models.FloatField(default=4.8)
    image_url = models.URLField(blank=True, null=True)
    images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Territory(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Reserved', 'Reserved'),
        ('Sold', 'Sold'),
    ]

    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='territories')
    country = models.CharField(max_length=100, default='India')
    state = models.CharField(max_length=100, default='Karnataka')
    city = models.CharField(max_length=100, default='Bangalore')
    territory_name = models.CharField(max_length=150, default='Koramangala Zone')
    is_exclusive = models.IntegerField(default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Available')

    def __str__(self):
        return f"{self.territory_name} ({self.city})"


class LicenseRequirement(models.Model):
    VERIFICATION_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
        ('Expired', 'Expired'),
    ]

    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='licenses')
    license_name = models.CharField(max_length=150)
    license_number = models.CharField(max_length=100, blank=True, null=True)
    issuing_authority = models.CharField(max_length=150, default='FSSAI / Municipal Corp')
    issue_date = models.CharField(max_length=50, blank=True, null=True)
    expiry_date = models.CharField(max_length=50, blank=True, null=True)
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_CHOICES, default='Verified')
    estimated_cost = models.FloatField(default=15000)
    acquisition_time_weeks = models.IntegerField(default=3)
    responsible_party = models.CharField(max_length=100, default='Franchisee with Assistance')
    franchiser_assistance = models.IntegerField(default=1)


class SectorChallenge(models.Model):
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='challenges')
    sector = models.CharField(max_length=100, default='Food & Beverage')
    challenge_title = models.CharField(max_length=200)
    description = models.TextField()
    mitigation_strategy = models.TextField()


class FranchiseDocument(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
        ('Expired', 'Expired'),
    ]

    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=100, default='FDD Disclosure Document')
    title = models.CharField(max_length=200)
    file_url = models.URLField(blank=True, null=True)
    issue_date = models.CharField(max_length=50, blank=True, null=True)
    expiry_date = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Verified')
    admin_notes = models.TextField(blank=True, null=True)


class Favorite(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='favorites')
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'franchise')


class SavedSearch(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=150)
    filters = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class FeasibilityEvaluation(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='evaluations')
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='evaluations')
    location = models.CharField(max_length=200)
    capital_available = models.FloatField(default=2000000)
    financial_score = models.IntegerField(default=88)
    location_score = models.IntegerField(default=85)
    market_score = models.IntegerField(default=90)
    competition_score = models.IntegerField(default=78)
    experience_score = models.IntegerField(default=82)
    overall_score = models.IntegerField(default=86)
    suitability_label = models.CharField(max_length=50, default='Highly Feasible')
    recommendations = models.TextField(blank=True, null=True)
    breakdown = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation: {self.franchise.name} in {self.location} ({self.overall_score}%)"


class Application(models.Model):
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Withdrawn', 'Withdrawn'),
    ]

    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='applications')
    investor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='applications')
    proposed_budget = models.FloatField(default=2000000)
    target_location = models.CharField(max_length=200, default='Bangalore')
    experience_years = models.IntegerField(default=3)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Application by {self.investor.name} for {self.franchise.name}"


class Contract(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Investor Review', 'Investor Review'),
        ('Franchiser Review', 'Franchiser Review'),
        ('Signed', 'Signed'),
        ('Active', 'Active'),
        ('Terminated', 'Terminated'),
    ]

    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='contract', null=True, blank=True)
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='contracts')
    investor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='investor_contracts')
    franchiser = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='franchiser_contracts')
    territory = models.CharField(max_length=150, default='Koramangala, Bangalore')
    total_investment = models.FloatField(default=2000000)
    royalty_terms = models.CharField(max_length=200, default='6% Monthly Gross Revenue')
    duration_years = models.IntegerField(default=5)
    terms_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Investor Review')
    investor_signed_at = models.DateTimeField(blank=True, null=True)
    franchiser_signed_at = models.DateTimeField(blank=True, null=True)
    digital_signature_name = models.CharField(max_length=150, blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)


class PaymentRecord(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Successful', 'Successful'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
        ('Overdue', 'Overdue'),
    ]

    PAYMENT_TYPE_CHOICES = [
        ('Listing Fee', 'Listing Fee'),
        ('Monthly Maintenance', 'Monthly Maintenance'),
        ('Investor Subscription', 'Investor Subscription'),
        ('Franchise Investment Deposit', 'Franchise Investment Deposit'),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='payments')
    related_franchise = models.ForeignKey(FranchiseListing, on_delete=models.SET_NULL, null=True, blank=True)
    related_contract = models.ForeignKey(Contract, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_ref = models.CharField(max_length=100)
    purpose = models.CharField(max_length=200, default='Franchise Platform Fee')
    amount = models.FloatField()
    payment_type = models.CharField(max_length=50, choices=PAYMENT_TYPE_CHOICES, default='Listing Fee')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Successful')
    payment_method = models.CharField(max_length=50, default='UPI / Net Banking')
    payment_date = models.DateTimeField(auto_now_add=True)


class Conversation(models.Model):
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.SET_NULL, null=True, blank=True)
    investor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='investor_conversations')
    franchiser = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='franchiser_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MessageItem(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_messages')
    message_text = models.TextField()
    is_read = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class MeetingItem(models.Model):
    STATUS_CHOICES = [
        ('Requested', 'Requested'),
        ('Scheduled', 'Scheduled'),
        ('Rescheduled', 'Rescheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    MEETING_TYPE_CHOICES = [
        ('Online Video Meeting', 'Online Video Meeting'),
        ('Phone Call', 'Phone Call'),
        ('Physical In-Person Meeting', 'Physical In-Person Meeting'),
    ]

    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='meetings')
    investor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='investor_meetings')
    franchiser = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='franchiser_meetings')
    meeting_type = models.CharField(max_length=50, choices=MEETING_TYPE_CHOICES, default='Online Video Meeting')
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Scheduled')
    notes = models.TextField(blank=True, null=True)
    meet_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Review(models.Model):
    franchise = models.ForeignKey(FranchiseListing, on_delete=models.CASCADE, related_name='reviews')
    investor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews')
    overall_rating = models.FloatField(default=5.0)
    communication_rating = models.FloatField(default=5.0)
    transparency_rating = models.FloatField(default=5.0)
    support_rating = models.FloatField(default=5.0)
    roi_rating = models.FloatField(default=5.0)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='support_tickets')
    ticket_number = models.CharField(max_length=50)
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=50, default='Account')
    description = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=30, choices=PRIORITY_CHOICES, default='Medium')
    admin_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class FraudReport(models.Model):
    STATUS_CHOICES = [
        ('Under Investigation', 'Under Investigation'),
        ('Resolved', 'Resolved'),
        ('Dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='fraud_reports')
    target_type = models.CharField(max_length=100, default='FranchiseListing')
    target_id = models.IntegerField()
    reason = models.CharField(max_length=200)
    details = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Under Investigation')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class AuditLogItem(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)
    user_email = models.EmailField(blank=True, null=True)
    action = models.CharField(max_length=200)
    details = models.TextField()
    ip_address = models.CharField(max_length=50, default='127.0.0.1')
    created_at = models.DateTimeField(auto_now_add=True)


class PlatformSettings(models.Model):
    listing_issuance_fee = models.FloatField(default=15000)
    monthly_maintenance_fee = models.FloatField(default=2500)
    free_investor_max_units = models.IntegerField(default=3)
    premium_investor_max_units = models.IntegerField(default=10)
    platform_gst_rate = models.FloatField(default=18.0)
    maintenance_grace_days = models.IntegerField(default=15)
