from django.urls import path
from .views import LoginView, CreateAdminView, CreateCustomerView, DashboardView,AdminListForAdminView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('admins/', CreateAdminView.as_view()),
    path('customers/', CreateCustomerView.as_view()),
    path('admins/list/', AdminListForAdminView.as_view()),  # ✅ New endpoint
    path('dashboard/', DashboardView.as_view()),
]