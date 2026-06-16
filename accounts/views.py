from django.shortcuts import render
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from .serializers import (CustomUserSerializer, UserRegistrationSerializer, UserShortSerializer, UserLogOutSerializer, 
                          CertificateSerializer, PasswordChangeSerializer)
from .models import CustomUser, Certificate
from .tokens import account_activation_token

# Create your views here.

class RegisterThrottle(AnonRateThrottle):
    scope = "register"


class Me(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserShortSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
    # throttle_classes = [RegisterThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()

        return Response(
            {
                "message": "User created successfully",
                "user": CustomUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ActivateUserView(APIView):
    permission_classes = []

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (ValueError, TypeError, CustomUser.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save(update_fields=["is_active", "email_verified"])
            return Response({"message": "Account activated successfully!"}, status=status.HTTP_200_OK)

        return Response(
            {"message": "Activation link is invalid or expired!"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserLogOutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UserLogOutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({"detail": "User has logged out"}, status=status.HTTP_205_RESET_CONTENT)
    

class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password has been updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
