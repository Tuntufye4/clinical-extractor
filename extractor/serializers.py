from rest_framework import serializers
from .models import ClinicalNote, ExtractedEntity

class ExtractedEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedEntity
        fields = '__all__'

class ClinicalNoteSerializer(serializers.ModelSerializer):
    entities = ExtractedEntitySerializer(many=True, read_only=True)

    class Meta:
        model = ClinicalNote
        fields = ['id', 'text', 'created_at', 'entities']
