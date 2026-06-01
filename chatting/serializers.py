from rest_framework import serializers

from .models import Message


class MessageSenderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class MessageSerializer(serializers.ModelSerializer):
    sender = MessageSenderSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'classroom', 'content', 'created_date']
        read_only_fields = ['sender', 'classroom']
