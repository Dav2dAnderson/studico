from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

import logging

from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from .models import CustomUser, Certificate
from .tokens import account_activation_token




class CustomUserSerializer(serializers.ModelSerializer):
    certificates = serializers.SlugRelatedField(many=True, slug_field='name', queryset=Certificate.objects.all(), required=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "email_verified",
            "phone_number",
            "bio",
            "is_author",
            "first_name",
            "last_name",
            "certificates",
        ]

    def update(self, instance, validated_data):
        certificates_data = validated_data.pop('certificates', None)
        instance = super().update(instance, validated_data)
        
        if certificates_data is not None:
            instance.certificates.set(certificates_data)
            
        return instance


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ['name']


class UserShortSerializer(serializers.ModelSerializer):
    studying_in = serializers.SerializerMethodField()
    my_courses = serializers.SerializerMethodField()
    my_certificates = serializers.SerializerMethodField()

    def get_studying_in(self, obj):
        from community.serializers import CourseSerializer
        return CourseSerializer(obj.studying_in.all(), many=True).data

    def get_my_courses(self, obj):
        from community.serializers import CourseSerializer
        return CourseSerializer(obj.courses.all(), many=True).data

    def get_my_certificates(self, obj):
        return CertificateSerializer(obj.certificates.all(), many=True).data

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "email_verified",
            "phone_number",
            "studying_in",
            "my_courses",
            "is_author",
            "my_certificates",
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "first_name", "last_name", "phone_number", "email", "password", "password_confirm", "gender"]

        extra_kwargs = {
            "first_name": {'required': True, 'allow_blank': False},
            "last_name": {'required': True, 'allow_blank': False},
            "email": {'required': True, 'allow_blank': False},
            "gender": {'required': True, 'allow_blank': False}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop('password')

        user = CustomUser(**validated_data)
        user.set_password(password)
        
        user.is_active = False
        user.email_verified = False
        user.save()

        request = self.context.get('request')
        current_site = get_current_site(request)
        uid = urlsafe_base64_encode(force_bytes(user.pk)).rstrip('=')
        token = account_activation_token.make_token(user)

        frontend_url = getattr(settings, "FRONTEND_URL", f"http://{current_site.domain}:3000")
        activation_link = f"{frontend_url}/auth/activate/{uid}/{token}"

        greeting = f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.username

        subject = "Activate your account"
        message = f"Hi {greeting}.\n\nPlease click the link to confirm your email: \n{activation_link}"
        try:
            send_mail(subject, message, 'noreply@studico.com', [user.email])
        except Exception as exc:
            logging.error("Failed to send activation email", exc_info=exc)
            raise serializers.ValidationError({
                "email": [
                    "Unable to send activation email. Please verify your SMTP configuration and try again."
                ]
            })

        return user   


class UserLogOutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate_refresh(self, value):
        try:
            RefreshToken(value)
        except TokenError:
            raise serializers.ValidationError("Invalid refresh token")
        return value
    
    def save(self, **kwargs):
        token = RefreshToken(self.validated_data["refresh"])
        token.blacklist()


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords didn't match."})
        
        if attrs['new_password'] == attrs['current_password']:
            raise serializers.ValidationError({"new_password": "Your new password cannot be the same as your current password."})
        
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({'current_password': "Your current password was entered incorrectly."})

        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
