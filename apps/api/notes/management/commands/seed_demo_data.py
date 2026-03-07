"""
Management command: seed_demo_data

Creates a demo user with categories and notes matching the home screen design.

Usage:
    python manage.py seed_demo_data
    python manage.py seed_demo_data --email demo@notes.app --password secret123
"""
from datetime import datetime, timezone

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from notes.models import Category, Note

User = get_user_model()

DEFAULT_EMAIL = "demo@notes.app"
DEFAULT_PASSWORD = "demo1234"

CATEGORIES = [
    {"title": "Random Thoughts", "color": "#F5A623"},
    {"title": "School", "color": "#4A90E2"},
    {"title": "Personal", "color": "#7ED321"},
]

# Each entry: (title, content, category_title, iso_date)
NOTES = [
    (
        "Grocery List",
        "- Milk\n- Eggs\n- Bread\n- Bananas\n- Spinach",
        "Random Thoughts",
        "2026-03-07",
    ),
    (
        "Meeting with Team",
        (
            "Discuss project timeline and milestones. Review budget and resource "
            "allocation. Address any blockers and plan next steps."
        ),
        "School",
        "2026-03-06",
    ),
    (
        "Note Title",
        "Note content...",
        "School",
        "2025-07-16",
    ),
    (
        "Vacation Ideas",
        (
            "- Visit Bali for beaches and culture\n"
            "- Explore the historic sites in Rome\n"
            "- Go hiking in the Swiss Alps\n"
            "- Relax in the hot springs of Iceland"
        ),
        "Random Thoughts",
        "2025-07-15",
    ),
    (
        "Note Title",
        (
            "Lately, I've been on a quest to discover new books to read. I've come "
            "across several recommendations that have piqued my interest. "
            "'The Alchemist' by Paulo Coelho is at the top of my list, given its "
            "reputation as a life-changing read. I've also heard great things about "
            "'Educated' by Tara Westover and 'Becoming' by Michelle Obama. Each of "
            "these books promises a transformative reading experience that I'm "
            "genuinely excited to dive into."
        ),
        "Personal",
        "2025-06-12",
    ),
    (
        "A Deep and Contemplative Personal Reflection on the Multifaceted and Ever-Evolving Journey of Life",
        (
            "Life has been a whirlwind of events and emotions lately. I've been "
            "juggling work, relationships, and personal growth all at once. Each "
            "day brings new challenges and unexpected moments of clarity. It's "
            "fascinating how the smallest interactions can lead to the most "
            "profound realisations about who we are and where we're headed."
        ),
        "Random Thoughts",
        "2025-06-11",
    ),
    (
        "Project X Updates",
        (
            "Finalized design mockups and received approval from stakeholders. "
            "Began development on the front-end. Backend integration is scheduled "
            "for next week. Team is on track to meet the deadline."
        ),
        "School",
        "2025-06-10",
    ),
]


def _make_aware(date_str: str) -> datetime:
    return datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)


class Command(BaseCommand):
    help = "Create a demo user with sample notes matching the home screen design."

    def add_arguments(self, parser):
        parser.add_argument("--email", default=DEFAULT_EMAIL)
        parser.add_argument("--password", default=DEFAULT_PASSWORD)

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email.split("@")[0]},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))
        else:
            self.stdout.write(f"User already exists: {email}")

        category_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            cat, cat_created = Category.objects.get_or_create(
                title=cat_data["title"],
                user=user,
                defaults={"color": cat_data["color"]},
            )
            category_map[cat.title] = cat
            if cat_created:
                self.stdout.write(f"  Created category: {cat.title}")

        for title, content, category_title, date_str in NOTES:
            category = category_map[category_title]
            note = Note.objects.create(
                title=title,
                content=content,
                category=category,
                owner=user,
            )
            # Override auto timestamps to match the design dates
            Note.objects.filter(pk=note.pk).update(
                created_at=_make_aware(date_str),
                updated_at=_make_aware(date_str),
            )
            self.stdout.write(f"  Created note: '{title[:50]}' [{category_title}]")

        self.stdout.write(self.style.SUCCESS("Done. Demo data seeded successfully."))
        self.stdout.write(f"  Login: {email} / {password}")
