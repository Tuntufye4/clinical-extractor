from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import spacy  

# Load Med7 (clinical NER)
med7 = spacy.load("en_core_med7_lg")

# Load general English model (for PERSON only)
general_nlp = spacy.load("en_core_web_sm")

class EntityExtractor(APIView):
    def post(self, request):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

        med7_doc = med7(text)
        general_doc = general_nlp(text)

        entities = []

        # 1️⃣ Collect clinical entities from Med7
        clinical_spans = []
        for ent in med7_doc.ents:
            if ent.label_ != "PERSON":  # safeguard
                entities.append({"text": ent.text, "label": ent.label_})
                clinical_spans.append((ent.start_char, ent.end_char))  # track ranges

        # 2️⃣ Add PERSON only if it doesn't overlap with clinical entities
        for ent in general_doc.ents:
            if ent.label_ == "PERSON":
                overlap = any(
                    ent.start_char < c_end and ent.end_char > c_start
                    for c_start, c_end in clinical_spans
                )
                if not overlap:  # only add if no overlap
                    entities.append({"text": ent.text, "label": "PERSON"})

        # 3️⃣ Deduplicate by (text, label)
        unique_entities = []
        seen = set()
        for e in entities:
            key = (e["text"], e["label"])
            if key not in seen:
                seen.add(key)
                unique_entities.append(e)

        return Response({
            "text": text,
            "entities": unique_entities
        })
