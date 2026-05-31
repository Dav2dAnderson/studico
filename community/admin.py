from django.contrib import admin

from .models import Application, Course, Lesson, Classroom
# Register your models here.

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'content', 'created_at', 'accepted']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'created_at', 'updated_at']


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'created_date']

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change) 

        obj = form.instance
        course_students = obj.course.users.all()

        for student in obj.students.all():
            if student not in course_students:
                obj.students.remove(student)
                self.message_user(request, f"{student} is not enrolled in the course.", level="warning")
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "students":
            classroom_id = request.resolver_match.kwargs.get('object_id')
            if classroom_id:
                classroom = Classroom.objects.get(pk=classroom_id)
                kwargs['queryset'] = classroom.course.users.all()
        return super().formfield_for_manytomany(db_field, request, **kwargs)

        

