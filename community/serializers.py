from rest_framework import serializers

from .models import Application, Course, Lesson, Classroom

from accounts.serializers import CustomUserSerializer
from chatting.serializers import MessageSerializer


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'course', 'created_date']


class ClassroomDetailSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    course_info = serializers.SerializerMethodField()
    
    def get_course_info(self, obj):
        return {'id': obj.course.id, 'name': obj.course.name, 'slug': obj.course.slug}

    def get_messages(self, obj):
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            if obj.course.user == request.user or obj.students.filter(id=request.user.id).exists():
                return MessageSerializer(obj.messages.all(), many=True).data
        return []   
    
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'course_info', 'description', 'students', 'messages', 'created_date']



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
    
    def validate(self, attrs):
        user = self.context['request'].user

        course_count = Course.objects.filter(user=user).count()
        if course_count >= 3:
            raise serializers.ValidationError("You can create only 3 courses.")
        return attrs    

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
    is_author = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()
    classroom = serializers.SerializerMethodField()
    is_in_classroom = serializers.SerializerMethodField()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.users.filter(id=request.user.id).exists()
        return False

    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_lessons(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if obj.user == request.user or obj.users.filter(id=request.user.id).exists():
                return LessonSerializer(obj.lessons.all(), many=True).data
        return []

    def get_classroom(self, obj):
        classroom = obj.classrooms.first()
        if classroom:
            return {'id': classroom.id, 'name': classroom.name}
        return None

    def get_is_in_classroom(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            classroom = obj.classrooms.first()
            if classroom:
                return classroom.students.filter(id=request.user.id).exists()
        return False

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'user', 'description',
            'is_enrolled', 'is_author', 'lessons',
            'classroom', 'is_in_classroom',
            'created_at', 'updated_at',
        ]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'created_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    course = CourseDetailSerializer(read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'course', 'file', 'created_at', 'updated_at']
