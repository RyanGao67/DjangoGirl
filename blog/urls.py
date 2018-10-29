from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path,include

from . import views


urlpatterns = [
    path('', views.simple_upload, name='home'),
    path('uploads/form/', views.simple_upload, name='model_form_upload'),
]

