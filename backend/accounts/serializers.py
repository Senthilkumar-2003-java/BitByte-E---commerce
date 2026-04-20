from rest_framework import serializers
from .models import User, AdminProfile, DealerProfile, SubDealerProfile

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = AdminProfile
        fields = [
            'id', 'email', 'password', 'name', 'mobile_number',
            'door_no', 'street_name', 'town_name', 'city_name',
            'district', 'state', 'aadhaar_no', 'pan_no',
            'occupation', 'occupation_detail', 'annual_salary',
            'admin_name', 'admin_id', 'admin_contact_no'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='admin')
        profile = AdminProfile.objects.create(
            user=user,
            created_by=request.user if request.user.is_authenticated else None,
            **validated_data
        )
        return profile

class AdminListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = AdminProfile
        fields = ['id', 'name', 'email', 'mobile_number', 'admin_id', 'admin_contact_no', 'city_name']


# ✅ Dealer (Admin creates this)
class DealerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    assigned_admin_id = serializers.IntegerField(write_only=True, required=False)

    admin_name = serializers.CharField(source='assigned_admin.admin_name', read_only=True)
    admin_uid = serializers.CharField(source='assigned_admin.admin_id', read_only=True)
    admin_contact = serializers.CharField(source='assigned_admin.admin_contact_no', read_only=True)

    class Meta:
        model = DealerProfile
        fields = [
            'id', 'email', 'password', 'name', 'mobile_number',
            'door_no', 'street_name', 'town_name', 'city_name',
            'district', 'state', 'aadhaar_no', 'pan_no',
            'occupation', 'occupation_detail', 'annual_salary',
            'assigned_admin_id',
            'admin_name', 'admin_uid', 'admin_contact',
            'dealer_name', 'dealer_id', 'dealer_contact_no', 'created_at'
        ]
        read_only_fields = ['dealer_id', 'created_at', 'admin_name', 'admin_uid', 'admin_contact']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        admin_id = validated_data.pop('assigned_admin_id', None)
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='dealer')

        assigned_admin = None
        if admin_id:
            try:
                assigned_admin = AdminProfile.objects.get(id=admin_id)
            except AdminProfile.DoesNotExist:
                pass

        profile = DealerProfile.objects.create(
            user=user,
            created_by=request.user,
            assigned_admin=assigned_admin,
            **validated_data
        )
        return profile

class DealerListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = DealerProfile
        fields = ['id', 'dealer_id', 'name', 'email', 'mobile_number', 'city_name', 'created_at']


# ✅ Sub Dealer (Dealer creates this)
class SubDealerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    assigned_dealer_id = serializers.IntegerField(write_only=True, required=False)

    dealer_name = serializers.CharField(source='assigned_dealer.dealer_name', read_only=True)
    dealer_uid = serializers.CharField(source='assigned_dealer.dealer_id', read_only=True)
    dealer_contact = serializers.CharField(source='assigned_dealer.dealer_contact_no', read_only=True)

    class Meta:
        model = SubDealerProfile
        fields = [
            'id', 'email', 'password', 'name', 'mobile_number',
            'door_no', 'street_name', 'town_name', 'city_name',
            'district', 'state', 'aadhaar_no', 'pan_no',
            'occupation', 'occupation_detail', 'annual_salary',
            'assigned_dealer_id',
            'dealer_name', 'dealer_uid', 'dealer_contact',
            'sub_dealer_id', 'created_at'
        ]
        read_only_fields = ['sub_dealer_id', 'created_at', 'dealer_name', 'dealer_uid', 'dealer_contact']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        dealer_id = validated_data.pop('assigned_dealer_id', None)
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='sub_dealer')

        assigned_dealer = None
        if dealer_id:
            try:
                assigned_dealer = DealerProfile.objects.get(id=dealer_id)
            except DealerProfile.DoesNotExist:
                pass

        profile = SubDealerProfile.objects.create(
            user=user,
            created_by=request.user,
            assigned_dealer=assigned_dealer,
            **validated_data
        )
        return profile

class SubDealerListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = SubDealerProfile
        fields = ['id', 'sub_dealer_id', 'name', 'email', 'mobile_number', 'city_name', 'created_at']