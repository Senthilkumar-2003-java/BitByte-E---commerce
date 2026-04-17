from rest_framework import serializers
from .models import User, AdminProfile, CustomerProfile

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

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='admin')
        profile = AdminProfile.objects.create(
            user=user,
            created_by=request.user,
            **validated_data
        )
        return profile

class AdminListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = AdminProfile
        fields = ['id', 'name', 'email', 'mobile_number', 'admin_id', 'admin_contact_no', 'city_name']

class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomerProfile
        fields = ['id', 'email', 'password', 'name', 'mobile_number']

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='customer')
        profile = CustomerProfile.objects.create(
            user=user,
            created_by=request.user,
            **validated_data
        )
        return profile

class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'email', 'password', 'name', 'mobile_number',
            'door_no', 'street_name', 'town_name', 'city_name',
            'district', 'state', 'aadhaar_no', 'pan_no',
            'occupation', 'occupation_detail', 'annual_salary',
            'customer_id', 'created_at'
        ]
        read_only_fields = ['customer_id', 'created_at']

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        request = self.context.get('request')
        user = User.objects.create_user(email=email, password=password, role='customer')
        profile = CustomerProfile.objects.create(
            user=user,
            created_by=request.user,
            **validated_data
        )
        return profile

class CustomerListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = CustomerProfile
        fields = ['id', 'name', 'email', 'mobile_number', 'customer_id', 'city_name', 'created_at']