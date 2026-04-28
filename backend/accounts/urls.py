from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, CreateAdminView, CreateDealerView,
    CreateSubDealerView, CreatePromotorView, CreateCustomerView,
    DashboardView, AdminListForAdminView, DealerListForDealerView,
    SubDealerListForView, PromotorListForView,  FullHierarchyView, AnnouncementView, AnnouncementReplyView, ping
)

urlpatterns = [
    path('ping/', ping),
    path('login/', LoginView.as_view()),
    path('login/refresh/', TokenRefreshView.as_view()),
    path('admins/', CreateAdminView.as_view()),
    path('admins/list/', AdminListForAdminView.as_view()),
    path('dealers/', CreateDealerView.as_view()),         
    path('dealers/list/', DealerListForDealerView.as_view()),  
    path('sub-dealers/', CreateSubDealerView.as_view()),   
    path('sub-dealers/list/', SubDealerListForView.as_view()),   # NEW
    path('promotors/', CreatePromotorView.as_view()),            # NEW
    path('promotors/list/', PromotorListForView.as_view()),      # NEW
    path('customers/', CreateCustomerView.as_view()),            # NEW
    path('hierarchy/full/', FullHierarchyView.as_view()),  # ✅ correct
    path('dashboard/', DashboardView.as_view()),
    path('announcements/', AnnouncementView.as_view()),
    path('announcements/<int:pk>/replies/', AnnouncementReplyView.as_view()),
    
]