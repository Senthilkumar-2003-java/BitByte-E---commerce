from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, AdminProfile, CustomerProfile
from .serializers import *

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': user.role,
                'email': user.email,
            })
        return Response({'error': 'Invalid credentials'}, status=400)

# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         user = authenticate(request, username=email, password=password)

#         if user:
            
#             return Response({
#                 'message': 'Login successful',
#                 'role': user.role,
#                 'email': user.email,
#             })

#         return Response({'error': 'Invalid credentials'}, status=400)

class CreateAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'super_admin':
            return Response({'error': 'Permission denied'}, status=403)
        serializer = AdminProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Admin created successfully'}, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request):
        if request.user.role != 'super_admin':
            return Response({'error': 'Permission denied'}, status=403)
        admins = AdminProfile.objects.all()
        serializer = AdminListSerializer(admins, many=True)
        return Response(serializer.data)

class CreateCustomerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=403)
        serializer = CustomerProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Customer created successfully'}, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request):                                                    
        if request.user.role != 'admin':                                      
            return Response({'error': 'Permission denied'}, status=403)        
        customers = CustomerProfile.objects.filter(created_by=request.user).order_by('-created_at')
        serializer = CustomerListSerializer(customers, many=True)              
        return Response(serializer.data)                                       

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {'role': user.role, 'email': user.email}

        if user.role == 'customer':
            try:
                p = user.customer_profile
                data.update({
                    'name': p.name,
                    'mobile_number': p.mobile_number,
                    'customer_id': p.customer_id,
                    'door_no': p.door_no,
                    'street_name': p.street_name,
                    'town_name': p.town_name,
                    'city_name': p.city_name,
                    'district': p.district,
                    'state': p.state,
                    'aadhaar_no': p.aadhaar_no,
                    'pan_no': p.pan_no,
                    'occupation': p.occupation,
                    'occupation_detail': p.occupation_detail,
                    'annual_salary': p.annual_salary,
                    'created_at': p.created_at,
                    'admin_name': p.assigned_admin.admin_name if p.assigned_admin else None,
                    'admin_id': p.assigned_admin.admin_id if p.assigned_admin else None,
                    'admin_contact_no': p.assigned_admin.admin_contact_no if p.assigned_admin else None,
                })
            except CustomerProfile.DoesNotExist:
                pass

        return Response(data)

class AdminListForAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Both admin and super_admin can list admins
        if request.user.role not in ['admin', 'super_admin']:
            return Response({'error': 'Permission denied'}, status=403)
        admins = AdminProfile.objects.all()
        serializer = AdminListSerializer(admins, many=True)
        return Response(serializer.data)
