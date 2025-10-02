from django.urls import path
from .views import EntityExtractor

urlpatterns = [
    path('extract/', EntityExtractor.as_view(), name='entity-extract'),
]
    