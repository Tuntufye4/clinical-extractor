from django.db import models

class ClinicalNote(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ExtractedEntity(models.Model):
    note = models.ForeignKey(ClinicalNote, on_delete=models.CASCADE, related_name="entities")
    text = models.CharField(max_length=255)
    label = models.CharField(max_length=50)
    start_char = models.IntegerField()
    end_char = models.IntegerField()
    patient_name = models.CharField(max_length=255, null=True)         
     