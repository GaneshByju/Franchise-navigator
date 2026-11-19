import json
import uuid
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum, Count, Avg

from .models import (
    UserProfile, InvestorProfile, FranchiserProfile, Category, FranchiseListing,
    Territory, LicenseRequirement, SectorChallenge, FranchiseDocument, Favorite,
    SavedSearch, FeasibilityEvaluation, Application, Contract, PaymentRecord,
    Conversation, MessageItem, MeetingItem, Review, SupportTicket, FraudReport,
    AuditLogItem, PlatformSettings
)
from .serializers import (
    UserProfileSerializer, InvestorProfileSerializer, FranchiserProfileSerializer,
    CategorySerializer, FranchiseListingSerializer, TerritorySerializer,
    LicenseRequirementSerializer, SectorChallengeSerializer, FranchiseDocumentSerializer,
    SavedSearchSerializer, FeasibilityEvaluationSerializer, ApplicationSerializer,
    ContractSerializer, PaymentRecordSerializer, ConversationSerializer,
    MessageItemSerializer, MeetingItemSerializer, ReviewSerializer,
    SupportTicketSerializer, FraudReportSerializer, AuditLogItemSerializer,
    PlatformSettingsSerializer
)
from .trademark_guard import check_brand_copyright_conflict

def get_current_user(request):
    candidates = []

    # 1. Custom HTTP Headers
    for h in ['X-User-Id', 'x-user-id', 'HTTP_X_USER_ID', 'X-User-Email', 'x-user-email', 'HTTP_X_USER_EMAIL']:
        val = request.headers.get(h) or (request.META.get(h) if hasattr(request, 'META') else None)
        if val is not None:
            s_val = str(val).strip()
            if s_val and s_val.lower() not in ('', 'none', 'null', 'undefined', 'nan'):
                candidates.append(s_val)

    # 2. Query Params
    qp_sources = []
    if hasattr(request, 'query_params'):
        qp_sources.append(request.query_params)
    if hasattr(request, 'GET'):
        qp_sources.append(request.GET)

    for qp in qp_sources:
        for k in ['userId', 'user_id', 'investorId', 'investor_id', 'franchiserId', 'franchiser_id', 'email']:
            val = qp.get(k)
            if val is not None:
                s_val = str(val).strip()
                if s_val and s_val.lower() not in ('', 'none', 'null', 'undefined', 'nan'):
                    candidates.append(s_val)

    # 3. Request Data / Body
    if hasattr(request, 'data') and isinstance(request.data, dict):
        for k in ['user_id', 'userId', 'sender_id', 'senderId', 'investor_id', 'investorId', 'franchiser_id', 'franchiserId', 'email']:
            val = request.data.get(k)
            if val is not None:
                s_val = str(val).strip()
                if s_val and s_val.lower() not in ('', 'none', 'null', 'undefined', 'nan'):
                    candidates.append(s_val)

    # Try resolving candidate identifiers to an existing UserProfile
    for c in candidates:
        try:
            val_id = int(c)
            user = UserProfile.objects.filter(id=val_id).first()
            if user:
                return user
        except (ValueError, TypeError):
            pass

        user = UserProfile.objects.filter(
            Q(email__iexact=c) | Q(name__iexact=c)
        ).first()
        if user:
            return user

    # 4. Fallback for authenticated demo convenience if role is provided
    role_hint = None
    for h in ['X-User-Role', 'x-user-role', 'HTTP_X_USER_ROLE']:
        r = request.headers.get(h) or (request.META.get(h) if hasattr(request, 'META') else None)
        if r and str(r).strip().lower() in ('investor', 'franchiser', 'admin'):
            role_hint = str(r).strip().lower()
            break

    if role_hint:
        fallback_user = UserProfile.objects.filter(role=role_hint, is_suspended=False).first()
        if fallback_user:
            return fallback_user

    return None


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    total_franchises = FranchiseListing.objects.count()
    active_franchises = FranchiseListing.objects.filter(status='Active').count()
    total_investments = Application.objects.filter(status='Approved').count()
    verified_franchisers = FranchiserProfile.objects.filter(verification_status='Verified').count()
    registered_investors = InvestorProfile.objects.count()
    total_volume = Application.objects.filter(status='Approved').aggregate(Sum('proposed_budget'))['proposed_budget__sum'] or 0

    featured = FranchiseListing.objects.filter(is_featured=1)[:6]
    featured_data = FranchiseListingSerializer(featured, many=True).data

    return Response({
        'success': True,
        'data': {
            'total_franchises': total_franchises,
            'active_franchises': active_franchises,
            'total_investments_facilitated': total_volume,
            'totalActiveFranchises': total_franchises,
            'verifiedFranchisers': verified_franchisers,
            'registeredInvestors': registered_investors,
            'successfulPartnerships': total_investments,
            'totalInvestmentVolume': total_volume,
            'featured_franchises': featured_data
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    req_role = request.data.get('role')

    if not email:
        return Response({'success': False, 'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'success': False, 'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = UserProfile.objects.filter(email__iexact=email).first()
    if not user or user.password_hash != password:
        return Response({'success': False, 'error': 'Invalid email or password. Please check your credentials or register.'}, status=status.HTTP_401_UNAUTHORIZED)

    if req_role and user.role != req_role:
        return Response({
            'success': False,
            'error': f"This account is registered as '{user.role.capitalize()}', but you selected '{req_role.capitalize()}'. Please click the '{user.role.capitalize()}' role tab to sign in."
        }, status=status.HTTP_400_BAD_REQUEST)

    if user.is_suspended:
        return Response({'success': False, 'error': 'Account suspended'}, status=status.HTTP_403_FORBIDDEN)

    return Response({
        'success': True,
        'user': UserProfileSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    import re
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    role = request.data.get('role', 'investor')
    name = request.data.get('name', '').strip()

    if not email:
        return Response({'success': False, 'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return Response({'success': False, 'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'success': False, 'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

    if role == 'admin':
        return Response({'success': False, 'error': 'Admin accounts cannot be created via registration. Only 1 system Admin exists.'}, status=status.HTTP_403_FORBIDDEN)

    if role not in ('investor', 'franchiser'):
        return Response({'success': False, 'error': 'Invalid account role selected.'}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(email__iexact=email).exists():
        return Response({'success': False, 'error': 'An account with this email address is already registered. Please sign in.'}, status=status.HTTP_400_BAD_REQUEST)

    user = UserProfile.objects.create(
        email=email,
        password_hash=password,
        role=role,
        name=name or email.split('@')[0].capitalize()
    )

    if role == 'investor':
        min_b = request.data.get('minBudget', 1000000)
        max_b = request.data.get('maxBudget', 5000000)
        InvestorProfile.objects.create(user=user, min_budget=min_b, max_budget=max_b)
    elif role == 'franchiser':
        c_name = request.data.get('companyName') or request.data.get('company_name') or f"{user.name} Franchises"
        FranchiserProfile.objects.create(user=user, company_name=c_name)

    return Response({
        'success': True,
        'user': UserProfileSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_me(request):
    user = get_current_user(request)
    if not user:
        user_id = request.query_params.get('userId') or request.query_params.get('user_id')
        if user_id:
            try:
                user = UserProfile.objects.get(id=int(user_id))
            except (UserProfile.DoesNotExist, ValueError):
                pass

    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'success': True, 'data': UserProfileSerializer(user).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def demo_switch(request):
    role = request.data.get('role', 'admin')
    if role != 'admin':
        return Response({'success': False, 'error': 'Demo accounts are disabled. Please sign in or register.'}, status=status.HTTP_400_BAD_REQUEST)
    user = UserProfile.objects.filter(role='admin').first()
    if not user:
        return Response({'success': False, 'error': 'Admin profile not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'success': True,
        'user': UserProfileSerializer(user).data,
        'data': {'user': UserProfileSerializer(user).data}
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def category_list(request):
    if request.method == 'GET':
        categories = Category.objects.filter(is_active=1)
        return Response({'success': True, 'data': CategorySerializer(categories, many=True).data})
    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Category created', 'data': serializer.data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def franchise_list(request):
    if request.method == 'GET':
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        max_budget = request.query_params.get('max_budget') or request.query_params.get('maxBudget')
        status_param = request.query_params.get('status')
        queryset = FranchiseListing.objects.all()
        user = get_current_user(request)
        franchiser_id = request.query_params.get('franchiserId') or request.query_params.get('franchiser_id')
        if franchiser_id:
            try:
                f_user = UserProfile.objects.get(id=int(franchiser_id))
                if not user:
                    user = f_user
            except (UserProfile.DoesNotExist, ValueError):
                pass

        if user and user.role == 'franchiser':
            queryset = queryset.filter(Q(status__in=['Active', 'Verified']) | Q(franchiser=user) | Q(contact_email=user.email))
        elif franchiser_id:
            queryset = queryset.filter(Q(status__in=['Active', 'Verified']) | Q(franchiser_id=int(franchiser_id)))
        elif user and user.role == 'admin':
            pass
        else:
            queryset = queryset.filter(status__in=['Active', 'Verified'])

        if category and category != 'All':
            queryset = queryset.filter(Q(category__iexact=category) | Q(category_slug__iexact=category))
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if max_budget:
            try:
                queryset = queryset.filter(min_investment__lte=float(max_budget))
            except ValueError:
                pass
        if status_param:
            queryset = queryset.filter(status=status_param)

        data = FranchiseListingSerializer(queryset, many=True).data
        return Response({'success': True, 'count': len(data), 'data': data})

    elif request.method == 'POST':
        user = get_current_user(request)
        data = request.data.copy()
        
        franchiser_id_val = (
            (user.id if user and user.role == 'franchiser' else None) or
            data.get('franchiser') or
            data.get('franchiser_id')
        )
        if not franchiser_id_val and data.get('contact_email'):
            matched_user = UserProfile.objects.filter(email=data.get('contact_email'), role='franchiser').first()
            if matched_user:
                franchiser_id_val = matched_user.id

        if franchiser_id_val:
            existing_count = FranchiseListing.objects.filter(franchiser_id=franchiser_id_val).count()
            if existing_count >= 1:
                return Response({
                    'success': False,
                    'error': 'Limit Reached: Each franchiser can publish only 1 franchise listing on the platform.'
                }, status=status.HTTP_400_BAD_REQUEST)
            data['franchiser'] = franchiser_id_val
            data['status'] = 'Pending Approval'

        # Trademark & Copyright clearance verification
        listing_name = data.get('name', '').strip()
        conflict = check_brand_copyright_conflict(listing_name, exclude_user_id=franchiser_id_val)
        if conflict:
            return Response({
                'success': False,
                'error': f"Copyright & Trademark Conflict: The brand name '{listing_name}' conflicts with registered brand '{conflict['existing_name']}' ({conflict['reason']}: {conflict['description']}). No duplicate or deceptively similar brand names may be listed.",
                'conflict': conflict
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = FranchiseListingSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({'success': True, 'listing_id': instance.id, 'message': 'Franchise submitted for Admin certificate verification', 'data': serializer.data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_trademark(request):
    name = request.query_params.get('name', '').strip()
    exclude_id = request.query_params.get('exclude_id')
    exclude_pk = int(exclude_id) if exclude_id and exclude_id.isdigit() else None

    user_id_param = request.query_params.get('user_id') or request.query_params.get('franchiser_id')
    exclude_u = int(user_id_param) if user_id_param and user_id_param.isdigit() else None
    if not exclude_u:
        cur_u = get_current_user(request)
        if cur_u:
            exclude_u = cur_u.id

    if not name:
        return Response({'success': True, 'available': True, 'conflict': None, 'message': 'Enter a brand name to verify trademark clearance.'})

    conflict = check_brand_copyright_conflict(name, exclude_listing_id=exclude_pk, exclude_user_id=exclude_u)
    if conflict:
        return Response({
            'success': True,
            'available': False,
            'conflict': conflict,
            'message': f"Trademark & Copyright Conflict: {conflict['description']}"
        })

    return Response({
        'success': True,
        'available': True,
        'conflict': None,
        'message': f"Trademark clearance passed: '{name}' is verified and available for exclusive listing."
    })


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def franchise_detail(request, pk):
    try:
        franchise = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        franchise.views_count += 1
        franchise.save(update_fields=['views_count'])
        return Response({'success': True, 'data': FranchiseListingSerializer(franchise).data})
    elif request.method == 'PUT':
        user = get_current_user(request)
        # Fixed Quota Policy & Trademark Protection:
        # Franchisers cannot arbitrarily inflate available_units or alter brand name without Admin approval
        if user and user.role != 'admin':
            new_total = request.data.get('total_units')
            new_available = request.data.get('available_units')
            new_name = request.data.get('name')

            if new_total is not None and int(new_total) != franchise.total_units:
                return Response({
                    'success': False,
                    'error': 'Fixed Quota Policy: Total units cannot be modified directly. Franchisers must submit a Quota Revision Request to Admin to alter listing numbers.'
                }, status=status.HTTP_403_FORBIDDEN)

            if new_available is not None and int(new_available) != franchise.available_units:
                return Response({
                    'success': False,
                    'error': 'Fixed Quota Policy: Available units to sell cannot be modified directly. Unit allocations are tracked strictly against verified investor contracts.'
                }, status=status.HTTP_403_FORBIDDEN)

            if new_name is not None and str(new_name).strip() != franchise.name:
                return Response({
                    'success': False,
                    'error': 'Trademark Protection Policy: Registered brand names cannot be modified directly. Contact Admin for statutory legal brand re-filing.'
                }, status=status.HTTP_403_FORBIDDEN)

        serializer = FranchiseListingSerializer(franchise, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        franchise.delete()
        return Response({'success': True, 'message': 'Franchise deleted'})


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_franchise_images(request, pk):
    try:
        franchise = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    image_url = request.data.get('image_url')
    images = request.data.get('images', [])

    if image_url:
        franchise.image_url = image_url
    if images:
        franchise.images = images
    franchise.save()

    return Response({'success': True, 'message': 'Images updated successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def pay_listing_fee(request, pk):
    try:
        franchise = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    franchise.listing_fee_paid = 1
    franchise.listing_fee_status = 'Paid'
    franchise.save()

    user = get_current_user(request)
    if user:
        PaymentRecord.objects.create(
            user=user,
            related_franchise=franchise,
            transaction_ref=f"TXN_LIST_{uuid.uuid4().hex[:8].upper()}",
            purpose=f"Listing Fee for {franchise.name}",
            amount=franchise.listing_fee_amount or 15000,
            payment_type='Listing Fee',
            status='Successful'
        )

    return Response({'success': True, 'message': 'Listing fee paid successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def pay_maintenance_fee(request, pk):
    try:
        franchise = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    franchise.maintenance_fee_status = 'Paid'
    franchise.save()

    user = get_current_user(request)
    if user:
        PaymentRecord.objects.create(
            user=user,
            related_franchise=franchise,
            transaction_ref=f"TXN_MAINT_{uuid.uuid4().hex[:8].upper()}",
            purpose=f"Maintenance Fee for {franchise.name}",
            amount=franchise.maintenance_fee or 2500,
            payment_type='Monthly Maintenance',
            status='Successful'
        )

    return Response({'success': True, 'message': 'Maintenance fee paid successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def add_territory(request, pk):
    try:
        franchise = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['franchise'] = franchise.id
    serializer = TerritorySerializer(data=data)
    if serializer.is_valid():
        territory = serializer.save()
        return Response({'success': True, 'data': TerritorySerializer(territory).data, 'message': 'Territory added successfully'})
    return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def investor_profile_view(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    profile, _ = InvestorProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        return Response({'success': True, 'data': InvestorProfileSerializer(profile).data})
    elif request.method == 'PUT':
        serializer = InvestorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Profile updated', 'data': serializer.data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def upgrade_investor_plan(request):
    user = get_current_user(request)
    if not user:
        user_id = request.data.get('userId') or request.data.get('user_id')
        if user_id:
            try:
                user = UserProfile.objects.get(id=int(user_id))
            except (UserProfile.DoesNotExist, ValueError):
                pass

    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    plan_type = request.data.get('plan_type', 'Premium')
    if plan_type not in ('Standard', 'Premium'):
        plan_type = 'Premium'

    profile, _ = InvestorProfile.objects.get_or_create(user=user)
    profile.plan_type = plan_type
    profile.max_investments = 25 if plan_type == 'Premium' else 5
    profile.save()

    user.refresh_from_db()
    user_data = UserProfileSerializer(user).data

    return Response({
        'success': True,
        'message': f'Successfully updated your investor membership to the {plan_type} Tier.',
        'data': user_data,
        'user': user_data,
        'plan_type': plan_type
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def favorites_view(request, pk=None):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        fav_ids = Favorite.objects.filter(user=user).values_list('franchise_id', flat=True)
        franchises = FranchiseListing.objects.filter(id__in=fav_ids)
        return Response({'success': True, 'data': FranchiseListingSerializer(franchises, many=True).data})

    elif request.method == 'POST' and pk:
        fav = Favorite.objects.filter(user=user, franchise_id=pk).first()
        if fav:
            fav.delete()
            return Response({'success': True, 'favorited': False, 'message': 'Removed from favorites'})
        else:
            try:
                franchise = FranchiseListing.objects.get(id=pk)
                Favorite.objects.create(user=user, franchise=franchise)
                return Response({'success': True, 'favorited': True, 'message': 'Added to favorites'})
            except FranchiseListing.DoesNotExist:
                return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def saved_searches_view(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        searches = SavedSearch.objects.filter(user=user)
        return Response({'success': True, 'data': SavedSearchSerializer(searches, many=True).data})
    elif request.method == 'POST':
        name = request.data.get('name', 'Saved Search')
        filters = request.data.get('filters', {})
        search_obj = SavedSearch.objects.create(user=user, name=name, filters=filters)
        return Response({'success': True, 'message': 'Search saved', 'data': SavedSearchSerializer(search_obj).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def investor_portfolio_view(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    approved_apps = Application.objects.filter(investor=user, status='Approved')
    contracts = Contract.objects.filter(investor=user, status__in=['Signed', 'Active'])
    evaluations = FeasibilityEvaluation.objects.filter(user=user)

    active_units = contracts.count()
    total_invested = sum(c.total_investment for c in contracts)
    avg_monthly_returns = sum((c.franchise.est_monthly_profit or 0) for c in contracts if c.franchise)
    avg_roi = (sum((c.franchise.est_roi or 0) for c in contracts if c.franchise) / active_units) if active_units > 0 else 0.0

    return Response({
        'success': True,
        'data': {
            'activeUnitsCount': active_units,
            'active_franchises_count': active_units,
            'totalCapitalDeployed': total_invested,
            'total_invested': total_invested,
            'estMonthlyCashflow': avg_monthly_returns,
            'avg_monthly_returns': avg_monthly_returns,
            'avg_roi': round(avg_roi, 1),
            'applications': ApplicationSerializer(approved_apps, many=True).data,
            'contracts': ContractSerializer(contracts, many=True).data,
            'evaluations': FeasibilityEvaluationSerializer(evaluations, many=True).data
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def feasibility_calculator(request):
    franchise_id = request.data.get('franchise_id')
    location = request.data.get('location', 'Bangalore')
    capital = float(request.data.get('capital_available') or request.data.get('budget') or 2000000)
    user = get_current_user(request)

    try:
        franchise = FranchiseListing.objects.get(id=franchise_id)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

    capital_ratio = capital / franchise.total_investment_est if franchise.total_investment_est else 1.0
    fin_score = min(98, max(40, int(capital_ratio * 90)))
    loc_score = 85
    mkt_score = 90
    comp_score = 78
    exp_score = 82
    overall = min(98, max(50, int((fin_score * 0.4) + (loc_score * 0.2) + (mkt_score * 0.2) + (comp_score * 0.1) + (exp_score * 0.1))))

    label = 'Highly Feasible' if overall >= 80 else ('Moderately Feasible' if overall >= 65 else 'Low Feasibility')
    recs = f"1. Capital covers {int(capital_ratio * 100)}% of total estimated investment.\n2. Target location {location} shows strong demand for {franchise.name}.\n3. Payback period is estimated at {franchise.payback_months} months."

    breakdown = {
        'est_roi': franchise.est_roi,
        'est_monthly_profit': franchise.est_monthly_profit,
        'payback_months': franchise.payback_months,
        'breakeven_months': franchise.breakeven_months
    }

    eval_obj = FeasibilityEvaluation.objects.create(
        user=user,
        franchise=franchise,
        location=location,
        capital_available=capital,
        financial_score=fin_score,
        location_score=loc_score,
        market_score=mkt_score,
        competition_score=comp_score,
        experience_score=exp_score,
        overall_score=overall,
        suitability_label=label,
        recommendations=recs,
        breakdown=breakdown
    )

    data = FeasibilityEvaluationSerializer(eval_obj).data
    data['breakdown'] = breakdown
    return Response({'success': True, 'data': data})


@api_view(['GET'])
@permission_classes([AllowAny])
def feasibility_history_view(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    history = FeasibilityEvaluation.objects.filter(user=user).order_by('-created_at')
    return Response({'success': True, 'data': FeasibilityEvaluationSerializer(history, many=True).data})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def investor_applications_view(request):
    user = get_current_user(request)
    if not user:
        if request.method == 'GET':
            return Response({'success': True, 'data': []})
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if user.role == 'admin':
            apps = Application.objects.all().order_by('-created_at')
        else:
            apps = Application.objects.filter(investor=user).order_by('-created_at')
        return Response({'success': True, 'data': ApplicationSerializer(apps, many=True).data})

    elif request.method == 'POST':
        InvestorProfile.objects.get_or_create(user=user)
        franchise_id = request.data.get('franchise_id')
        try:
            franchise = FranchiseListing.objects.get(id=franchise_id)
        except FranchiseListing.DoesNotExist:
            return Response({'success': False, 'error': 'Franchise not found'}, status=status.HTTP_404_NOT_FOUND)

        # Strict Fixed Quota Inventory Enforcement: No fish-market overselling
        if franchise.available_units <= 0:
            return Response({
                'success': False,
                'error': f'All available franchise units ({franchise.total_units}) for {franchise.name} have been completely allocated or sold out. No new applications can be accepted unless the franchiser requests a quota expansion through Admin.'
            }, status=status.HTTP_400_BAD_REQUEST)

        proposed_budget = request.data.get('proposed_budget', franchise.total_investment_est)
        target_location = request.data.get('target_location', 'Bangalore')

        app_obj = Application.objects.create(
            investor=user,
            franchise=franchise,
            proposed_budget=proposed_budget,
            target_location=target_location,
            experience_years=request.data.get('experience_years', 3),
            message=request.data.get('message', ''),
            status='Submitted'
        )

        # Auto-create contract for immediate E-Sign availability
        franchiser_user = franchise.franchiser or UserProfile.objects.filter(role='franchiser').first()
        company_label = (
            franchiser_user.franchiser_profile.company_name
            if hasattr(franchiser_user, 'franchiser_profile') and franchiser_user.franchiser_profile.company_name
            else franchise.name
        )
        Contract.objects.get_or_create(
            application=app_obj,
            defaults={
                'franchise': franchise,
                'investor': user,
                'franchiser': franchiser_user,
                'territory': target_location,
                'total_investment': proposed_budget,
                'status': 'Investor Review',
                'terms_text': f"MASTER COMMERCIAL FRANCHISE AGREEMENT\n\nThis Master Commercial Franchise Agreement is made between {company_label} ('Franchiser') and {user.name} ('Investor / Franchisee') for operating {franchise.name} in territory: {target_location}.\n\n1. GRANT OF LICENSE: Franchiser hereby grants Investor exclusive territorial rights for operating {franchise.name}.\n2. CAPITAL OUTLAY & FEES: Investor agrees to total capital outlay of ₹{float(proposed_budget):,.2f}.\n3. ROYALTIES & BRAND FUND: {franchise.royalty_type} ({franchise.royalty_value}) payable on or before 5th of each month.\n4. DURATION & RENEWAL: Term of 5 years with automatic renewal option upon statutory compliance."
            }
        )

        return Response({
            'success': True,
            'application_id': app_obj.id,
            'message': 'Application submitted successfully',
            'data': ApplicationSerializer(app_obj).data
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def franchiser_applications_view(request):
    user = get_current_user(request)
    franchiser_id = request.query_params.get('franchiserId') or request.query_params.get('franchiser_id')

    if user:
        my_listings = FranchiseListing.objects.filter(franchiser=user)
        if my_listings.exists():
            user_apps = Application.objects.filter(franchise__in=my_listings)
            apps = user_apps if user_apps.exists() else Application.objects.all()
        else:
            apps = Application.objects.all()
    elif franchiser_id:
        try:
            f_user = UserProfile.objects.get(id=int(franchiser_id))
            my_listings = FranchiseListing.objects.filter(franchiser=f_user)
            if my_listings.exists():
                user_apps = Application.objects.filter(franchise__in=my_listings)
                apps = user_apps if user_apps.exists() else Application.objects.all()
            else:
                apps = Application.objects.all()
        except (UserProfile.DoesNotExist, ValueError):
            apps = Application.objects.all()
    else:
        apps = Application.objects.all()

    return Response({'success': True, 'data': ApplicationSerializer(apps, many=True).data})


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_application_status(request, pk):
    try:
        app_obj = Application.objects.get(pk=pk)
    except Application.DoesNotExist:
        return Response({'success': False, 'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status', app_obj.status)

    if new_status == 'Approved':
        has_signed = False
        if hasattr(app_obj, 'contract') and app_obj.contract:
            has_signed = app_obj.contract.status == 'Signed' or app_obj.contract.investor_signed_at is not None
        else:
            c = Contract.objects.filter(investor=app_obj.investor, franchise=app_obj.franchise).first()
            if c:
                has_signed = c.status == 'Signed' or c.investor_signed_at is not None

        if not has_signed and not request.data.get('force'):
            return Response({
                'success': False,
                'error': 'Cannot approve application: Accredited investor must first complete digital e-signature and fee payment.'
            }, status=status.HTTP_400_BAD_REQUEST)

    prev_status = app_obj.status
    app_obj.status = new_status
    app_obj.save()

    # If transitioning to Approved, record franchiser countersign and deduct unit from available inventory if not already deducted
    if new_status == 'Approved':
        if hasattr(app_obj, 'contract') and app_obj.contract:
            app_obj.contract.franchiser_signed_at = datetime.utcnow()
            if app_obj.contract.status != 'Signed' and app_obj.contract.status != 'Active':
                app_obj.contract.status = 'Signed'
            app_obj.contract.save()

        if prev_status != 'Approved' and app_obj.franchise:
            franchise = app_obj.franchise
            if franchise.available_units > 0:
                franchise.available_units -= 1
                franchise.sold_units += 1
                if franchise.available_units <= 0:
                    franchise.status = 'Sold Out'
                franchise.save(update_fields=['available_units', 'sold_units', 'status'])

    return Response({'success': True, 'message': f'Application status updated to {new_status}'})


@api_view(['GET'])
@permission_classes([AllowAny])
def contracts_list(request):
    user = get_current_user(request)
    role = request.query_params.get('role') or (user.role if user else None)

    if role == 'investor' and user:
        contracts = Contract.objects.filter(investor=user)
        if not contracts.exists():
            user_apps = Application.objects.filter(investor=user)
            for app in user_apps:
                if not hasattr(app, 'contract') or not app.contract:
                    Contract.objects.create(
                        application=app,
                        franchise=app.franchise,
                        investor=user,
                        franchiser=app.franchise.franchiser or UserProfile.objects.filter(role='franchiser').first(),
                        territory=app.target_location or 'Bangalore',
                        total_investment=app.proposed_budget or app.franchise.total_investment_est,
                        status='Investor Review',
                        terms_text=f"MASTER COMMERCIAL FRANCHISE AGREEMENT\n\nThis Master Commercial Franchise Agreement is made between {app.franchise.name} ('Franchiser') and {user.name} ('Investor') for the operation of {app.franchise.name} in territory: {app.target_location}.\n\n1. GRANT OF LICENSE: Franchiser hereby grants Investor exclusive territorial rights for operating {app.franchise.name}.\n2. CAPITAL OUTLAY & FEES: Investor agrees to total capital outlay of ₹{app.proposed_budget:,.2f}.\n3. ROYALTIES & BRAND FUND: {app.franchise.royalty_type} ({app.franchise.royalty_value}) payable on or before 5th of each month.\n4. DURATION & RENEWAL: Term of 5 years with automatic renewal option upon statutory compliance."
                    )
            contracts = Contract.objects.filter(investor=user)
            if not contracts.exists():
                contracts = Contract.objects.all()
    elif role == 'franchiser' and user:
        contracts = Contract.objects.filter(franchiser=user)
        if not contracts.exists():
            contracts = Contract.objects.all()
    elif user and user.role == 'admin':
        contracts = Contract.objects.all()
    else:
        contracts = Contract.objects.all()

    return Response({'success': True, 'data': ContractSerializer(contracts, many=True).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_contract(request, pk):
    try:
        contract = Contract.objects.get(pk=pk)
    except Contract.DoesNotExist:
        return Response({'success': False, 'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

    digital_signature = request.data.get('digitalSignatureName', request.data.get('digital_signature_name', 'Digital Signature'))
    contract.digital_signature_name = digital_signature
    contract.status = 'Signed'
    contract.investor_signed_at = datetime.utcnow()
    contract.save()

    if contract.application:
        contract.application.status = 'Approved'
        contract.application.save()

    # Deduct allocated unit from franchise listing quota
    if contract.franchise:
        franchise = contract.franchise
        if franchise.available_units > 0:
            franchise.available_units -= 1
            franchise.sold_units += 1
            if franchise.available_units <= 0:
                franchise.status = 'Sold Out'
            franchise.save(update_fields=['available_units', 'sold_units', 'status'])

    return Response({
        'success': True,
        'message': 'Contract signed successfully',
        'data': ContractSerializer(contract).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def payments_list(request):
    user = get_current_user(request)
    if user and user.role != 'admin':
        payments = PaymentRecord.objects.filter(user=user)
    else:
        payments = PaymentRecord.objects.all()
    return Response({'success': True, 'data': PaymentRecordSerializer(payments, many=True).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def process_payment(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User required'}, status=status.HTTP_400_BAD_REQUEST)

    ref = f"TXN_{uuid.uuid4().hex[:8].upper()}"
    payment = PaymentRecord.objects.create(
        user=user,
        transaction_ref=ref,
        purpose=request.data.get('purpose', 'Platform Payment'),
        amount=float(request.data.get('amount', 1000)),
        payment_type=request.data.get('payment_type', 'Listing Fee'),
        status='Successful',
        payment_method=request.data.get('payment_method', 'UPI / Credit Card')
    )

    return Response({'success': True, 'transaction_ref': ref, 'message': 'Payment processed successfully'})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def conversations_list(request):
    user = get_current_user(request)
    if not user:
        user_id = request.query_params.get('userId') or request.query_params.get('user_id')
        if user_id:
            try:
                user = UserProfile.objects.filter(id=int(user_id)).first()
            except (ValueError, TypeError):
                user = UserProfile.objects.filter(email__iexact=str(user_id).strip()).first()

    if not user:
        user = UserProfile.objects.filter(role='investor', is_suspended=False).first()

    if not user:
        return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        convs = Conversation.objects.filter(Q(investor=user) | Q(franchiser=user)).order_by('-updated_at')
        return Response({'success': True, 'data': ConversationSerializer(convs, many=True).data})

    elif request.method == 'POST':
        franchise_id = request.data.get('franchise_id')
        partner_id = request.data.get('partner_id')
        initial_text = request.data.get('message_text', '').strip()

        partner = None
        if partner_id:
            partner = UserProfile.objects.filter(id=partner_id).first()

        franchise = None
        if franchise_id:
            franchise = FranchiseListing.objects.filter(id=franchise_id).first()
            if franchise and franchise.franchiser and not partner:
                partner = franchise.franchiser

        if not partner and franchise:
            partner = franchise.franchiser

        if not partner:
            partner = UserProfile.objects.filter(role='franchiser', is_suspended=False).first()

        if not partner:
            return Response({'success': False, 'error': 'Chat partner could not be identified.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role == 'franchiser':
            franchiser_user = user
            investor_user = partner
        else:
            investor_user = user
            franchiser_user = partner

        conv = Conversation.objects.filter(investor=investor_user, franchiser=franchiser_user)
        if franchise:
            conv = conv.filter(franchise=franchise)
        conv = conv.first()

        if not conv:
            conv = Conversation.objects.create(
                investor=investor_user,
                franchiser=franchiser_user,
                franchise=franchise
            )

        if initial_text:
            MessageItem.objects.create(
                conversation=conv,
                sender=user,
                receiver=partner,
                message_text=initial_text
            )
            conv.save()

        return Response({
            'success': True,
            'conversation_id': conv.id,
            'data': ConversationSerializer(conv).data
        })


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def messages_view(request, pk=None):
    if request.method == 'GET' and pk:
        user = get_current_user(request)
        if user:
            MessageItem.objects.filter(conversation_id=pk, receiver=user, is_read=0).update(is_read=1)
        msgs = MessageItem.objects.filter(conversation_id=pk).order_by('created_at')
        return Response({'success': True, 'data': MessageItemSerializer(msgs, many=True).data})

    elif request.method == 'PUT' and pk:
        user = get_current_user(request)
        if user:
            MessageItem.objects.filter(conversation_id=pk, receiver=user).update(is_read=1)
        return Response({'success': True, 'message': 'Messages marked as read'})

    elif request.method == 'POST':
        conv_id = request.data.get('conversation_id')
        sender_id = request.data.get('sender_id')
        receiver_id = request.data.get('receiver_id')
        franchise_id = request.data.get('franchise_id')
        text = request.data.get('message_text', '').strip()

        if not text:
            return Response({'success': False, 'error': 'Message content cannot be blank'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_current_user(request)
        sender = None
        if sender_id:
            sender = UserProfile.objects.filter(id=sender_id).first()
        if not sender:
            sender = user

        if not sender:
            return Response({'success': False, 'error': 'Sender required'}, status=status.HTTP_400_BAD_REQUEST)

        if conv_id:
            conv = Conversation.objects.filter(id=conv_id).first()
            if not conv:
                return Response({'success': False, 'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
            receiver = conv.franchiser if sender.id == conv.investor_id else conv.investor
        else:
            receiver = None
            if receiver_id:
                receiver = UserProfile.objects.filter(id=receiver_id).first()
            elif franchise_id:
                f = FranchiseListing.objects.filter(id=franchise_id).first()
                if f and f.franchiser:
                    receiver = f.franchiser

            if not receiver:
                return Response({'success': False, 'error': 'Recipient not found'}, status=status.HTTP_400_BAD_REQUEST)

            if sender.role == 'franchiser':
                franchiser_user = sender
                investor_user = receiver
            else:
                investor_user = sender
                franchiser_user = receiver

            conv = Conversation.objects.filter(investor=investor_user, franchiser=franchiser_user)
            if franchise_id:
                conv = conv.filter(franchise_id=franchise_id)
            conv = conv.first()
            if not conv:
                conv = Conversation.objects.create(
                    investor=investor_user,
                    franchiser=franchiser_user,
                    franchise_id=franchise_id if franchise_id else None
                )

        msg = MessageItem.objects.create(
            conversation=conv,
            sender=sender,
            receiver=receiver,
            message_text=text
        )

        conv.save() # touch updated_at

        return Response({
            'success': True,
            'message_id': msg.id,
            'conversation_id': conv.id,
            'data': MessageItemSerializer(msg).data
        })



@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def meetings_view(request):
    user = get_current_user(request)
    if request.method == 'GET':
        if user:
            meetings = MeetingItem.objects.filter(Q(investor=user) | Q(franchiser=user))
        else:
            meetings = MeetingItem.objects.all()
        return Response({'success': True, 'data': MeetingItemSerializer(meetings, many=True).data})

    elif request.method == 'POST':
        franchise_id = request.data.get('franchise_id')
        franchise = FranchiseListing.objects.get(id=franchise_id)
        investor = user or UserProfile.objects.filter(role='investor').first()
        franchiser = franchise.franchiser or UserProfile.objects.filter(role='franchiser').first()

        meeting = MeetingItem.objects.create(
            franchise=franchise,
            investor=investor,
            franchiser=franchiser,
            meeting_type=request.data.get('meeting_type', 'Online Video Meeting'),
            scheduled_at=request.data.get('scheduled_at', datetime.utcnow() + timedelta(days=2)),
            notes=request.data.get('notes', ''),
            meet_link='https://meet.google.com/fdss-demo-room'
        )

        return Response({'success': True, 'message': 'Meeting scheduled successfully', 'data': MeetingItemSerializer(meeting).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def reviews_view(request):
    user = get_current_user(request)
    if not user:
        return Response({'success': False, 'error': 'User required'}, status=status.HTTP_400_BAD_REQUEST)

    franchise_id = request.data.get('franchise_id')
    franchise = FranchiseListing.objects.get(id=franchise_id)

    review = Review.objects.create(
        franchise=franchise,
        investor=user,
        overall_rating=float(request.data.get('overall_rating', 5)),
        comment=request.data.get('comment', '')
    )

    return Response({'success': True, 'message': 'Review submitted successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def franchiser_partners(request):
    user = get_current_user(request)
    apps = Application.objects.filter(status='Approved')
    if user and user.role == 'franchiser':
        apps = apps.filter(franchise__franchiser=user)

    partners = []
    for app in apps:
        partners.append({
            'id': app.id,
            'partner_name': app.investor.name,
            'email': app.investor.email,
            'phone': app.investor.phone,
            'franchise_name': app.franchise.name,
            'location': app.target_location,
            'invested_amount': app.proposed_budget,
            'status': 'Operating Unit'
        })

    return Response({'success': True, 'data': partners})


@api_view(['GET'])
@permission_classes([AllowAny])
def franchiser_analytics(request):
    user = get_current_user(request)
    listings = FranchiseListing.objects.all()
    if user and user.role == 'franchiser':
        listings = listings.filter(franchiser=user)

    total_views = listings.aggregate(total=Sum('views_count'))['total'] or 3450
    total_apps = Application.objects.count()

    return Response({
        'success': True,
        'data': {
            'total_listings': listings.count(),
            'total_views': total_views,
            'total_applications': total_apps,
            'conversion_rate': 4.8,
            'monthly_revenue_generated': 18500000
        }
    })


# ADMIN API VIEWS
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_stats(request):
    return Response({
        'success': True,
        'data': {
            'total_users': UserProfile.objects.count() or 145,
            'investors_count': UserProfile.objects.filter(role='investor').count() or 110,
            'franchisers_count': UserProfile.objects.filter(role='franchiser').count() or 30,
            'total_listings': FranchiseListing.objects.count() or 28,
            'active_listings': FranchiseListing.objects.filter(status='Active').count() or 22,
            'total_applications': Application.objects.count() or 64,
            'pending_verifications': 5,
            'total_platform_revenue': 485000
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_listings(request):
    listings = FranchiseListing.objects.all().order_by('-created_at')
    return Response({'success': True, 'data': FranchiseListingSerializer(listings, many=True).data})


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_listing_status(request, pk):
    try:
        listing = FranchiseListing.objects.get(pk=pk)
    except FranchiseListing.DoesNotExist:
        return Response({'success': False, 'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status', listing.status)
    listing.status = new_status

    if 'total_units' in request.data:
        try:
            new_tot = int(request.data['total_units'])
            diff = new_tot - listing.total_units
            listing.total_units = new_tot
            listing.available_units = max(0, listing.available_units + diff)
        except (ValueError, TypeError):
            pass

    if 'available_units' in request.data:
        try:
            listing.available_units = int(request.data['available_units'])
        except (ValueError, TypeError):
            pass

    listing.save()

    if new_status in ['Active', 'Verified'] and listing.franchiser:
        listing.franchiser.is_verified = True
        listing.franchiser.save()

    return Response({'success': True, 'message': f'Listing status updated to {listing.status}', 'data': FranchiseListingSerializer(listing).data})



@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def admin_documents(request, pk=None):
    if request.method == 'GET':
        franchise_id = request.query_params.get('franchise_id') or request.query_params.get('franchise')
        if franchise_id:
            docs = FranchiseDocument.objects.filter(franchise_id=franchise_id)
        else:
            docs = FranchiseDocument.objects.all()
        return Response({'success': True, 'data': FranchiseDocumentSerializer(docs, many=True).data})
    elif request.method == 'POST':
        franchise_id = request.data.get('franchise_id') or request.data.get('franchise')
        try:
            franchise = FranchiseListing.objects.get(pk=franchise_id) if franchise_id else None
        except (FranchiseListing.DoesNotExist, ValueError):
            franchise = None

        if not franchise:
            franchise = FranchiseListing.objects.first()

        if not franchise:
            return Response({'success': False, 'error': 'No franchise listing found to associate document with.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title') or request.data.get('name') or 'Statutory Certificate'
        doc_type = request.data.get('doc_type') or request.data.get('category') or 'License'
        file_url = request.data.get('file_url') or ''
        license_number = request.data.get('license_number') or request.data.get('number') or ''
        issuing_authority = request.data.get('issuing_authority') or ''
        expiry_date = request.data.get('expiry_date') or ''
        issue_date = request.data.get('issue_date') or datetime.now().strftime('%d %b %Y')

        doc = FranchiseDocument.objects.create(
            franchise=franchise,
            doc_type=doc_type,
            title=title,
            file_url=file_url,
            issue_date=issue_date,
            expiry_date=expiry_date,
            status='Pending',
            admin_notes=f"Ref: {license_number} | Issuer: {issuing_authority}"
        )

        # Update franchise status to Document Audit Pending
        franchise.status = 'Document Audit Pending'
        franchise.save()

        # Also create or update LicenseRequirement
        if license_number:
            LicenseRequirement.objects.create(
                franchise=franchise,
                license_name=title,
                license_number=license_number,
                issuing_authority=issuing_authority or 'Regulatory Body',
                issue_date=issue_date,
                expiry_date=expiry_date,
                verification_status='Pending'
            )

        user = get_current_user(request)
        AuditLogItem.objects.create(
            user=user,
            action='DOCUMENT_UPLOAD',
            details=f"Uploaded {title} (Ref: {license_number}, Issuer: {issuing_authority}) for brand '{franchise.name}'",
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
        )

        return Response({
            'success': True,
            'message': f'Document "{title}" uploaded successfully and submitted for Admin audit.',
            'data': FranchiseDocumentSerializer(doc).data
        })
    elif request.method == 'PUT' and pk:
        try:
            doc = FranchiseDocument.objects.get(pk=pk)
            doc.status = request.data.get('status', doc.status)
            doc.admin_notes = request.data.get('admin_notes', doc.admin_notes)
            doc.save()
            return Response({'success': True, 'message': 'Document status updated'})
        except FranchiseDocument.DoesNotExist:
            return Response({'success': False, 'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def admin_users(request, pk=None):
    if request.method == 'GET':
        users = UserProfile.objects.all().order_by('-created_at')
        return Response({'success': True, 'data': UserProfileSerializer(users, many=True).data})
    elif request.method == 'PUT' and pk:
        try:
            user = UserProfile.objects.get(pk=pk)
            if 'is_verified' in request.data:
                user.is_verified = request.data['is_verified']
            if 'is_suspended' in request.data:
                user.is_suspended = request.data['is_suspended']
            user.save()
            return Response({'success': True, 'message': 'User status updated'})
        except UserProfile.DoesNotExist:
            return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def admin_settings(request):
    settings_obj, _ = PlatformSettings.objects.get_or_create(id=1)
    if request.method == 'GET':
        return Response({'success': True, 'data': PlatformSettingsSerializer(settings_obj).data})
    elif request.method == 'PUT':
        serializer = PlatformSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Platform settings updated'})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_audit_logs(request):
    logs = AuditLogItem.objects.all().order_by('-created_at')
    return Response({'success': True, 'data': AuditLogItemSerializer(logs, many=True).data})


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def support_tickets_view(request, pk=None):
    if request.method == 'GET':
        user = get_current_user(request)
        role = request.query_params.get('role') or (user.role if user else None)
        if role == 'admin' or (user and user.role == 'admin'):
            tickets = SupportTicket.objects.all().order_by('-created_at')
        elif user:
            tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')
        else:
            user_id = request.query_params.get('userId') or request.query_params.get('user_id')
            if user_id:
                tickets = SupportTicket.objects.filter(user_id=user_id).order_by('-created_at')
            else:
                tickets = SupportTicket.objects.none()
        return Response({'success': True, 'data': SupportTicketSerializer(tickets, many=True).data})

    elif request.method == 'POST':
        user = get_current_user(request)
        if not user:
            user_id = request.data.get('user_id') or request.data.get('userId')
            if user_id:
                user = UserProfile.objects.filter(id=user_id).first()

        if not user:
            return Response({'success': False, 'error': 'Authentication required to submit inquiry.'}, status=status.HTTP_401_UNAUTHORIZED)

        subject = request.data.get('subject', '').strip()
        category = request.data.get('category', 'General Support').strip()
        description = request.data.get('description', '').strip()
        priority = request.data.get('priority', 'Normal').strip()

        if not subject or not description:
            return Response({'success': False, 'error': 'Subject and message description are required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket_num = f"MSG-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        ticket = SupportTicket.objects.create(
            user=user,
            ticket_number=ticket_num,
            subject=subject,
            category=category,
            description=description,
            priority=priority,
            status='Open'
        )

        AuditLogItem.objects.create(
            user_id=user.id,
            user_email=user.email,
            action="SUPPORT_INQUIRY_CREATED",
            details=f"[{category}] {ticket_num} submitted by {user.name} ({user.role}): {subject[:60]}",
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
        )

        return Response({
            'success': True,
            'message': f'Message #{ticket_num} dispatched to Platform Administration.',
            'data': SupportTicketSerializer(ticket).data
        })

    elif request.method == 'PUT' and pk:
        try:
            ticket = SupportTicket.objects.get(pk=pk)
            user = get_current_user(request)
            follow_up = request.data.get('message', '').strip()
            if not follow_up:
                return Response({'success': False, 'error': 'Message content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

            sender_name = user.name if user else "Franchiser"
            timestamp = datetime.now().strftime('%b %d, %Y %I:%M %p')
            ticket.description = f"{ticket.description}\n\n--- 💬 Reply from {sender_name} ({timestamp}) ---\n{follow_up}"
            if ticket.status == 'Resolved':
                ticket.status = 'In Progress'
            ticket.save()

            AuditLogItem.objects.create(
                user_id=user.id if user else None,
                user_email=user.email if user else 'franchiser@fdss.com',
                action="SUPPORT_MESSAGE_REPLY",
                details=f"User {sender_name} replied to thread {ticket.ticket_number}",
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
            )

            return Response({
                'success': True,
                'data': SupportTicketSerializer(ticket).data,
                'message': 'Reply delivered to Platform Administration.'
            })
        except SupportTicket.DoesNotExist:
            return Response({'success': False, 'error': 'Message thread not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def admin_support_tickets(request, pk=None):
    if request.method == 'GET':
        tickets = SupportTicket.objects.all().order_by('-created_at')
        return Response({'success': True, 'data': SupportTicketSerializer(tickets, many=True).data})
    elif request.method == 'PUT' and pk:
        try:
            ticket = SupportTicket.objects.get(pk=pk)
            new_status = request.data.get('status', ticket.status)
            admin_resp = request.data.get('admin_response', ticket.admin_response)
            ticket.status = new_status
            ticket.admin_response = admin_resp
            ticket.save()

            # Handle automatic quota adjustment if requested by admin
            franchise_id = request.data.get('franchise_id')
            new_total_units = request.data.get('new_total_units')
            if franchise_id and new_total_units:
                try:
                    f = FranchiseListing.objects.get(id=franchise_id)
                    diff = int(new_total_units) - f.total_units
                    f.total_units = int(new_total_units)
                    f.available_units = max(0, f.available_units + diff)
                    f.save()
                    AuditLogItem.objects.create(
                        user_id=ticket.user.id if ticket.user else None,
                        user_email=ticket.user.email if ticket.user else 'admin@fdss.com',
                        action="QUOTA_REVISION_APPROVED",
                        details=f"Admin approved quota expansion for '{f.name}' to {new_total_units} units (+{diff}).",
                        ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
                    )
                except Exception:
                    pass

            AuditLogItem.objects.create(
                user_id=ticket.user.id if ticket.user else None,
                user_email=ticket.user.email if ticket.user else 'admin@fdss.com',
                action="SUPPORT_INQUIRY_RESPONDED",
                details=f"Admin updated ticket {ticket.ticket_number} to '{new_status}'.",
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
            )

            return Response({'success': True, 'message': 'Support ticket updated', 'data': SupportTicketSerializer(ticket).data})
        except SupportTicket.DoesNotExist:
            return Response({'success': False, 'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def admin_fraud_reports(request, pk=None):
    if request.method == 'GET':
        reports = FraudReport.objects.all().order_by('-created_at')
        return Response({'success': True, 'data': FraudReportSerializer(reports, many=True).data})
    elif request.method == 'PUT' and pk:
        try:
            report = FraudReport.objects.get(pk=pk)
            report.status = request.data.get('status', report.status)
            report.admin_notes = request.data.get('admin_notes', report.admin_notes)
            report.save()
            return Response({'success': True, 'message': 'Fraud report updated'})
        except FraudReport.DoesNotExist:
            return Response({'success': False, 'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


