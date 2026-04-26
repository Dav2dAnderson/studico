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
        
        return request.user.is_author and obj.course.user == request.user
        