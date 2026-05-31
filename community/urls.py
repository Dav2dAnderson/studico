from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import ApplicationViewSet, CourseViewSet, LessonViewSet, ClassroomViewSet


router = DefaultRouter()

router.register('applications', ApplicationViewSet, basename='applications')
router.register('courses', CourseViewSet, basename='courses')
router.register('classrooms', ClassroomViewSet, basename='classrooms')

courses_router = NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'lessons', LessonViewSet, basename='course-lessons')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
]