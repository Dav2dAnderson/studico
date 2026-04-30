from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import ApplicationViewSet, CourseViewSet, LessonViewSet, DownloadLessonFileView


router = DefaultRouter()

router.register('applications', ApplicationViewSet, basename='applications')
router.register('courses', CourseViewSet, basename='courses')

courses_router = NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'lessons', LessonViewSet, basename='course-lessons')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('courses/<slug:course_slug>/lessons/<slug:lesson_slug>/files/<int:pk>/download/', 
    DownloadLessonFileView.as_view(), name='download-lesson-file'),
]