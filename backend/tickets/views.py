from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.db.models.functions import TruncDate
from .models import Ticket
from .serializers import TicketSerializer

import os
import json
import google.generativeai as genai


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    http_method_names = ['get', 'post', 'patch']

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']


    # -------------------------
    # CLASSIFY ENDPOINT
    # -------------------------
    @action(detail=False, methods=['post'], url_path='classify')
    def classify(self, request):
        description = request.data.get('description')

        if not description:
            return Response(
                {"error": "Description is required."},
                status=400
            )

        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not set")

            genai.configure(api_key=api_key)

            model = genai.GenerativeModel("gemini-2.5-flash")

            prompt = f"""
Classify the following support ticket.

Return ONLY a valid JSON object with this exact structure:

{{
  "category": "billing | technical | account | general",
  "priority": "low | medium | high | critical"
}}

Do not include explanation or markdown.

Ticket description:
{description}
"""

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0,
                    "response_mime_type": "application/json"
                }
            )

            content = ""

            # Gemini 2.5 safe extraction
            if hasattr(response, "text") and response.text:
                content = response.text.strip()
            elif hasattr(response, "candidates"):
                content = response.candidates[0].content.parts[0].text.strip()

            print("RAW RESPONSE:", content)

            parsed = json.loads(content)

            category = parsed.get("category")
            priority = parsed.get("priority")

            valid_categories = [c[0] for c in Ticket.CATEGORY_CHOICES]
            valid_priorities = [p[0] for p in Ticket.PRIORITY_CHOICES]

            if category not in valid_categories:
                category = None

            if priority not in valid_priorities:
                priority = None

            return Response({
                "suggested_category": category,
                "suggested_priority": priority
            })

        except Exception as e:
            print("GEMINI ERROR:", str(e))
            return Response({
                "suggested_category": None,
                "suggested_priority": None
            })


    # -------------------------
    # STATS ENDPOINT
    # -------------------------
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()

        daily_counts = (
            Ticket.objects
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
        )

        if daily_counts.exists():
            avg_tickets_per_day = sum(d['count'] for d in daily_counts) / daily_counts.count()
        else:
            avg_tickets_per_day = 0

        priority_breakdown = dict(
            Ticket.objects.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )

        category_breakdown = dict(
            Ticket.objects.values('category')
            .annotate(count=Count('id'))
            .values_list('category', 'count')
        )

        return Response({
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "avg_tickets_per_day": round(avg_tickets_per_day, 2),
            "priority_breakdown": priority_breakdown,
            "category_breakdown": category_breakdown,
        })
