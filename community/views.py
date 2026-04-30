from django.shortcuts import render
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse

from .models import Application, Course, Lesson, LessonFile
from .serializers import ApplicationSerializer, CourseSerializer, CourseDetailSerializer, LessonSerializer, LessonDetailSerializer
from .permissions import IsAuthorOrReadOnly, IsEnrolledOrAuthor, IsEnrolledToCourse
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        user = request.user
        user.studying_in.add(course)
        return Response({'status': 'enrolled'}, status=status.HTTP_200_OK)


class LessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [IsEnrolledToCourse()]
        return [IsAuthorOrReadOnly()]

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


class  DownloadLessonFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, course_slug, lesson_slug):
        file_obj = get_object_or_404(LessonFile, pk=pk)

        if (file_obj.lesson.slug != lesson_slug or file_obj.lesson.course.slug != course_slug):
            return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        course = file_obj.lesson.course
        is_author = course.user == request.user
        is_enrolled = course.users.filter(id=request.user.id).exists()

        if not (is_author or is_enrolled):
            return Response({"detail": "You do not have permission to download this file"}, status=status.HTTP_403_FORBIDDEN)
        
        return FileResponse(file_obj.file.open(), as_attachment=True, filename=file_obj.file.name.split('/')[-1])
        