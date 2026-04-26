from django.contrib import admin

from .models import CustomUser, Certificate 
# Register your models here.


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'phone_number', 'gender')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('name',)

