from django.urls import path

from .views import Me, UserRegistrationView, UserLogOutView, CertificateListView


urlpatterns = [
    path("me/", Me.as_view(), name='me'),
    path("register/", UserRegistrationView.as_view(), name='register'),
    path("logout/", UserLogOutView.as_view(), name='logout'),
    path("certificates/", CertificateListView.as_view(), name='certificates'),
]
