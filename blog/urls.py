from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path,include

from . import views

# When users open the root URL of the web app, or submit files,
# redirect the web page to the function "simple_upload" in "blog/views.py".
urlpatterns = [
    path('', views.simple_upload, name='home'),
    path('uploads/form/', views.simple_upload, name='model_form_upload'),
]
