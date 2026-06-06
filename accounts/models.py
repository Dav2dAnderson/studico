from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator

# from community.models import Course
# Create your models here.


class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, blank=True, 
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
    )
    certificates = models.ManyToManyField("Certificate", related_name="users", blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], null=True, blank=True)
    studying_in = models.ManyToManyField("community.Course", related_name="users", blank=True)
    is_author = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = "Users"


class Certificate(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Certificate"
        verbose_name_plural = "Certificates"
