from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('role', 'super_admin')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra)

ROLE_CHOICES = [
    ('super_admin', 'Super Admin'),
    ('admin', 'Admin'),
    ('customer', 'Customer'),
]

OCCUPATION_CHOICES = [
    ('employee', 'Employee'),
    ('business', 'Business'),
    ('others', 'Others'),
]

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_admins')

    # Personal Info
    name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)

    # Address
    door_no = models.CharField(max_length=25)
    street_name = models.CharField(max_length=100)
    town_name = models.CharField(max_length=100)
    city_name = models.CharField(max_length=25)
    district = models.CharField(max_length=25)
    state = models.CharField(max_length=25)

    # Identity
    aadhaar_no = models.CharField(max_length=12)
    pan_no = models.CharField(max_length=25)

    # Occupation
    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES)
    occupation_detail = models.CharField(max_length=25, blank=True)
    annual_salary = models.CharField(max_length=10)

    # Admin Info
    admin_name = models.CharField(max_length=50)
    admin_id = models.CharField(max_length=25, unique=True)
    admin_contact_no = models.CharField(max_length=10)

    def __str__(self):
        return self.name

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_customers')
    name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name