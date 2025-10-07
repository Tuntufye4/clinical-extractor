from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ClinicalNote, ExtractedEntity
from .serializers import ClinicalNoteSerializer, ExtractedEntitySerializer
import spacy
import re

# ---------- Safe Model Loader ----------
def load_model_safe(model_name):
    """
    Tries to load a spaCy model; downloads it if not already installed.
    This ensures Render and other production environments can load med7.
    """
    try:
        return spacy.load(model_name)
    except OSError:
        from spacy.cli import download
        download(model_name)
        return spacy.load(model_name)

# ---------- Load Models ----------
try:
    med7 = load_model_safe("en_core_med7_lg")       # Clinical model
except Exception as e:
    print("⚠️ Warning: Failed to load med7 model:", e)
    med7 = None

try:
    general_nlp = load_model_safe("en_core_web_sm")  # General model (PERSON, AGE, etc.)
except Exception as e:
    print("⚠️ Warning: Failed to load general NLP model:", e)
    general_nlp = None


# ---------- Entity Extraction View ----------
class EntityExtractor(APIView):
    """
    POST → Extract entities from a clinical note and save them.
    GET  → Retrieve all stored notes with extracted entities.
    """

    def post(self, request):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

        if med7 is None or general_nlp is None:
            return Response(
                {"error": "Models not loaded. Please check server configuration."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Store the raw note
        note = ClinicalNote.objects.create(text=text)

        # Process with both models
        med7_doc = med7(text)
        general_doc = general_nlp(text)

        # Track spans to avoid overlap (for PERSON)
        clinical_spans = []

        entities_dict = {
            "person": [],
            "age": [],
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

        # --------- Step 1: Extract Clinical Entities ---------
        for ent in med7_doc.ents:
            label = ent.label_.lower()
            if label == "person":
                continue
            if label in entities_dict:
                entities_dict[label].append(ent.text)
            clinical_spans.append((ent.start_char, ent.end_char))

        # --------- Step 2: Extract PERSON (avoid overlaps) ---------
        for ent in general_doc.ents:
            if ent.label_ == "PERSON":
                overlap = any(ent.start_char < end and ent.end_char > start for start, end in clinical_spans)
                if not overlap:
                    entities_dict["person"].append(ent.text)

        # --------- Step 3: Extract AGE via regex ---------
        age_pattern = re.compile(r"\b(\d{1,3})[- ]?(year[- ]old|years? old)\b", re.IGNORECASE)
        ages = [match[0] for match in age_pattern.findall(text)]
        if ages:
            entities_dict["age"].extend(ages)

        # --------- Step 4: Deduplicate ---------
        for key in entities_dict:
            entities_dict[key] = list(set(entities_dict[key]))

        # --------- Step 5: Save Entities ---------
        ExtractedEntity.objects.create(
            note=note,
            person=", ".join(entities_dict["person"]) or None,
            age=", ".join(entities_dict["age"]) or None,
            drug=", ".join(entities_dict["drug"]) or None,
            strength=", ".join(entities_dict["strength"]) or None,
            frequency=", ".join(entities_dict["frequency"]) or None,
            route=", ".join(entities_dict["route"]) or None,
            duration=", ".join(entities_dict["duration"]) or None,
            form=", ".join(entities_dict["form"]) or None,
            dosage=", ".join(entities_dict["dosage"]) or None,
            diagnosis=", ".join(entities_dict["diagnosis"]) or None,
            condition=", ".join(entities_dict["condition"]) or None,
        )

        return Response(
            {
                "note_id": note.id,
                "text": text,
                "entities": entities_dict
            },
            status=status.HTTP_201_CREATED
        )

    def get(self, request):
        """Return all saved clinical notes and their extracted entities."""
        notes = ClinicalNote.objects.all().order_by("-created_at")
        data = []
        for note in notes:
            entities = ExtractedEntity.objects.filter(note=note)
            entity_data = ExtractedEntitySerializer(entities, many=True).data
            data.append({
                "note": ClinicalNoteSerializer(note).data,
                "entities": entity_data
            })
        return Response(data, status=status.HTTP_200_OK)
      