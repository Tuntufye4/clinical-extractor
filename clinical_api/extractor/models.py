from django.db import models

class ClinicalNote(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ExtractedEntity(models.Model):
    note = models.ForeignKey(ClinicalNote, on_delete=models.CASCADE, related_name="entities")
    person = models.CharField(max_length=255)
    drug = models.CharField(max_length=255)   
    frequency = models.CharField(max_length=255)
    strength = models.IntegerField()
            
          