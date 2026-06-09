from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse

from .models import Application, Course, Lesson, Classroom
from .serializers import (ApplicationSerializer, CourseSerializer, CourseDetailSerializer, 
LessonSerializer, LessonDetailSerializer, ClassroomSerializer, ClassroomDetailSerializer)
from .permissions import IsAuthorOrReadOnly, IsEnrolledOrAuthor, IsEnrolledToCourse
from chatting.models import Message
# Create your views here.


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.select_related("user").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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

    def get_queryset(self):
        queryset = self.queryset.select_related("user")

        if self.action in {"retrieve", "join_classroom"}:
            return queryset.prefetch_related(
                "users",
                "lessons",
                Prefetch(
                    "classrooms",
                    queryset=Classroom.objects.prefetch_related("students"),
                ),
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        user = request.user
        user.studying_in.add(course)
        return Response({'status': 'enrolled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, slug=None):
        course = self.get_object()
        user = request.user
        if user.studying_in.filter(id=course.id).exists():
            user.studying_in.remove(course)
            return Response({'status': 'left'}, status=status.HTTP_200_OK)
        return Response({'status': 'not enrolled'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join_classroom(self, request, slug=None):
        course = self.get_object()
        user = request.user
        # Only enrolled users or the course author can join the classroom
        if not (user.studying_in.filter(id=course.id).exists() or course.user_id == user.id):
            return Response({'detail': 'You must be enrolled in this course to join its classroom.'}, status=status.HTTP_403_FORBIDDEN)
        classroom = next(iter(course.classrooms.all()), None)
        if not classroom:
            return Response({'detail': 'This course has no classroom yet.'}, status=status.HTTP_404_NOT_FOUND)
        classroom.students.add(user)
        return Response({'status': 'joined', 'classroom_id': classroom.id}, status=status.HTTP_200_OK)


class LessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [IsEnrolledToCourse()]
        return [IsAuthorOrReadOnly()]

    def get_queryset(self):
        queryset = Lesson.objects.select_related("course", "course__user").filter(course__slug=self.kwargs['course_slug'])

        if self.action == "retrieve":
            return queryset.prefetch_related(
                "course__users",
                "course__lessons",
                Prefetch(
                    "course__classrooms",
                    queryset=Classroom.objects.prefetch_related(
                        Prefetch(
                            "messages",
                            queryset=Message.objects.select_related("sender"),
                        ),
                        "students",
                    ),
                ),
            )

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return LessonSerializer
        return LessonDetailSerializer

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        
        course = get_object_or_404(Course, slug=self.kwargs['course_slug'], user=self.request.user)
        serializer.save(course=course)


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            from django.db.models import Q
            queryset = self.queryset.select_related("course", "course__user").filter(
                Q(students=self.request.user) |
                Q(course__user=self.request.user)
            ).distinct()
            if self.action == "retrieve":
                return queryset.prefetch_related(
                    "students",
                    Prefetch(
                        "messages",
                        queryset=Message.objects.select_related("sender"),
                    ),
                )
            return queryset
        return self.queryset.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return ClassroomSerializer
        return ClassroomDetailSerializer

    @action(detail=True, methods=['post'])
    def send_message(self, request, id=None):
        from chatting.serializers import MessageSerializer as MsgSerializer
        classroom = self.get_object()
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Message content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        message = Message.objects.create(
            sender=request.user,
            classroom=classroom,
            content=content,
        )
        return Response(MsgSerializer(message).data, status=status.HTTP_201_CREATED)


