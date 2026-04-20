from django.urls import path
from .views import (
    LoginView, CreateAdminView, CreateDealerView,
    CreateSubDealerView, CreatePromotorView, CreateCustomerView,
    DashboardView, AdminListForAdminView, DealerListForDealerView,
    SubDealerListForView, PromotorListForView, ping
)

urlpatterns = [
    path('ping/', ping),
    path('login/', LoginView.as_view()),
    path('admins/', CreateAdminView.as_view()),
    path('admins/list/', AdminListForAdminView.as_view()),
    path('dealers/', CreateDealerView.as_view()),          # Admin creates/lists dealers
    path('dealers/list/', DealerListForDealerView.as_view()),  # Dealer dropdown
    path('sub-dealers/', CreateSubDealerView.as_view()),   # Dealer creates/lists sub dealers
    path('sub-dealers/list/', SubDealerListForView.as_view()),   # NEW
    path('promotors/', CreatePromotorView.as_view()),            # NEW
    path('promotors/list/', PromotorListForView.as_view()),      # NEW
    path('customers/', CreateCustomerView.as_view()),            # NEW

    path('dashboard/', DashboardView.as_view()),
]