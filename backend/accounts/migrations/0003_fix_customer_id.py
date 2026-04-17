from django.db import migrations

def fix_customer_ids(apps, schema_editor):
    CustomerProfile = apps.get_model('accounts', 'CustomerProfile')
    for profile in CustomerProfile.objects.filter(customer_id=''):
        from django.utils import timezone
        year = timezone.now().year
        count = profile.pk
        profile.customer_id = f"BBCUS{year}{count:07d}"
        profile.save()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customerprofile_aadhaar_no_and_more'),  # உன் last migration
    ]

    operations = [
        migrations.RunPython(fix_customer_ids, migrations.RunPython.noop),
    ]