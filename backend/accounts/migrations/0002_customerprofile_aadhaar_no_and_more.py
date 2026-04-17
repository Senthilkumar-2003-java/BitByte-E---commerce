from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofile',
            name='aadhaar_no',
            field=models.CharField(blank=True, max_length=12, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='annual_salary',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='city_name',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='customer_id',
            field=models.CharField(blank=True, max_length=20),  # ✅ unique=True இல்ல
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='district',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='door_no',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='occupation',
            field=models.CharField(blank=True, choices=[('employee', 'Employee'), ('business', 'Business'), ('others', 'Others')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='occupation_detail',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='pan_no',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='state',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='street_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='town_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]