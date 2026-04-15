from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, AdminProfile, CustomerProfile
from .serializers import *

# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')
#         user = authenticate(request, username=email, password=password)
#         if user:
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'role': user.role,
#                 'email': user.email,
#             })
#         return Response({'error': 'Invalid credentials'}, status=400)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)

        if user:
            return Response({
                'message': 'Login successful',
                'role': user.role,
                'email': user.email,
            })

        return Response({'error': 'Invalid credentials'}, status=400)

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
        customers = CustomerProfile.objects.filter(created_by=request.user)
        serializer = CustomerListSerializer(customers, many=True)
        return Response(serializer.data)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'role': request.user.role,
            'email': request.user.email,
        })