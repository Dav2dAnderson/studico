from django.db import models

# Create your models here.


class Message(models.Model):
    sender = models.ForeignKey("accounts.CustomUser", on_delete=models.SET_NULL, null=True, blank=True)
    classroom = models.ForeignKey("community.Classroom", on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.sender.username} in {self.classroom.name}"

    
    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['created_date']


