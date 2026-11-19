from django.urls import path
from . import views

urlpatterns = [
    # Health & Public Stats
    path('health/', views.health_check, name='health_check'),
    path('stats/public/', views.public_stats, name='public_stats'),

    # Authentication & Profile
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/me/', views.get_me, name='get_me'),
    path('auth/demo-switch/', views.demo_switch, name='demo_switch'),

    # Categories
    path('categories/', views.category_list, name='category_list'),

    # Franchises & Details
    path('franchises/', views.franchise_list, name='franchise_list'),
    path('franchises/check-trademark/', views.check_trademark, name='check_trademark'),
    path('franchises/<int:pk>/', views.franchise_detail, name='franchise_detail'),
    path('franchises/<int:pk>/images/', views.update_franchise_images, name='update_franchise_images'),
    path('franchises/<int:pk>/pay-listing-fee/', views.pay_listing_fee, name='pay_listing_fee'),
    path('franchises/<int:pk>/pay-maintenance/', views.pay_maintenance_fee, name='pay_maintenance_fee'),
    path('franchises/<int:pk>/territories/', views.add_territory, name='add_territory'),

    # Investor Routes
    path('investor/profile/', views.investor_profile_view, name='investor_profile'),
    path('investor/upgrade-plan/', views.upgrade_investor_plan, name='upgrade_investor_plan'),
    path('investor/favorites/', views.favorites_view, name='favorites_list'),
    path('investor/favorites/<int:pk>/', views.favorites_view, name='toggle_favorite'),
    path('investor/saved-searches/', views.saved_searches_view, name='saved_searches'),
    path('investor/portfolio/', views.investor_portfolio_view, name='investor_portfolio'),
    path('investor/feasibility/', views.feasibility_calculator, name='feasibility_calculator'),
    path('investor/feasibility-history/', views.feasibility_history_view, name='feasibility_history'),
    path('investor/applications/', views.investor_applications_view, name='investor_applications'),

    # Franchiser Routes
    path('franchiser/applications/', views.franchiser_applications_view, name='franchiser_applications'),
    path('franchiser/applications/<int:pk>/status/', views.update_application_status, name='update_application_status'),
    path('franchiser/partners/', views.franchiser_partners, name='franchiser_partners'),
    path('franchiser/analytics/', views.franchiser_analytics, name='franchiser_analytics'),

    # Contracts & Payments
    path('contracts/', views.contracts_list, name='contracts_list'),
    path('contracts/<int:pk>/sign/', views.sign_contract, name='sign_contract'),
    path('payments/', views.payments_list, name='payments_list'),
    path('payments/process/', views.process_payment, name='process_payment'),

    # Messaging & Meetings
    path('messages/conversations/', views.conversations_list, name='conversations_list'),
    path('messages/', views.messages_view, name='messages_view'),
    path('messages/<int:pk>/', views.messages_view, name='message_detail'),
    path('meetings/', views.meetings_view, name='meetings_view'),

    # Reviews
    path('reviews/', views.reviews_view, name='reviews_view'),

    # Support & Communications with Admin
    path('support-tickets/', views.support_tickets_view, name='support_tickets'),
    path('support-tickets/<int:pk>/', views.support_tickets_view, name='support_ticket_detail'),

    # Admin Control Panel
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/listings/', views.admin_listings, name='admin_listings'),
    path('admin/listings/<int:pk>/status/', views.update_listing_status, name='update_listing_status'),
    path('admin/documents/', views.admin_documents, name='admin_documents'),
    path('admin/documents/<int:pk>/', views.admin_documents, name='update_document_status'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:pk>/', views.admin_users, name='update_user_status'),
    path('admin/settings/', views.admin_settings, name='admin_settings'),
    path('admin/audit-logs/', views.admin_audit_logs, name='admin_audit_logs'),
    path('admin/support-tickets/', views.admin_support_tickets, name='admin_support_tickets'),
    path('admin/support-tickets/<int:pk>/', views.admin_support_tickets, name='update_support_ticket'),
    path('admin/fraud-reports/', views.admin_fraud_reports, name='admin_fraud_reports'),
    path('admin/fraud-reports/<int:pk>/', views.admin_fraud_reports, name='update_fraud_report'),
]

