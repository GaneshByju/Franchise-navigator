from django.core.management.base import BaseCommand
from franchises.models import (
    UserProfile, InvestorProfile, FranchiserProfile, Category, FranchiseListing,
    Territory, LicenseRequirement, SectorChallenge, FranchiseDocument, Application,
    Contract, PlatformSettings, SupportTicket
)

class Command(BaseCommand):
    help = 'Seeds initial database with default categories, users, franchises, and platform settings.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding FDSS Django database...')

        # 1. Categories
        categories_data = [
            {'name': 'Food & Beverage', 'slug': 'food-beverage', 'icon': 'Utensils', 'description': 'QSR, cafes, fine dining, and cloud kitchens.', 'avg_investment_min': 1200000, 'avg_investment_max': 5000000, 'avg_roi': 32.0},
            {'name': 'Healthcare & Pharmacy', 'slug': 'healthcare-pharmacy', 'icon': 'Activity', 'description': 'Pharmacies, diagnostic labs, and optical centers.', 'avg_investment_min': 1500000, 'avg_investment_max': 4000000, 'avg_roi': 28.5},
            {'name': 'Education & Training', 'slug': 'education-training', 'icon': 'GraduationCap', 'description': 'Pre-schools, coaching institutes, and vocational centers.', 'avg_investment_min': 1000000, 'avg_investment_max': 3000000, 'avg_roi': 35.0},
            {'name': 'Fitness & Wellness', 'slug': 'fitness-wellness', 'icon': 'Dumbbell', 'description': 'Gyms, yoga centers, and personal training studios.', 'avg_investment_min': 3500000, 'avg_investment_max': 8000000, 'avg_roi': 26.0},
            {'name': 'Retail & Fashion', 'slug': 'retail-fashion', 'icon': 'ShoppingBag', 'description': 'Apparel, footwear, electronics, and convenience stores.', 'avg_investment_min': 2000000, 'avg_investment_max': 6000000, 'avg_roi': 24.5},
            {'name': 'Automobile & Care', 'slug': 'automobile-care', 'icon': 'Wrench', 'description': 'Car detailing, tyre care, EV stations, and service workshops.', 'avg_investment_min': 1800000, 'avg_investment_max': 4500000, 'avg_roi': 30.0},
            {'name': 'Logistics & Courier', 'slug': 'logistics-courier', 'icon': 'Truck', 'description': 'Parcel counters, e-commerce hubs, and freight services.', 'avg_investment_min': 500000, 'avg_investment_max': 1500000, 'avg_roi': 34.0},
            {'name': 'Technology & IT Services', 'slug': 'technology-it', 'icon': 'Laptop', 'description': 'Software training, repair labs, and tech franchise retail.', 'avg_investment_min': 1500000, 'avg_investment_max': 3500000, 'avg_roi': 38.0},
            {'name': 'Home & Facility Services', 'slug': 'home-services', 'icon': 'Home', 'description': 'Cleaning, facility management, pest control, and maintenance.', 'avg_investment_min': 800000, 'avg_investment_max': 2000000, 'avg_roi': 40.0},
        ]

        for cat in categories_data:
            Category.objects.get_or_create(slug=cat['slug'], defaults=cat)

        # 2. Admin User
        admin_user, _ = UserProfile.objects.get_or_create(
            email='admin@fdss.com',
            defaults={
                'name': 'System Admin',
                'role': 'admin',
                'password_hash': 'admin123',
                'is_verified': True
            }
        )



        # 3. Platform Settings
        PlatformSettings.objects.get_or_create(
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

        self.stdout.write(self.style.SUCCESS('Database initialized cleanly without demo content.'))
