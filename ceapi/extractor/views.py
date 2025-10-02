from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ClinicalNote, ExtractedEntity
import spacy

# Load models
med7 = spacy.load("en_core_med7_lg")      # clinical NER
general_nlp = spacy.load("en_core_web_sm")  # for PERSON

class EntityExtractor(APIView):
    def post(self, request):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Store the note
        note = ClinicalNote.objects.create(text=text)

        # Process text
        med7_doc = med7(text)
        general_doc = general_nlp(text)

        # Track clinical spans to avoid PERSON overlaps
        clinical_spans = []

        entities_dict = {
            "person": [],
            "drug": [],
            "strength": [],
            "frequency": [],
            "route": [],
            "duration": [],
            "form": [],
            "dosage": [],
            "diagnosis": [],
            "condition": []
        }

        # 1️⃣ Extract clinical entities
        for ent in med7_doc.ents:
            label = ent.label_.lower()
            if label == "person":
                continue
            if label in entities_dict:
                entities_dict[label].append(ent.text)
            clinical_spans.append((ent.start_char, ent.end_char))

        # 2️⃣ Extract PERSON if no overlap
        for ent in general_doc.ents:
            if ent.label_ == "PERSON":
                overlap = any(ent.start_char < end and ent.end_char > start for start, end in clinical_spans)
                if not overlap:
                    entities_dict["person"].append(ent.text)

        # Deduplicate
        for key in entities_dict:
            entities_dict[key] = list(set(entities_dict[key]))

        # Save extracted entities to DB
        ExtractedEntity.objects.create(
            note=note,
            person=", ".join(entities_dict["person"]) if entities_dict["person"] else None,
            drug=", ".join(entities_dict["drug"]) if entities_dict["drug"] else None,
            strength=", ".join(entities_dict["strength"]) if entities_dict["strength"] else None,
            frequency=", ".join(entities_dict["frequency"]) if entities_dict["frequency"] else None,
            route=", ".join(entities_dict["route"]) if entities_dict["route"] else None,
            duration=", ".join(entities_dict["duration"]) if entities_dict["duration"] else None,
            form=", ".join(entities_dict["form"]) if entities_dict["form"] else None,
            dosage=", ".join(entities_dict["dosage"]) if entities_dict["dosage"] else None,
            diagnosis=", ".join(entities_dict["diagnosis"]) if entities_dict["diagnosis"] else None,
            condition=", ".join(entities_dict["condition"]) if entities_dict["condition"] else None
        )

        return Response({
            "note_id": note.id,
            "text": text,
            "entities": entities_dict
        }, status=status.HTTP_201_CREATED)
       