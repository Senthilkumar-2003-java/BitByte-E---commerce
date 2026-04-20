from django.urls import path
from .views import (
    LoginView, CreateAdminView, CreateDealerView,
    CreateSubDealerView, DashboardView,
    AdminListForAdminView, DealerListForDealerView, ping
)

urlpatterns = [
    path('ping/', ping),
    path('login/', LoginView.as_view()),
    path('admins/', CreateAdminView.as_view()),
    path('admins/list/', AdminListForAdminView.as_view()),
    path('dealers/', CreateDealerView.as_view()),          # Admin creates/lists dealers
    path('dealers/list/', DealerListForDealerView.as_view()),  # Dealer dropdown
    path('sub-dealers/', CreateSubDealerView.as_view()),   # Dealer creates/lists sub dealers
    path('dashboard/', DashboardView.as_view()),
]