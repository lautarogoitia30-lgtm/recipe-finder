from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("refresh/", views.refresh_token, name="refresh"),
    path("logout/", views.logout, name="logout"),
    path("me/", views.me, name="me"),
]
