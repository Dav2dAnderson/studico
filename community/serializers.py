from rest_framework import serializers

from .models import Application, Course, Lesson, LessonFile, Classroom

from accounts.serializers import CustomUserSerializer


class LessonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFile
        fields = ['id', 'file', 'uploaded_at']


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'course', 'description', 'created_date']


class ApplicationSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = Application
        fields = ['id', 'user', 'content', 'created_at', 'accepted']
        read_only_fields = ['accepted']

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            if request.user.is_author:
                raise serializers.ValidationError("You are already an author.")
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'slug', 'user']
    
    def create(self, validated_data):
        course = Course.objects.create(**validated_data)

        Classroom.objects.create(
            name=f"{course.name} Classroom",
            course=course,
            description=f"Classroom for {course.name}",
        )

        return course



class CourseDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.users.filter(id=request.user.id).exists()
        return False

    def get_lessons(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if obj.user == request.user or obj.users.filter(id=request.user.id).exists():
                return LessonSerializer(obj.lessons.all(), many=True).data
        return []

    class Meta:
        model = Course
        fields = ['id', 'name', 'user', 'description', 'is_enrolled', 'lessons', 'created_at', 'updated_at']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'created_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    course = CourseDetailSerializer(read_only=True)
    files = LessonFileSerializer(many=True, read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'course', 'file', 'files', 'uploaded_files', 'created_at', 'updated_at']

    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        lesson = Lesson.objects.create(**validated_data)
        for file in uploaded_files:
            LessonFile.objects.create(lesson=lesson, file=file)
        return lesson

    def update(self, instance, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        instance = super().update(instance, validated_data)
        for file in uploaded_files:
            LessonFile.objects.create(lesson=instance, file=file)
        return instance