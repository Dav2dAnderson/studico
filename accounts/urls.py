from django.urls import path

from .views import Me, UserRegistrationView, UserLogOutView, CertificateListView, PasswordChangeView


urlpatterns = [
    path("me/", Me.as_view(), name='me'),
    path("register/", UserRegistrationView.as_view(), name='register'),
    path("logout/", UserLogOutView.as_view(), name='logout'),
    path('change_password/', PasswordChangeView.as_view(), name='change_password'),
    path("certificates/", CertificateListView.as_view(), name='certificates'),
]
