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
    ('dealer', 'Dealer'),         # NEW
    ('sub_dealer', 'Sub Dealer'), # NEW
    ('promotor', 'Promotor'),   # NEW
    ('customer', 'Customer'),   # NEW

]

OCCUPATION_CHOICES = [
    ('employee', 'Employee'),
    ('business', 'Business'),
    ('others', 'Others'),
]

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='dealer')
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

    # ✅ CHANGED: name → initial + first_name + last_name
    initial = models.CharField(max_length=5, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)
    door_no = models.CharField(max_length=25)
    street_name = models.CharField(max_length=100)
    town_name = models.CharField(max_length=100)
    city_name = models.CharField(max_length=25)
    district = models.CharField(max_length=25)
    state = models.CharField(max_length=25)

    aadhaar_no = models.CharField(max_length=12)
    pan_no = models.CharField(max_length=25)

    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES)
    occupation_detail = models.CharField(max_length=25, blank=True)
    annual_salary = models.CharField(max_length=10)

    # ✅ AUTO-GENERATED fields (not from form)
    admin_name = models.CharField(max_length=100, blank=True)       # = first_name
    admin_id = models.CharField(max_length=25, unique=True, blank=True)  # BBADM20261001
    admin_contact_no = models.CharField(max_length=10, blank=True)  # = mobile_number

    def save(self, *args, **kwargs):
        # Auto-set admin_name from first_name
        if not self.admin_name:
            self.admin_name = self.first_name

        # Auto-set admin_contact_no from mobile_number
        if not self.admin_contact_no:
            self.admin_contact_no = self.mobile_number

        # Auto-generate admin_id: BBADM{year}{1001, 1002, ...}
        if not self.admin_id:
            from django.utils import timezone
            year = timezone.now().year
            count = AdminProfile.objects.count() + 1
            self.admin_id = f"BBADM{year}{1000 + count:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ✅ Dealer (created by Admin) — replaces old CustomerProfile
class DealerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dealer_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_dealers')

    assigned_admin = models.ForeignKey(
        'AdminProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_dealers'
    )

    initial = models.CharField(max_length=5, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)
    door_no = models.CharField(max_length=25, blank=True, null=True)
    street_name = models.CharField(max_length=100, blank=True, null=True)
    town_name = models.CharField(max_length=100, blank=True, null=True)
    city_name = models.CharField(max_length=25, blank=True, null=True)
    district = models.CharField(max_length=25, blank=True, null=True)
    state = models.CharField(max_length=25, blank=True, null=True)

    aadhaar_no = models.CharField(max_length=12, blank=True, null=True)
    pan_no = models.CharField(max_length=10, blank=True, null=True)

    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES, blank=True, null=True)
    occupation_detail = models.CharField(max_length=25, blank=True, null=True)
    annual_salary = models.CharField(max_length=10, blank=True, null=True)

    dealer_name = models.CharField(max_length=50, blank=True)
    dealer_id = models.CharField(max_length=20, unique=True, blank=True)
    dealer_contact_no = models.CharField(max_length=10, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.dealer_id:
            from django.utils import timezone
            year = timezone.now().year
            count = DealerProfile.objects.count() + 1
            self.dealer_id = f"BBDL{year}{count:07d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ✅ Sub Dealer (created by Dealer)
class SubDealerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='sub_dealer_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_sub_dealers')

    assigned_dealer = models.ForeignKey(
        'DealerProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_sub_dealers'
    )

    initial = models.CharField(max_length=5, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)

    door_no = models.CharField(max_length=25, blank=True, null=True)
    street_name = models.CharField(max_length=100, blank=True, null=True)
    town_name = models.CharField(max_length=100, blank=True, null=True)
    city_name = models.CharField(max_length=25, blank=True, null=True)
    district = models.CharField(max_length=25, blank=True, null=True)
    state = models.CharField(max_length=25, blank=True, null=True)

    aadhaar_no = models.CharField(max_length=12, blank=True, null=True)
    pan_no = models.CharField(max_length=10, blank=True, null=True)

    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES, blank=True, null=True)
    occupation_detail = models.CharField(max_length=25, blank=True, null=True)
    annual_salary = models.CharField(max_length=10, blank=True, null=True)

    sub_dealer_id = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.sub_dealer_id:
            from django.utils import timezone
            year = timezone.now().year
            count = SubDealerProfile.objects.count() + 1
            self.sub_dealer_id = f"BBSDL{year}{count:07d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# ✅ Promotor (created by Sub Dealer)
class PromotorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='promotor_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_promotors')

    assigned_sub_dealer = models.ForeignKey(
        'SubDealerProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_promotors'
    )

    # Personal Info
    initial = models.CharField(max_length=5, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)

    # Address
    door_no = models.CharField(max_length=25, blank=True, null=True)
    street_name = models.CharField(max_length=100, blank=True, null=True)
    town_name = models.CharField(max_length=100, blank=True, null=True)
    city_name = models.CharField(max_length=25, blank=True, null=True)
    district = models.CharField(max_length=25, blank=True, null=True)
    state = models.CharField(max_length=25, blank=True, null=True)

    # Identity
    aadhaar_no = models.CharField(max_length=12, blank=True, null=True)
    pan_no = models.CharField(max_length=10, blank=True, null=True)

    # Occupation
    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES, blank=True, null=True)
    occupation_detail = models.CharField(max_length=25, blank=True, null=True)
    annual_salary = models.CharField(max_length=10, blank=True, null=True)

    # Promotor Info
    promotor_name = models.CharField(max_length=50, blank=True)
    promotor_id = models.CharField(max_length=20, unique=True, blank=True)
    promotor_contact_no = models.CharField(max_length=10, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.promotor_id:
            from django.utils import timezone
            year = timezone.now().year
            count = PromotorProfile.objects.count() + 1
            self.promotor_id = f"BBPRO{year}{count:07d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ✅ Customer (created by Promotor)
class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_customers')

    assigned_promotor = models.ForeignKey(
        'PromotorProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_customers'
    )

    # Personal Info
    initial = models.CharField(max_length=5, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=10)

    # Address
    door_no = models.CharField(max_length=25, blank=True, null=True)
    street_name = models.CharField(max_length=100, blank=True, null=True)
    town_name = models.CharField(max_length=100, blank=True, null=True)
    city_name = models.CharField(max_length=25, blank=True, null=True)
    district = models.CharField(max_length=25, blank=True, null=True)
    state = models.CharField(max_length=25, blank=True, null=True)

    # Identity
    aadhaar_no = models.CharField(max_length=12, blank=True, null=True)
    pan_no = models.CharField(max_length=10, blank=True, null=True)

    # Occupation
    occupation = models.CharField(max_length=20, choices=OCCUPATION_CHOICES, blank=True, null=True)
    occupation_detail = models.CharField(max_length=25, blank=True, null=True)
    annual_salary = models.CharField(max_length=10, blank=True, null=True)

    # Customer Info
    customer_id = models.CharField(max_length=20, unique=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.customer_id:
            from django.utils import timezone
            year = timezone.now().year
            count = CustomerProfile.objects.count() + 1
            self.customer_id = f"BBCUS{year}{count:07d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"        