from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import CustomUser, Certificate



class CustomUserSerializer(serializers.ModelSerializer):
    certificates = serializers.SlugRelatedField(many=True, slug_field='name', queryset=Certificate.objects.all(), required=False)

    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "phone_number", "bio", "is_author", "first_name", "last_name", "certificates"]

    def update(self, instance, validated_data):
        certificates_data = validated_data.pop('certificates', None)
        instance = super().update(instance, validated_data)
        
        if certificates_data is not None:
            certificate_objs = []
            for name in certificates_data:
                cert, created = Certificate.objects.get_or_create(name=name)
                certificate_objs.append(cert)
            instance.certificates.set(certificate_objs)
            
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
        fields = ["id", "username", "first_name", "last_name", 'email', 'phone_number', 'studying_in', 'my_courses', 'is_author', 'my_certificates']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "first_name", "last_name", "phone_number", "email", "password", "password_confirm", "gender"]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            email=validated_data.get('email', ''),
            gender=validated_data.get('gender', ''),
        )
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