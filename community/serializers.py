from rest_framework import serializers

from .models import Application, Course, Lesson

from accounts.serializers import CustomUserSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = Application
        fields = ['id', 'user', 'content', 'created_at', 'accepted', 'checked']


class CourseSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'slug', 'user']


class CourseDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    lessons = serializers.SerializerMethodField()

    def get_lessons(self, obj):
        return LessonSerializer(obj.lessons.all(), many=True).data

    class Meta:
        model = Course
        fields = ['id', 'name', 'user', 'description', 'lessons', 'created_at', 'updated_at']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'created_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    course = CourseDetailSerializer(read_only=True)
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'course', 'file', 'created_at', 'updated_at']