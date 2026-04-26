from django.contrib import admin

from .models import Application, Course, Lesson
# Register your models here.

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'content', 'created_at', 'checked', 'accepted']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'content', 'file', 'created_at', 'updated_at']


