from django.db import models
from django.utils.text import slugify

from accounts.models import CustomUser
# Create your models here.


class Application(models.Model):
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="applications")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    checked = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s application"

    class Meta:
        verbose_name = "Application"
        verbose_name_plural = "Applications"


class Course(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(null=True, blank=True)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="courses")
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"


class Lesson(models.Model):
    title = models.CharField(max_length=150)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    content = models.TextField()
    file = models.FileField(upload_to="lessons/", null=True, blank=True)
    slug = models.SlugField(null=True, blank=True)
    finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.title} in {self.course.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)
