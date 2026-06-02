import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Message

from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.classroom_id = self.scope['url_route']['kwargs']['classroom_id']
        self.room_group_name = f"chat_{self.classroom_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data['content']
        token = data.get('token')
        user = self.scope.get('user')

        if (not user or not user.is_authenticated) and token:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            from asgiref.sync import sync_to_async
            try:
                access_token = AccessToken(token)
                user = await sync_to_async(get_user_model().objects.get)(id=access_token['user_id'])
            except Exception:
                pass

        if not user or not user.is_authenticated:
            # Cannot send without being authenticated
            return

        message = await self.save_message(user, content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": message.id,
                "content": content,
                "sender": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "created_date": str(message.created_date)
            }
        )
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "id": event.get("id"),
            "content": event["content"],
            "sender": event["sender"],
            "created_date": event["created_date"]
        }))

    @database_sync_to_async
    def save_message(self, user, content):
        return Message.objects.create(
            sender=user,
            classroom_id=self.classroom_id,
            content=content
        )