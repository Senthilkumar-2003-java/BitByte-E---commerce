from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create default user if not exists'

    def handle(self, *args, **kwargs):
        email = 'infisq.senthil@gmail.com'
        password = 'Senthil@2003'  
        
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write('✅ Default user created!')
        else:
            # Already exists — reset password and role
            u = User.objects.get(email=email)
            u.set_password(password)
            u.role = 'super_admin'
            u.is_staff = True
            u.is_superuser = True
            u.save()
            self.stdout.write('✅ User updated!')