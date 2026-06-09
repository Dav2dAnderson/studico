from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Course


class IsAuthorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return request.user.is_authenticated and request.user.is_author

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # Check if obj is Application or Lesson
        if hasattr(obj, 'course'):
            return request.user.is_author and obj.course.user == request.user
        return request.user.is_author and obj.user == request.user


class IsEnrolledOrAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Author can always see
        if obj.course.user == request.user:
            return True
        
        # Enrolled users can see
        return obj.course.users.filter(id=request.user.id).exists()
        

class IsEnrolledToCourse(BasePermission):
    def has_permission(self, request, view):
        course_slug = view.kwargs.get('course_slug')

        if not course_slug:
            return False

        if not request.user.is_authenticated:
            return False

        from community.models import Course
        course = Course.objects.select_related("user").filter(slug=course_slug).first()

        if not course:
            return False

        # Allow if user is the author OR is enrolled
        return course.user_id == request.user.id or course.users.filter(id=request.user.id).exists()
