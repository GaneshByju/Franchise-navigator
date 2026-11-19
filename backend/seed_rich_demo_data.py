import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fdss_backend.settings')
django.setup()

from franchises.models import (
    UserProfile, InvestorProfile, FranchiserProfile, Category, FranchiseListing,
    Territory, LicenseRequirement, SectorChallenge, FranchiseDocument, Application,
    Contract, PaymentRecord, Conversation, MessageItem, MeetingItem, Review,
    SupportTicket, AuditLogItem, PlatformSettings, FeasibilityEvaluation
)

def run_seed():
    print("=" * 60)
    print("[*] SEEDING HIGH-FIDELITY COMMERCIAL FRANCHISE ECOSYSTEM")
    print("=" * 60)

    # 1. Platform Settings
    settings_obj, _ = PlatformSettings.objects.get_or_create(
        id=1,
        defaults={
            'listing_issuance_fee': 15000,
            'monthly_maintenance_fee': 2500,
            'free_investor_max_units': 3,
            'premium_investor_max_units': 10,
            'platform_gst_rate': 18.0,
            'maintenance_grace_days': 15
        }
    )

    # 2. Admin User
    admin_user, _ = UserProfile.objects.update_or_create(
        email='admin@fdss.com',
        defaults={
            'name': 'System Administrator',
            'role': 'admin',
            'password_hash': 'admin123',
            'phone': '+91 94470 12345',
            'is_verified': True,
            'is_suspended': False,
            'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        }
    )
    print("[+] Platform Admin verified: admin@fdss.com")

    # 3. Real Franchisers
    franchisers_data = [
        {
            'name': 'Ganesh Asha',
            'email': 'ganesh16776@gmail.com',
            'password_hash': 'ganesh@123',
            'phone': '+91 98471 23456',
            'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'Malabar Spice Chai & Cafe Pvt Ltd',
                'logo': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80',
                'description': 'Leading authentic South Indian gourmet tea, artisanal snacks, and cafe franchise network with 60+ operational units across South India.',
                'website': 'https://malabarspicecafe.in',
                'industry': 'Food & Beverage',
                'founded_year': 2017,
                'headquarters': 'Kochi, Kerala',
                'business_address': 'Building 4B, Infopark Expressway, Kakkanad, Kochi, Kerala 682042',
                'contact_person': 'Ganesh Asha (Managing Director)',
                'registration_number': 'U55101KL2017PTC048912',
                'tax_gst_number': '32AABCM1234F1Z5',
                'business_type': 'Quick Service Restaurant & Cafe',
                'operating_locations': ['Kochi', 'Trivandrum', 'Calicut', 'Bangalore', 'Coimbatore'],
                'expansion_locations': ['Chennai', 'Hyderabad', 'Mysore', 'Mangalore'],
                'verification_status': 'Verified'
            }
        },
        {
            'name': 'Sreehari Nambiar',
            'email': 'sreehari@gmail.com',
            'password_hash': 'password123',
            'phone': '+91 94462 78901',
            'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'EcoKraft Sustainable Packaging LLP',
                'logo': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
                'description': 'Biodegradable paper bags, carton boxes, and sustainable food packaging manufacturing units with guaranteed buy-back contracts.',
                'website': 'https://ecokraftpackaging.com',
                'industry': 'Home & Facility Services',
                'founded_year': 2019,
                'headquarters': 'Coimbatore, Tamil Nadu',
                'business_address': 'Plot 42, SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu 641021',
                'contact_person': 'Sreehari Nambiar (Operations Head)',
                'registration_number': 'AAN-4491-TN',
                'tax_gst_number': '33AAACE5678K1ZQ',
                'business_type': 'Eco Manufacturing & Packaging Hub',
                'operating_locations': ['Coimbatore', 'Salem', 'Palakkad', 'Erode'],
                'expansion_locations': ['Madurai', 'Tiruchirappalli', 'Kochi', 'Thrissur'],
                'verification_status': 'Verified'
            }
        },
        {
            'name': 'Vikramaditya Roy',
            'email': 'vikram.roy@apexexpress.in',
            'password_hash': 'vikram@123',
            'phone': '+91 98801 45678',
            'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'ApexExpress Hyperlocal Logistics Pvt Ltd',
                'logo': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
                'description': 'Next-gen e-commerce delivery counters and hyperlocal courier micro-hubs with integrated GPS dispatch algorithms.',
                'website': 'https://apexexpresslogistics.in',
                'industry': 'Logistics & Courier',
                'founded_year': 2018,
                'headquarters': 'Bangalore, Karnataka',
                'business_address': 'Tech Park Avenue, Outer Ring Road, Bellandur, Bangalore 560103',
                'contact_person': 'Vikramaditya Roy (Founder & CEO)',
                'registration_number': 'U64120KA2018PTC112345',
                'tax_gst_number': '29AABCA9876C1ZD',
                'business_type': 'Logistics Hub & Courier Retail',
                'operating_locations': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
                'expansion_locations': ['Chennai', 'Hyderabad', 'Kochi', 'Coimbatore'],
                'verification_status': 'Verified'
            }
        },
        {
            'name': 'Dr. Ananya Sen',
            'email': 'ananya.sen@medilifecare.com',
            'password_hash': 'ananya@123',
            'phone': '+91 98402 34567',
            'avatar': 'https://images.unsplash.com/photo-1594824813633-4f952f4a42b1?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'MediLife Healthcare & Diagnostic Clinics',
                'logo': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80',
                'description': 'State-of-the-art diagnostic testing, optical center, and pharmacy chain operating under NABL accreditation protocols.',
                'website': 'https://medilifeclinics.com',
                'industry': 'Healthcare & Pharmacy',
                'founded_year': 2016,
                'headquarters': 'Chennai, Tamil Nadu',
                'business_address': 'Anna Salai Commercial Tower, Mount Road, Chennai, Tamil Nadu 600002',
                'contact_person': 'Dr. Ananya Sen (Medical Director)',
                'registration_number': 'U85110TN2016PTC099882',
                'tax_gst_number': '33AABCM5432J1Z8',
                'business_type': 'Specialty Clinic & Pharmacy Hub',
                'operating_locations': ['Chennai', 'Vellore', 'Kanchipuram'],
                'expansion_locations': ['Bangalore', 'Coimbatore', 'Madurai'],
                'verification_status': 'Verified'
            }
        },
        {
            'name': 'Rajesh Varma',
            'email': 'rajesh.varma@fitcoreindia.com',
            'password_hash': 'rajesh@123',
            'phone': '+91 99890 12345',
            'avatar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'FitCore 24/7 Smart Fitness Studios',
                'logo': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80',
                'description': '24-hour app-controlled smart gyms with RFID turnstiles, biometric access, and cloud-tracked personal training programs.',
                'website': 'https://fitcoreindia.com',
                'industry': 'Fitness & Wellness',
                'founded_year': 2020,
                'headquarters': 'Hyderabad, Telangana',
                'business_address': 'HiTech City Boulevard, Madhapur, Hyderabad 500081',
                'contact_person': 'Rajesh Varma (Managing Director)',
                'registration_number': 'U92412TG2020PTC140221',
                'tax_gst_number': '36AABCF8765E1ZV',
                'business_type': 'Smart Fitness Studio',
                'operating_locations': ['Hyderabad', 'Warangal', 'Vijayawada'],
                'expansion_locations': ['Bangalore', 'Pune', 'Vizag'],
                'verification_status': 'Verified'
            }
        },
        {
            'name': 'Meera Krishnan',
            'email': 'meera.krishnan@edukids.org',
            'password_hash': 'meera@123',
            'phone': '+91 97450 67890',
            'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'company_name': 'Little Scholars Early Education & Daycare',
                'logo': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80',
                'description': 'Premier British-curriculum pre-school, play school, and after-hours daycare chain with AI safety monitoring.',
                'website': 'https://littlescholarseducation.org',
                'industry': 'Education & Training',
                'founded_year': 2015,
                'headquarters': 'Trivandrum, Kerala',
                'business_address': 'Vazhuthacaud Avenue, Trivandrum, Kerala 695014',
                'contact_person': 'Meera Krishnan (Academic Director)',
                'registration_number': 'U80100KL2015NPL038120',
                'tax_gst_number': '32AABCL4321P1Z3',
                'business_type': 'Pre-School & Daycare Center',
                'operating_locations': ['Trivandrum', 'Kollam', 'Kottayam', 'Kochi'],
                'expansion_locations': ['Calicut', 'Thrissur', 'Bangalore'],
                'verification_status': 'Verified'
            }
        }
    ]

    franchiser_users = {}
    for f in franchisers_data:
        prof_data = f.pop('profile')
        user, _ = UserProfile.objects.update_or_create(
            email=f['email'],
            defaults={
                'name': f['name'],
                'role': 'franchiser',
                'password_hash': f['password_hash'],
                'phone': f['phone'],
                'avatar': f['avatar'],
                'is_verified': True,
                'is_suspended': False
            }
        )
        FranchiserProfile.objects.update_or_create(user=user, defaults=prof_data)
        franchiser_users[f['email']] = user
        print(f"[+] Franchiser profile saved: {f['name']} ({user.email})")

    # 4. Real Accredited Investors
    investors_data = [
        {
            'name': 'Akshay Sunil',
            'email': 'akshay@gmail.com',
            'password_hash': 'akshay@123',
            'phone': '+91 97460 11223',
            'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'min_budget': 1500000,
                'max_budget': 6000000,
                'preferred_categories': ['food-beverage', 'logistics-courier'],
                'preferred_investment_type': 'Full Commercial Franchise',
                'expected_roi': 30.0,
                'preferred_payback_months': 16,
                'experience_level': 'Advanced (6+ years in Retail & F&B)',
                'preferred_locations': ['Kochi', 'Ernakulam', 'Bangalore', 'Trivandrum'],
                'max_distance_km': 60,
                'plan_type': 'Standard',
                'max_investments': 5,
                'active_investments': 1
            }
        },
        {
            'name': 'Sonu Kurian',
            'email': 'sonu@gmail.com',
            'password_hash': 'password123',
            'phone': '+91 98950 44556',
            'avatar': 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'min_budget': 2500000,
                'max_budget': 12000000,
                'preferred_categories': ['home-services', 'healthcare-pharmacy'],
                'preferred_investment_type': 'Multi-Unit Operator',
                'expected_roi': 28.0,
                'preferred_payback_months': 18,
                'experience_level': 'Executive / Serial Investor',
                'preferred_locations': ['Coimbatore', 'Palakkad', 'Chennai', 'Salem'],
                'max_distance_km': 100,
                'plan_type': 'Premium',
                'max_investments': 10,
                'active_investments': 1
            }
        },
        {
            'name': 'Pooja Nair',
            'email': 'pooja.nair@investorhub.in',
            'password_hash': 'pooja@12345',
            'phone': '+91 94471 88990',
            'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'min_budget': 1200000,
                'max_budget': 4500000,
                'preferred_categories': ['education-training', 'healthcare-pharmacy'],
                'preferred_investment_type': 'Full Commercial Franchise',
                'expected_roi': 32.0,
                'preferred_payback_months': 15,
                'experience_level': 'Intermediate (4 years educational administration)',
                'preferred_locations': ['Trivandrum', 'Kochi', 'Kollam'],
                'max_distance_km': 50,
                'plan_type': 'Standard',
                'max_investments': 5,
                'active_investments': 0
            }
        },
        {
            'name': 'Karthik Venkatesh',
            'email': 'karthik.v@capitalventures.com',
            'password_hash': 'karthik@123',
            'phone': '+91 98860 33445',
            'avatar': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80',
            'profile': {
                'min_budget': 3500000,
                'max_budget': 15000000,
                'preferred_categories': ['fitness-wellness', 'food-beverage'],
                'preferred_investment_type': 'Master Franchise Territory',
                'expected_roi': 26.0,
                'preferred_payback_months': 20,
                'experience_level': 'High Net Worth Individual (HNWI)',
                'preferred_locations': ['Bangalore', 'Hyderabad', 'Chennai'],
                'max_distance_km': 80,
                'plan_type': 'Premium',
                'max_investments': 10,
                'active_investments': 0
            }
        }
    ]

    investor_users = {}
    for inv in investors_data:
        prof_data = inv.pop('profile')
        user, _ = UserProfile.objects.update_or_create(
            email=inv['email'],
            defaults={
                'name': inv['name'],
                'role': 'investor',
                'password_hash': inv['password_hash'],
                'phone': inv['phone'],
                'avatar': inv['avatar'],
                'is_verified': True,
                'is_suspended': False
            }
        )
        InvestorProfile.objects.update_or_create(user=user, defaults=prof_data)
        investor_users[inv['email']] = user
        print(f"[+] Investor profile saved: {inv['name']} ({user.email})")

    # 5. Commercial Franchise Listings
    listings_data = [
        {
            'franchiser': franchiser_users['ganesh16776@gmail.com'],
            'name': 'Malabar Spice Chai & Cafe',
            'slug': 'malabar-spice-chai-cafe',
            'category_slug': 'food-beverage',
            'category': 'Food & Beverage',
            'business_type': 'Quick Service Restaurant & Cafe',
            'description': 'Award-winning authentic South Indian gourmet tea, specialty filter coffee, organic malabar snacks, and artisanal breakfast cafe franchise. High inventory turnover with proven 32.5% annualized ROI.',
            'business_model': 'Franchise Owned Franchise Operated (FOFO)',
            'founded_year': 2017,
            'headquarters': 'Kochi, Kerala',
            'website': 'https://malabarspicecafe.in',
            'contact_phone': '+91 98471 23456',
            'contact_email': 'franchise@malabarspicecafe.in',
            'min_investment': 1800000,
            'max_investment': 2800000,
            'franchise_fee': 350000,
            'setup_cost': 750000,
            'equipment_cost': 450000,
            'interior_cost': 350000,
            'working_capital': 250000,
            'training_cost': 60000,
            'tech_cost': 50000,
            'license_cost': 30000,
            'other_costs': 20000,
            'gst_rate': 18.0,
            'total_investment_est': 2310000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 6.0,
            'marketing_fee': 2.0,
            'tech_fee': 8000,
            'maintenance_fee': 2500,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 680000,
            'est_monthly_expenses': 495000,
            'est_monthly_profit': 185000,
            'est_annual_profit': 2220000,
            'est_roi': 32.5,
            'payback_months': 14,
            'breakeven_months': 5,
            'total_units': 80,
            'available_units': 14,
            'reserved_units': 4,
            'sold_units': 62,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 1,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '32AABCM1234F1Z5',
            'views_count': 3840,
            'rating': 4.9,
            'image_url': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Kochi', 'state': 'Kerala', 'territory_name': 'Marine Drive Promenade Zone', 'status': 'Sold'},
                {'city': 'Kochi', 'state': 'Kerala', 'territory_name': 'Edappally Lulu Mall Corridor', 'status': 'Available'},
                {'city': 'Trivandrum', 'state': 'Kerala', 'territory_name': 'Technopark Phase 1 & 3 Gate', 'status': 'Available'},
                {'city': 'Calicut', 'state': 'Kerala', 'territory_name': 'Beach Road Commercial Strip', 'status': 'Reserved'},
                {'city': 'Bangalore', 'state': 'Karnataka', 'territory_name': 'Indiranagar 100ft Road', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'Central FSSAI Food Business License', 'license_number': '10020042001890', 'issuing_authority': 'Food Safety and Standards Authority of India', 'verification_status': 'Verified', 'estimated_cost': 15000},
                {'license_name': 'Municipal Trade License & Eating House NOC', 'license_number': 'KMC/TL/2024/8891', 'issuing_authority': 'Kochi Municipal Corporation', 'verification_status': 'Verified', 'estimated_cost': 12000},
                {'license_name': 'Fire Safety Department NOC', 'license_number': 'FS/KL/2023/104', 'issuing_authority': 'Kerala Fire & Rescue Services', 'verification_status': 'Verified', 'estimated_cost': 8000}
            ],
            'challenges': [
                {'sector': 'Food & Beverage', 'challenge_title': 'Perishable Raw Material Wastage', 'description': 'Milk, tea leaves, and freshly baked snacks have strict shelf-life limitations.', 'mitigation_strategy': 'Automated daily inventory restocking algorithm linked directly to central commissary.'},
                {'sector': 'Food & Beverage', 'challenge_title': 'Peak Hour Queue Congestion', 'description': 'Morning and evening rush hours create bottle-necks at counter.', 'mitigation_strategy': 'Dual-POS counter setup and QR-code at-table ordering system.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'Malabar Spice FDD Audited 2025-26', 'status': 'Verified'},
                {'doc_type': 'Central FSSAI License', 'title': 'FSSAI Central Operating Certificate', 'status': 'Verified'},
                {'doc_type': 'GSTIN Registration Certificate', 'title': 'Ministry of Finance GSTIN 32AABCM1234F1Z5', 'status': 'Verified'}
            ]
        },
        {
            'franchiser': franchiser_users['sreehari@gmail.com'],
            'name': 'EcoKraft Sustainable Packaging',
            'slug': 'ecokraft-sustainable-packaging',
            'category_slug': 'home-services',
            'category': 'Home & Facility Services',
            'business_type': 'Eco Manufacturing & Packaging Hub',
            'description': 'High-margin automated paper bag, corrugated carton, and biodegradable food container fabrication plant. Includes corporate buy-back agreements and pan-India dispatch partnerships.',
            'business_model': 'Franchise Owned Operator (Semi-Automated Hub)',
            'founded_year': 2019,
            'headquarters': 'Coimbatore, Tamil Nadu',
            'website': 'https://ecokraftpackaging.com',
            'contact_phone': '+91 94462 78901',
            'contact_email': 'franchise@ecokraftpackaging.com',
            'min_investment': 2800000,
            'max_investment': 4200000,
            'franchise_fee': 400000,
            'setup_cost': 1200000,
            'equipment_cost': 1100000,
            'interior_cost': 200000,
            'working_capital': 400000,
            'training_cost': 80000,
            'tech_cost': 60000,
            'license_cost': 40000,
            'other_costs': 30000,
            'gst_rate': 18.0,
            'total_investment_est': 3510000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 5.0,
            'marketing_fee': 1.5,
            'tech_fee': 10000,
            'maintenance_fee': 3000,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 940000,
            'est_monthly_expenses': 680000,
            'est_monthly_profit': 260000,
            'est_annual_profit': 3120000,
            'est_roi': 28.0,
            'payback_months': 16,
            'breakeven_months': 6,
            'total_units': 40,
            'available_units': 12,
            'reserved_units': 2,
            'sold_units': 26,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 0,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '33AAACE5678K1ZQ',
            'views_count': 2650,
            'rating': 4.8,
            'image_url': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Coimbatore', 'state': 'Tamil Nadu', 'territory_name': 'SIDCO Kurichi Industrial Zone', 'status': 'Sold'},
                {'city': 'Salem', 'state': 'Tamil Nadu', 'territory_name': 'Steel Plant Industrial Corridor', 'status': 'Available'},
                {'city': 'Palakkad', 'state': 'Kerala', 'territory_name': 'KINFRA Mega Food Park Hub', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'State Pollution Control Board Consent (Orange Category)', 'license_number': 'PCB/TN/2023/1109', 'issuing_authority': 'Tamil Nadu Pollution Control Board', 'verification_status': 'Verified', 'estimated_cost': 25000},
                {'license_name': 'Factories & Boilers Operating Permit', 'license_number': 'DIF/CBE/4401', 'issuing_authority': 'Department of Industrial Safety', 'verification_status': 'Verified', 'estimated_cost': 18000}
            ],
            'challenges': [
                {'sector': 'Home & Facility Services', 'challenge_title': 'Kraft Paper Raw Material Price Volatility', 'description': 'Imported unbleached kraft paper fluctuates with global pulp index.', 'mitigation_strategy': 'Long-term centralized hedging contracts with Tamil Nadu Paper Mills.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'EcoKraft Complete Disclosure & Projections', 'status': 'Verified'},
                {'doc_type': 'Pollution Control Board NOC', 'title': 'TNPCB Air & Water Act Clearance', 'status': 'Verified'},
                {'doc_type': 'ISO Certification', 'title': 'ISO 9001:2015 Quality Manufacturing Compliance', 'status': 'Verified'}
            ]
        },
        {
            'franchiser': franchiser_users['vikram.roy@apexexpress.in'],
            'name': 'ApexExpress Hyperlocal Logistics Hub',
            'slug': 'apexexpress-hyperlocal-logistics',
            'category_slug': 'logistics-courier',
            'category': 'Logistics & Courier',
            'business_type': 'Logistics Hub & Courier Retail',
            'description': 'Rapid delivery micro-depot and parcel hub catering to top tier-1 e-commerce platforms, B2B wholesale freight, and local express couriers. Low capex with high immediate cash flow.',
            'business_model': 'Franchise Owned Hub & Delivery Fleet',
            'founded_year': 2018,
            'headquarters': 'Bangalore, Karnataka',
            'website': 'https://apexexpresslogistics.in',
            'contact_phone': '+91 98801 45678',
            'contact_email': 'franchise@apexexpresslogistics.in',
            'min_investment': 850000,
            'max_investment': 1400000,
            'franchise_fee': 200000,
            'setup_cost': 350000,
            'equipment_cost': 250000,
            'interior_cost': 100000,
            'working_capital': 150000,
            'training_cost': 30000,
            'tech_cost': 40000,
            'license_cost': 20000,
            'other_costs': 15000,
            'gst_rate': 18.0,
            'total_investment_est': 1155000,
            'royalty_type': 'Revenue Sharing',
            'royalty_value': 8.0,
            'marketing_fee': 1.0,
            'tech_fee': 5000,
            'maintenance_fee': 1500,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 480000,
            'est_monthly_expenses': 340000,
            'est_monthly_profit': 140000,
            'est_annual_profit': 1680000,
            'est_roi': 38.0,
            'payback_months': 9,
            'breakeven_months': 3,
            'total_units': 150,
            'available_units': 30,
            'reserved_units': 10,
            'sold_units': 110,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 1,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '29AABCA9876C1ZD',
            'views_count': 5120,
            'rating': 4.7,
            'image_url': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Bangalore', 'state': 'Karnataka', 'territory_name': 'Koramangala 4th Block Hub', 'status': 'Available'},
                {'city': 'Kochi', 'state': 'Kerala', 'territory_name': 'Kaloor International Stadium Zone', 'status': 'Available'},
                {'city': 'Mysore', 'state': 'Karnataka', 'territory_name': 'Vijayanagar Ring Road Hub', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'Commercial Courier Operating Registration', 'license_number': 'DOP/KA/2022/990', 'issuing_authority': 'Department of Posts, Govt of India', 'verification_status': 'Verified', 'estimated_cost': 10000}
            ],
            'challenges': [
                {'sector': 'Logistics & Courier', 'challenge_title': 'Delivery Partner Attrition', 'description': 'Hyperlocal gig rider availability during festive peaks.', 'mitigation_strategy': 'Guaranteed minimum base pay and seasonal rider performance bonuses.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'ApexExpress Operations FDD 2025', 'status': 'Verified'},
                {'doc_type': 'GSTIN Registration Certificate', 'title': 'GST Certificate Karnataka 29AABCA9876C1ZD', 'status': 'Verified'}
            ]
        },
        {
            'franchiser': franchiser_users['ananya.sen@medilifecare.com'],
            'name': 'MediLife Healthcare & Diagnostic Clinics',
            'slug': 'medilife-healthcare-diagnostic-clinics',
            'category_slug': 'healthcare-pharmacy',
            'category': 'Healthcare & Pharmacy',
            'business_type': 'Specialty Clinic & Pharmacy Hub',
            'description': 'NABL-compliant pathology collection hub, digital X-Ray, ultrasound center, and branded 24/7 retail pharmacy. Recession-proof healthcare sector with high gross margins.',
            'business_model': 'Franchise Owned Company Operated (FOCO)',
            'founded_year': 2016,
            'headquarters': 'Chennai, Tamil Nadu',
            'website': 'https://medilifeclinics.com',
            'contact_phone': '+91 98402 34567',
            'contact_email': 'franchise@medilifeclinics.com',
            'min_investment': 3500000,
            'max_investment': 5500000,
            'franchise_fee': 600000,
            'setup_cost': 1800000,
            'equipment_cost': 1400000,
            'interior_cost': 400000,
            'working_capital': 500000,
            'training_cost': 100000,
            'tech_cost': 80000,
            'license_cost': 50000,
            'other_costs': 40000,
            'gst_rate': 18.0,
            'total_investment_est': 4970000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 7.0,
            'marketing_fee': 2.0,
            'tech_fee': 15000,
            'maintenance_fee': 4000,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 1420000,
            'est_monthly_expenses': 1040000,
            'est_monthly_profit': 380000,
            'est_annual_profit': 4560000,
            'est_roi': 29.0,
            'payback_months': 18,
            'breakeven_months': 7,
            'total_units': 60,
            'available_units': 15,
            'reserved_units': 3,
            'sold_units': 42,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 0,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '33AABCM5432J1Z8',
            'views_count': 4100,
            'rating': 4.9,
            'image_url': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Chennai', 'state': 'Tamil Nadu', 'territory_name': 'OMR IT Corridor Perungudi', 'status': 'Available'},
                {'city': 'Coimbatore', 'state': 'Tamil Nadu', 'territory_name': 'RS Puram High Street', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'Retail & Wholesale Drug License (Form 20B/21B)', 'license_number': 'TN/DRUG/2021/4490', 'issuing_authority': 'Tamil Nadu State Drugs Control', 'verification_status': 'Verified', 'estimated_cost': 35000},
                {'license_name': 'Atomic Energy Regulatory Board (AERB) X-Ray Clearance', 'license_number': 'AERB/MED/2022/81', 'issuing_authority': 'AERB Govt of India', 'verification_status': 'Verified', 'estimated_cost': 20000}
            ],
            'challenges': [
                {'sector': 'Healthcare & Pharmacy', 'challenge_title': 'Strict Statutory Quality Audits', 'description': 'Regular biomedical waste and reagent calibration standards.', 'mitigation_strategy': 'Centralized NABL quality control auditors conduct bi-weekly digital audits.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'MediLife Healthcare FDD 2025-26', 'status': 'Verified'},
                {'doc_type': 'Central Drug License', 'title': 'Drugs Control Department Authorization', 'status': 'Verified'},
                {'doc_type': 'NABL Accreditation Certificate', 'title': 'NABL ISO 15189:2012 Certified', 'status': 'Verified'}
            ]
        },
        {
            'franchiser': franchiser_users['rajesh.varma@fitcoreindia.com'],
            'name': 'FitCore 24/7 Smart Fitness Studios',
            'slug': 'fitcore-smart-fitness-studios',
            'category_slug': 'fitness-wellness',
            'category': 'Fitness & Wellness',
            'business_type': 'Smart Fitness Studio',
            'description': 'Fully automated 24/7 access gym equipped with biometric facial recognition, app-guided smart workout stations, certified trainers, and protein smoothie bars.',
            'business_model': 'Franchise Owned Operator (Automated Access)',
            'founded_year': 2020,
            'headquarters': 'Hyderabad, Telangana',
            'website': 'https://fitcoreindia.com',
            'contact_phone': '+91 99890 12345',
            'contact_email': 'franchise@fitcoreindia.com',
            'min_investment': 4200000,
            'max_investment': 6500000,
            'franchise_fee': 750000,
            'setup_cost': 2200000,
            'equipment_cost': 1800000,
            'interior_cost': 600000,
            'working_capital': 500000,
            'training_cost': 120000,
            'tech_cost': 90000,
            'license_cost': 40000,
            'other_costs': 30000,
            'gst_rate': 18.0,
            'total_investment_est': 6130000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 7.5,
            'marketing_fee': 2.5,
            'tech_fee': 12000,
            'maintenance_fee': 3500,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 1680000,
            'est_monthly_expenses': 1230000,
            'est_monthly_profit': 450000,
            'est_annual_profit': 5400000,
            'est_roi': 26.5,
            'payback_months': 20,
            'breakeven_months': 8,
            'total_units': 50,
            'available_units': 13,
            'reserved_units': 4,
            'sold_units': 33,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 1,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '36AABCF8765E1ZV',
            'views_count': 3280,
            'rating': 4.8,
            'image_url': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Hyderabad', 'state': 'Telangana', 'territory_name': 'Gachibowli Financial District', 'status': 'Available'},
                {'city': 'Hyderabad', 'state': 'Telangana', 'territory_name': 'Jubilee Hills Road No. 36', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'GHMC Commercial Trade License', 'license_number': 'GHMC/TL/2023/771', 'issuing_authority': 'Greater Hyderabad Municipal Corporation', 'verification_status': 'Verified', 'estimated_cost': 20000}
            ],
            'challenges': [
                {'sector': 'Fitness & Wellness', 'challenge_title': 'Annual Membership Churn Rate', 'description': 'Customer retention drops after initial quarterly spike.', 'mitigation_strategy': 'In-app gamified rewards and free monthly physical therapy sessions.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'FitCore Master Franchise Disclosure', 'status': 'Verified'},
                {'doc_type': 'Trade License', 'title': 'Commercial Studio Operation Clearance', 'status': 'Verified'}
            ]
        },
        {
            'franchiser': franchiser_users['meera.krishnan@edukids.org'],
            'name': 'Little Scholars Early Education & Daycare',
            'slug': 'little-scholars-early-education',
            'category_slug': 'education-training',
            'category': 'Education & Training',
            'business_type': 'Pre-School & Daycare Center',
            'description': 'Internationally recognized play-school and early childhood daycare chain with safe learning pods, child-psychologist curated syllabus, and live parent CCTV app feeds.',
            'business_model': 'Franchise Owned Childcare Operator',
            'founded_year': 2015,
            'headquarters': 'Trivandrum, Kerala',
            'website': 'https://littlescholarseducation.org',
            'contact_phone': '+91 97450 67890',
            'contact_email': 'franchise@littlescholarseducation.org',
            'min_investment': 1500000,
            'max_investment': 2400000,
            'franchise_fee': 300000,
            'setup_cost': 700000,
            'equipment_cost': 400000,
            'interior_cost': 350000,
            'working_capital': 200000,
            'training_cost': 60000,
            'tech_cost': 50000,
            'license_cost': 25000,
            'other_costs': 15000,
            'gst_rate': 18.0,
            'total_investment_est': 2100000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 6.5,
            'marketing_fee': 1.5,
            'tech_fee': 6000,
            'maintenance_fee': 2000,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 550000,
            'est_monthly_expenses': 385000,
            'est_monthly_profit': 165000,
            'est_annual_profit': 1980000,
            'est_roi': 31.0,
            'payback_months': 15,
            'breakeven_months': 5,
            'total_units': 45,
            'available_units': 13,
            'reserved_units': 2,
            'sold_units': 30,
            'status': 'Active',
            'is_featured': 1,
            'is_beginner_friendly': 1,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '32AABCL4321P1Z3',
            'views_count': 2890,
            'rating': 4.9,
            'image_url': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Trivandrum', 'state': 'Kerala', 'territory_name': 'Kowdiar Prime Residential Zone', 'status': 'Available'},
                {'city': 'Kochi', 'state': 'Kerala', 'territory_name': 'Kakkanad InfoPark Family Enclave', 'status': 'Reserved'},
                {'city': 'Kottayam', 'state': 'Kerala', 'territory_name': 'Collectorate Junction Commercial Area', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'Education Department Pre-School Recognition', 'license_number': 'DGE/KL/2021/804', 'issuing_authority': 'Department of General Education Kerala', 'verification_status': 'Verified', 'estimated_cost': 15000},
                {'license_name': 'Child Safety & Structural Health Clearance', 'license_number': 'PWD/KL/2023/12', 'issuing_authority': 'Kerala Public Works Department', 'verification_status': 'Verified', 'estimated_cost': 10000}
            ],
            'challenges': [
                {'sector': 'Education & Training', 'challenge_title': 'Teacher & Caretaker Training Consistency', 'description': 'Maintaining strict British Montessori pedagogical rigor.', 'mitigation_strategy': 'Mandatory bi-monthly certified trainer refresher workshops.'}
            ],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'Little Scholars Comprehensive FDD', 'status': 'Verified'},
                {'doc_type': 'Education Board NOC', 'title': 'Department of Education Recognized Status', 'status': 'Verified'}
            ]
        },
        # 7. Listing in "Pending Approval" for live Viva-Voce demonstration!
        {
            'franchiser': franchiser_users['vikram.roy@apexexpress.in'],
            'name': 'QuickByte Robotic Cloud Kitchens',
            'slug': 'quickbyte-robotic-cloud-kitchens',
            'category_slug': 'food-beverage',
            'category': 'Food & Beverage',
            'business_type': 'Automated Multi-Brand Cloud Kitchen',
            'description': 'AI-assisted modular robotic cloud kitchen preparing 8 virtual restaurant brands in a compact 400 sq.ft footprint. High dispatch speed and zero front-of-house overhead.',
            'business_model': 'Franchise Owned Dark Kitchen',
            'founded_year': 2023,
            'headquarters': 'Bangalore, Karnataka',
            'website': 'https://quickbytekitchens.in',
            'contact_phone': '+91 98801 45678',
            'contact_email': 'support@quickbytekitchens.in',
            'min_investment': 1400000,
            'max_investment': 2200000,
            'franchise_fee': 250000,
            'setup_cost': 600000,
            'equipment_cost': 450000,
            'interior_cost': 150000,
            'working_capital': 200000,
            'training_cost': 40000,
            'tech_cost': 60000,
            'license_cost': 20000,
            'other_costs': 15000,
            'gst_rate': 18.0,
            'total_investment_est': 1785000,
            'royalty_type': 'Percentage Royalty',
            'royalty_value': 5.5,
            'marketing_fee': 2.0,
            'tech_fee': 7000,
            'maintenance_fee': 2000,
            'payment_frequency': 'Monthly',
            'est_monthly_revenue': 620000,
            'est_monthly_expenses': 440000,
            'est_monthly_profit': 180000,
            'est_annual_profit': 2160000,
            'est_roi': 34.0,
            'payback_months': 12,
            'breakeven_months': 4,
            'total_units': 30,
            'available_units': 25,
            'reserved_units': 0,
            'sold_units': 5,
            'status': 'Pending Approval',  # Live Viva test item for Admin to approve!
            'is_featured': 0,
            'is_beginner_friendly': 1,
            'listing_fee_paid': 1,
            'listing_fee_amount': 15000,
            'listing_fee_status': 'Paid',
            'tax_gst_number': '29AABCA9876C1ZD',
            'views_count': 140,
            'rating': 4.5,
            'image_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            'images': [
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
            ],
            'territories': [
                {'city': 'Bangalore', 'state': 'Karnataka', 'territory_name': 'Whitefield IT Zone Cloud Hub', 'status': 'Available'}
            ],
            'licenses': [
                {'license_name': 'FSSAI State Manufacturing License', 'license_number': 'FSSAI/KA/2024/991', 'issuing_authority': 'Food Safety Dept Karnataka', 'verification_status': 'Under Review', 'estimated_cost': 15000}
            ],
            'challenges': [],
            'documents': [
                {'doc_type': 'Franchise Disclosure Document (FDD)', 'title': 'QuickByte Technical Whitepaper & FDD', 'status': 'Under Review'}
            ]
        }
    ]

    saved_listings = {}
    for l_data in listings_data:
        territories_list = l_data.pop('territories', [])
        licenses_list = l_data.pop('licenses', [])
        challenges_list = l_data.pop('challenges', [])
        documents_list = l_data.pop('documents', [])

        listing, _ = FranchiseListing.objects.update_or_create(
            name=l_data['name'],
            defaults=l_data
        )
        saved_listings[listing.name] = listing

        # Add territories
        for t in territories_list:
            Territory.objects.update_or_create(
                franchise=listing,
                territory_name=t['territory_name'],
                defaults={'city': t['city'], 'state': t['state'], 'status': t['status'], 'is_exclusive': 1}
            )

        # Add licenses
        for lic in licenses_list:
            LicenseRequirement.objects.update_or_create(
                franchise=listing,
                license_name=lic['license_name'],
                defaults=lic
            )

        # Add challenges
        for c in challenges_list:
            SectorChallenge.objects.update_or_create(
                franchise=listing,
                challenge_title=c['challenge_title'],
                defaults=c
            )

        # Add documents
        for d in documents_list:
            FranchiseDocument.objects.update_or_create(
                franchise=listing,
                title=d['title'],
                defaults=d
            )

        print(f"[+] Franchise listing created: {listing.name} (Status: {listing.status})")

    # 6. INVESTOR PURCHASES & WORKFLOW SEEDING
    # Unit 1: Akshay Sunil owns unit of Malabar Spice Chai & Cafe in Marine Drive, Kochi
    malabar_listing = saved_listings['Malabar Spice Chai & Cafe']
    akshay_user = investor_users['akshay@gmail.com']
    ganesh_user = franchiser_users['ganesh16776@gmail.com']

    app_akshay, _ = Application.objects.update_or_create(
        investor=akshay_user,
        franchise=malabar_listing,
        defaults={
            'proposed_budget': 2450000,
            'target_location': 'Marine Drive Promenade, Kochi, Kerala',
            'experience_years': 6,
            'message': 'Highly interested in developing an flagship Malabar Spice Cafe unit along the Marine Drive waterfront. Full liquid capital is secured.',
            'status': 'Approved'
        }
    )

    contract_akshay, _ = Contract.objects.update_or_create(
        application=app_akshay,
        defaults={
            'franchise': malabar_listing,
            'investor': akshay_user,
            'franchiser': ganesh_user,
            'territory': 'Marine Drive Promenade, Kochi',
            'total_investment': 2450000,
            'royalty_terms': '6% Monthly Gross Revenue',
            'duration_years': 5,
            'status': 'Active',
            'investor_signed_at': datetime.utcnow() - timedelta(days=25),
            'franchiser_signed_at': datetime.utcnow() - timedelta(days=24),
            'digital_signature_name': 'Akshay Sunil (SHA-256 e-Signed)',
            'terms_text': f"MASTER COMMERCIAL FRANCHISE AGREEMENT\n\nParties:\nFranchiser: Malabar Spice Chai & Cafe Pvt Ltd\nInvestor / Franchisee: Akshay Sunil\nTerritory: Marine Drive Promenade, Kochi\nTotal Investment: ₹24,50,000\nDuration: 5 Years\n\n1. Exclusive commercial operation granted for designated territory.\n2. Royalty: 6% gross revenue payable monthly.\n3. Digital signature authenticated via FDSS Cryptographic Audit Registry."
        }
    )

    # Akshay Payment Record
    PaymentRecord.objects.get_or_create(
        transaction_ref='FDSS-TXN-2026-98124',
        defaults={
            'user': akshay_user,
            'related_franchise': malabar_listing,
            'related_contract': contract_akshay,
            'purpose': 'Franchise Initial Settlement & Unit Setup Fee',
            'amount': 2450000,
            'payment_type': 'Franchise Investment Deposit',
            'status': 'Successful',
            'payment_method': 'Escrow RTGS / Wire Transfer'
        }
    )

    # Unit 2: Sonu Kurian owns unit of EcoKraft Paper & Packaging Works in Coimbatore
    ecokraft_listing = saved_listings['EcoKraft Sustainable Packaging']
    sonu_user = investor_users['sonu@gmail.com']
    sreehari_user = franchiser_users['sreehari@gmail.com']

    app_sonu, _ = Application.objects.update_or_create(
        investor=sonu_user,
        franchise=ecokraft_listing,
        defaults={
            'proposed_budget': 3600000,
            'target_location': 'SIDCO Industrial Estate, Kurichi, Coimbatore',
            'experience_years': 5,
            'message': 'We have a 5,000 sq.ft industrial shed ready at SIDCO Kurichi with 3-phase commercial power connection. Ready to deploy fabrication line.',
            'status': 'Approved'
        }
    )

    contract_sonu, _ = Contract.objects.update_or_create(
        application=app_sonu,
        defaults={
            'franchise': ecokraft_listing,
            'investor': sonu_user,
            'franchiser': sreehari_user,
            'territory': 'SIDCO Kurichi Industrial Zone, Coimbatore',
            'total_investment': 3600000,
            'royalty_terms': '5% Monthly Gross Revenue',
            'duration_years': 5,
            'status': 'Active',
            'investor_signed_at': datetime.utcnow() - timedelta(days=15),
            'franchiser_signed_at': datetime.utcnow() - timedelta(days=14),
            'digital_signature_name': 'Sonu Kurian (SHA-256 e-Signed)',
            'terms_text': f"MASTER COMMERCIAL FRANCHISE AGREEMENT\n\nParties:\nFranchiser: EcoKraft Sustainable Packaging LLP\nInvestor / Franchisee: Sonu Kurian\nTerritory: SIDCO Kurichi Industrial Zone, Coimbatore\nTotal Investment: ₹36,00,000\nDuration: 5 Years\n\n1. Territory exclusive rights granted for sustainable paper fabrication.\n2. Guaranteed central buy-back agreement active for 3 years."
        }
    )

    PaymentRecord.objects.get_or_create(
        transaction_ref='FDSS-TXN-2026-74510',
        defaults={
            'user': sonu_user,
            'related_franchise': ecokraft_listing,
            'related_contract': contract_sonu,
            'purpose': 'Plant Equipment & Turnkey Franchise Capital Outlay',
            'amount': 3600000,
            'payment_type': 'Franchise Investment Deposit',
            'status': 'Successful',
            'payment_method': 'Corporate Net Banking'
        }
    )

    # Unit 3: In-Progress Deal (Pooja Nair -> Little Scholars Pre-School)
    little_scholars = saved_listings['Little Scholars Early Education & Daycare']
    pooja_user = investor_users['pooja.nair@investorhub.in']
    meera_user = franchiser_users['meera.krishnan@edukids.org']

    app_pooja, _ = Application.objects.update_or_create(
        investor=pooja_user,
        franchise=little_scholars,
        defaults={
            'proposed_budget': 2200000,
            'target_location': 'Kakkanad InfoPark Family Enclave, Kochi',
            'experience_years': 4,
            'message': 'Planning a premier daycare and Montessori pre-school catering to IT professionals in Kakkanad InfoPark area. Requesting discovery call.',
            'status': 'Under Review'
        }
    )

    Contract.objects.update_or_create(
        application=app_pooja,
        defaults={
            'franchise': little_scholars,
            'investor': pooja_user,
            'franchiser': meera_user,
            'territory': 'Kakkanad InfoPark Family Enclave, Kochi',
            'total_investment': 2200000,
            'royalty_terms': '6.5% Monthly Gross Revenue',
            'duration_years': 5,
            'status': 'Investor Review',
            'terms_text': f"MASTER COMMERCIAL FRANCHISE AGREEMENT\n\nParties:\nFranchiser: Little Scholars Early Education & Daycare\nInvestor: Pooja Nair\nTerritory: Kakkanad InfoPark, Kochi\nCapital: ₹22,00,000\n\nTerms awaiting investor e-signature and onboarding clearance."
        }
    )

    # Unit 4: In-Progress Deal (Karthik Venkatesh -> FitCore Smart Gyms)
    fitcore_listing = saved_listings['FitCore 24/7 Smart Fitness Studios']
    karthik_user = investor_users['karthik.v@capitalventures.com']
    rajesh_user = franchiser_users['rajesh.varma@fitcoreindia.com']

    Application.objects.update_or_create(
        investor=karthik_user,
        franchise=fitcore_listing,
        defaults={
            'proposed_budget': 6000000,
            'target_location': 'Gachibowli Financial District, Hyderabad',
            'experience_years': 8,
            'message': 'We possess prime 4,500 sq.ft commercial space on the 2nd floor in Gachibowli. Seeking 24/7 smart fitness franchise partnership.',
            'status': 'Submitted'
        }
    )

    print("[+] Real investor deals, signed contracts, and payment records created.")

    # 7. Real Conversations & Chat Messages
    # Conversation 1: Akshay Sunil & Ganesh Asha
    conv1, _ = Conversation.objects.get_or_create(
        investor=akshay_user,
        franchiser=ganesh_user,
        franchise=malabar_listing
    )
    MessageItem.objects.get_or_create(
        conversation=conv1,
        sender=akshay_user,
        receiver=ganesh_user,
        message_text='Hello Mr. Ganesh, our Marine Drive site interior fit-out is 80% finished. When will the espresso machine and central spice mix batch arrive?',
        defaults={'is_read': 1}
    )
    MessageItem.objects.get_or_create(
        conversation=conv1,
        sender=ganesh_user,
        receiver=akshay_user,
        message_text='Hello Akshay! Great progress. The customized espresso unit and batch 1 inventory dispatched from our Kochi central warehouse today. Arrival scheduled for Friday morning.',
        defaults={'is_read': 1}
    )

    # Conversation 2: Pooja Nair & Meera Krishnan
    conv2, _ = Conversation.objects.get_or_create(
        investor=pooja_user,
        franchiser=meera_user,
        franchise=little_scholars
    )
    MessageItem.objects.get_or_create(
        conversation=conv2,
        sender=pooja_user,
        receiver=meera_user,
        message_text='Good morning Meera, I have submitted the application for Kakkanad InfoPark territory. Could we schedule a 20-minute video discussion?',
        defaults={'is_read': 1}
    )
    MessageItem.objects.get_or_create(
        conversation=conv2,
        sender=meera_user,
        receiver=pooja_user,
        message_text='Hello Pooja, delighted to connect! I have reviewed your profile and the InfoPark zone is prime for our British Montessori model. I have scheduled our video meeting for tomorrow.',
        defaults={'is_read': 1}
    )

    # Scheduled Meeting
    MeetingItem.objects.get_or_create(
        franchise=little_scholars,
        investor=pooja_user,
        franchiser=meera_user,
        defaults={
            'meeting_type': 'Online Video Meeting',
            'scheduled_at': datetime.utcnow() + timedelta(days=1, hours=4),
            'status': 'Scheduled',
            'notes': 'Discovery session regarding Kakkanad InfoPark unit layout and curriculum rollout.',
            'meet_link': 'https://meet.google.com/fdss-demo-scholars'
        }
    )

    # 8. Real Investor Reviews
    Review.objects.get_or_create(
        franchise=malabar_listing,
        investor=akshay_user,
        defaults={
            'overall_rating': 5.0,
            'communication_rating': 5.0,
            'transparency_rating': 5.0,
            'support_rating': 5.0,
            'roi_rating': 5.0,
            'comment': 'Exceptional franchise system! The turnkey setup support in Kochi was seamless. Our daily footfall exceeded initial estimates within the first month.'
        }
    )

    Review.objects.get_or_create(
        franchise=ecokraft_listing,
        investor=sonu_user,
        defaults={
            'overall_rating': 4.8,
            'communication_rating': 4.9,
            'transparency_rating': 5.0,
            'support_rating': 4.7,
            'roi_rating': 4.8,
            'comment': 'The industrial paper packaging machines were delivered and calibrated on time. The central buy-back agreement has ensured consistent operational cash flows.'
        }
    )

    # 9. Feasibility DSS Evaluations (So history is rich)
    FeasibilityEvaluation.objects.get_or_create(
        user=akshay_user,
        franchise=malabar_listing,
        location='Marine Drive, Kochi',
        defaults={
            'capital_available': 2500000,
            'financial_score': 94,
            'location_score': 92,
            'market_score': 90,
            'competition_score': 82,
            'experience_score': 95,
            'overall_score': 92,
            'suitability_label': 'Highly Feasible',
            'recommendations': 'Ideal location with premium pedestrian footfall and strong capital liquidity buffer.',
            'breakdown': {
                'capital_adequacy': 94,
                'payback_horizon': 92,
                'location_demographics': 90,
                'risk_index': 82
            }
        }
    )

    FeasibilityEvaluation.objects.get_or_create(
        user=sonu_user,
        franchise=ecokraft_listing,
        location='SIDCO Kurichi, Coimbatore',
        defaults={
            'capital_available': 4000000,
            'financial_score': 92,
            'location_score': 88,
            'market_score': 91,
            'competition_score': 84,
            'experience_score': 90,
            'overall_score': 89,
            'suitability_label': 'Highly Feasible',
            'recommendations': 'Established industrial hub with favorable logistics access and buy-back contract security.',
            'breakdown': {
                'capital_adequacy': 92,
                'payback_horizon': 88,
                'location_demographics': 91,
                'risk_index': 84
            }
        }
    )

    # 10. Audit Logs & Support Tickets
    AuditLogItem.objects.get_or_create(
        user=admin_user,
        action='STATUTORY_DOCUMENT_APPROVAL',
        details='Administrator verified FSSAI, GSTIN, and FDD filings for Malabar Spice Chai & Cafe. Listing elevated to Active status.',
        ip_address='127.0.0.1'
    )
    AuditLogItem.objects.get_or_create(
        user=admin_user,
        action='CONTRACT_DUAL_SIGNATURE_EXECUTED',
        details='Contract #101 dual-signed by Investor Akshay Sunil and Franchiser Ganesh Asha. Unit #1 deployed in Marine Drive Kochi.',
        ip_address='127.0.0.1'
    )
    AuditLogItem.objects.get_or_create(
        user=admin_user,
        action='TRADEMARK_CLEARANCE_CHECK',
        details='Automated lexical scanner confirmed 0% collision distance for Malabar Spice Chai & Cafe.',
        ip_address='127.0.0.1'
    )

    SupportTicket.objects.get_or_create(
        ticket_number='FDSS-TCK-8812',
        defaults={
            'user': ganesh_user,
            'subject': 'Territory Expansion Quota Request for Calicut Zone',
            'category': 'Quota Revision',
            'description': 'Requesting authorization from Platform Admin to expand territorial unit allocation in Calicut district from 2 units to 4 units due to surge in investor demand.',
            'status': 'Resolved',
            'priority': 'Medium',
            'admin_response': 'Quota revision approved after inspecting verified commissary supply chain capacity.'
        }
    )

    print("=" * 60)
    print("[*] ECOSYSTEM SEEDING COMPLETE! ALL RECORDS CREATED SUCCESSFULLY.")
    print("=" * 60)

if __name__ == '__main__':
    run_seed()
