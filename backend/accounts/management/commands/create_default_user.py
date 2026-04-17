from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create default superadmin'

    def handle(self, *args, **kwargs):
        email = 'infisq.senthil@gmail.com'
        password = 'Senthil@2003'

        # Delete and recreate fresh
        User.objects.filter(email=email).delete()
        user = User.objects.create_superuser(
            email=email,
            password=password
        )
        user.role = 'super_admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        self.stdout.write('✅ Superadmin recreated fresh!')