from django.db import models

class ClinicalNote(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note {self.id} - {self.text[:30]}"

class ExtractedEntity(models.Model):
    note = models.ForeignKey(ClinicalNote, on_delete=models.CASCADE, related_name="entities")
    person = models.CharField(max_length=255, null=True, blank=True)
    age = models.IntegerField(null =True, blank = True)  
    drug = models.CharField(max_length=255, null=True, blank=True)  
    strength = models.CharField(max_length=100, null=True, blank=True)
    frequency = models.CharField(max_length=100, null=True, blank=True)   
    route = models.CharField(max_length=100, null=True, blank=True)
    duration = models.CharField(max_length=100, null=True, blank=True)
    form = models.CharField(max_length=100, null=True, blank=True)
    dosage = models.CharField(max_length=100, null=True, blank=True)
    diagnosis = models.CharField(max_length=255, null=True, blank=True)    
    condition = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Entities for Note {self.note.id}"
   