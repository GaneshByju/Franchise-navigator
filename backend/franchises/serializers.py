from rest_framework import serializers
from .models import (
    UserProfile, InvestorProfile, FranchiserProfile, Category, FranchiseListing,
    Territory, LicenseRequirement, SectorChallenge, FranchiseDocument, Favorite,
    SavedSearch, FeasibilityEvaluation, Application, Contract, PaymentRecord,
    Conversation, MessageItem, MeetingItem, Review, SupportTicket, FraudReport,
    AuditLogItem, PlatformSettings
)

class InvestorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorProfile
        fields = '__all__'


class FranchiserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FranchiserProfile
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'name', 'role', 'phone', 'avatar', 'is_verified', 'is_suspended', 'created_at', 'profile']

    def get_profile(self, obj):
        if obj.role == 'investor' and hasattr(obj, 'investor_profile'):
            return InvestorProfileSerializer(obj.investor_profile).data
        elif obj.role == 'franchiser' and hasattr(obj, 'franchiser_profile'):
            return FranchiserProfileSerializer(obj.franchiser_profile).data
        return None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TerritorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Territory
        fields = '__all__'


class LicenseRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseRequirement
        fields = '__all__'


class SectorChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectorChallenge
        fields = '__all__'


class FranchiseDocumentSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')

    class Meta:
        model = FranchiseDocument
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    investor_name = serializers.ReadOnlyField(source='investor.name')
    investor_avatar = serializers.ReadOnlyField(source='investor.avatar')

    class Meta:
        model = Review
        fields = '__all__'


class FranchiseListingSerializer(serializers.ModelSerializer):
    territories = TerritorySerializer(many=True, read_only=True)
    licenses = LicenseRequirementSerializer(many=True, read_only=True)
    challenges = SectorChallengeSerializer(many=True, read_only=True)
    documents = FranchiseDocumentSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    franchiser_id = serializers.ReadOnlyField(source='franchiser.id')
    franchiser_name = serializers.ReadOnlyField(source='franchiser.name')
    franchiser_email = serializers.ReadOnlyField(source='franchiser.email')

    class Meta:
        model = FranchiseListing
        fields = '__all__'


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = '__all__'


class FeasibilityEvaluationSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')
    category_slug = serializers.ReadOnlyField(source='franchise.category_slug')
    total_investment_est = serializers.ReadOnlyField(source='franchise.total_investment_est')
    est_roi = serializers.ReadOnlyField(source='franchise.est_roi')

    class Meta:
        model = FeasibilityEvaluation
        fields = '__all__'


class ApplicationSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')
    category_slug = serializers.ReadOnlyField(source='franchise.category_slug')
    total_investment_est = serializers.ReadOnlyField(source='franchise.total_investment_est')
    est_roi = serializers.ReadOnlyField(source='franchise.est_roi')
    investor_name = serializers.ReadOnlyField(source='investor.name')
    investor_email = serializers.ReadOnlyField(source='investor.email')
    investor_phone = serializers.ReadOnlyField(source='investor.phone')
    contract_id = serializers.SerializerMethodField()
    contract_status = serializers.SerializerMethodField()
    is_contract_signed = serializers.SerializerMethodField()
    is_payment_completed = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    def get_contract_id(self, obj):
        return obj.contract.id if hasattr(obj, 'contract') and obj.contract else None

    def get_contract_status(self, obj):
        return obj.contract.status if hasattr(obj, 'contract') and obj.contract else 'Pending'

    def get_is_contract_signed(self, obj):
        if hasattr(obj, 'contract') and obj.contract:
            return obj.contract.status == 'Signed' or obj.contract.investor_signed_at is not None
        return False

    def get_is_payment_completed(self, obj):
        if hasattr(obj, 'contract') and obj.contract and (obj.contract.status == 'Signed' or obj.contract.investor_signed_at is not None):
            return True
        if obj.investor:
            from .models import PaymentRecord
            return PaymentRecord.objects.filter(user=obj.investor, status='Completed').exists()
        return False


class ContractSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')
    company_name = serializers.ReadOnlyField(source='franchise.company_name')
    category_slug = serializers.ReadOnlyField(source='franchise.category_slug')
    business_type = serializers.ReadOnlyField(source='franchise.business_type')
    investor_name = serializers.ReadOnlyField(source='investor.name')
    investor_email = serializers.ReadOnlyField(source='investor.email')
    franchiser_name = serializers.ReadOnlyField(source='franchiser.name')
    franchiser_email = serializers.ReadOnlyField(source='franchiser.email')

    class Meta:
        model = Contract
        fields = '__all__'


class PaymentRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    user_email = serializers.ReadOnlyField(source='user.email')
    franchise_name = serializers.ReadOnlyField(source='related_franchise.name')

    class Meta:
        model = PaymentRecord
        fields = '__all__'


class MessageItemSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.name')
    sender_avatar = serializers.ReadOnlyField(source='sender.avatar')
    sender_role = serializers.ReadOnlyField(source='sender.role')

    class Meta:
        model = MessageItem
        fields = '__all__'


class ConversationSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')
    franchise_logo = serializers.ReadOnlyField(source='franchise.image_url')
    investor_name = serializers.ReadOnlyField(source='investor.name')
    investor_email = serializers.ReadOnlyField(source='investor.email')
    investor_avatar = serializers.ReadOnlyField(source='investor.avatar')
    franchiser_name = serializers.ReadOnlyField(source='franchiser.name')
    franchiser_email = serializers.ReadOnlyField(source='franchiser.email')
    franchiser_avatar = serializers.ReadOnlyField(source='franchiser.avatar')
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = '__all__'


    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.message_text if last_msg else ''

    def get_last_message_time(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.created_at.isoformat() if last_msg else obj.updated_at.isoformat()

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=0).count()


class MeetingItemSerializer(serializers.ModelSerializer):
    franchise_name = serializers.ReadOnlyField(source='franchise.name')
    investor_name = serializers.ReadOnlyField(source='investor.name')
    investor_email = serializers.ReadOnlyField(source='investor.email')
    franchiser_name = serializers.ReadOnlyField(source='franchiser.name')
    franchiser_email = serializers.ReadOnlyField(source='franchiser.email')

    class Meta:
        model = MeetingItem
        fields = '__all__'


class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    user_email = serializers.ReadOnlyField(source='user.email')
    user_role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = SupportTicket
        fields = '__all__'


class FraudReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.name')
    reporter_email = serializers.ReadOnlyField(source='reporter.email')

    class Meta:
        model = FraudReport
        fields = '__all__'


class AuditLogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLogItem
        fields = '__all__'


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = '__all__'
