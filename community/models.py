from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError

from accounts.models import CustomUser

from ckeditor.fields import RichTextField
# Create your models here.


class Application(models.Model):
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="applications")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s application"

    def save(self, *args, **kwargs):
        # A user who is already an author cannot submit/create a new application
        if self.user.is_author and self.pk is None:
            raise ValidationError("Authors cannot submit new applications.")

        if self.accepted:
            # Check if this is a transition to accepted=True
            is_transitioning = False
            if self.pk is not None:
                orig = Application.objects.get(pk=self.pk)
                if not orig.accepted:
                    is_transitioning = True
            else:
                is_transitioning = True

            if is_transitioning and self.user.is_author:
                raise ValidationError("This user is already an author, so their application cannot be accepted.")

            # Promote user to author
            if not self.user.is_author:
                self.user.is_author = True
                self.user.save(update_fields=['is_author'])

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Application"
        verbose_name_plural = "Applications"


class Course(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, null=True, blank=True)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="courses")
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ("completed", "Completed"),
        ("not completed", "Not Completed")
    ], default="not completed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            counter = 1
            slug = base_slug
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"


class Lesson(models.Model):
    title = models.CharField(max_length=150)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    content = RichTextField()
    file = models.FileField(upload_to="lessons/", null=True, blank=True)
    slug = models.SlugField(max_length=150, null=True, blank=True)
    finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.title} in {self.course.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            counter = 1
            slug = base_slug
            while Lesson.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Lesson"
        verbose_name_plural = "Lessons"
    

class Classroom(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="classrooms")
    description = models.TextField(null=True, blank=True)
    students = models.ManyToManyField("accounts.CustomUser", related_name="classrooms", blank=True)
    created_date = models.DateField(auto_now_add=True)


    def __str__(self):
        return f"{self.name} of {self.course.name}"

    class Meta:
        verbose_name = "Classroom"
        verbose_name_plural = "Classrooms"


