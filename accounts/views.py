from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .serializers import CustomUserSerializer, UserRegistrationSerializer, UserShortSerializer, UserLogOutSerializer, CertificateSerializer
from .models import CustomUser, Certificate

# Create your views here.

class Me(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserShortSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CertificateListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        certificates = Certificate.objects.all()
        serializer = CertificateSerializer(certificates, many=True)
        return Response(serializer.data)


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "User created successfully",
                "user": CustomUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
        

class UserLogOutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserLogOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "User has logged out"}, status=status.HTTP_205_RESET_CONTENT)