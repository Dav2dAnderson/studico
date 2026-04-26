from django.shortcuts import render

from rest_framework import viewsets, permissions

from .models import Application, Course, Lesson
from .serializers import ApplicationSerializer, CourseSerializer, CourseDetailSerializer, LessonSerializer, LessonDetailSerializer
from .permissions import IsAuthorOrReadOnly
# Create your views here.


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseSerializer
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return Lesson.objects.filter(course__slug=self.kwargs['course_slug'])

    def get_serializer_class(self):
        if self.action == 'list':
            return LessonSerializer
        
        if self.action == 'retrieve':
            return LessonDetailSerializer
        return LessonSerializer

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        
        course = get_object_or_404(Course, slug=self.kwargs['course_slug'], user=self.request.user)
        serializer.save(course=course)