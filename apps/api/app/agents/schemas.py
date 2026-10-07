MATCH_INTELLIGENCE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "category": {
            "type": "string",
            "enum": [
                "key_moment", "chance", "progression",
                "defensive", "pressure", "milestone", "context",
            ],
        },
        "title": {"type": "string"},
        "why_it_matters": {"type": "string"},
        "supporting_facts": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": ["category", "title", "why_it_matters", "supporting_facts"],
}

NARRATIVE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "headline": {"type": "string"},
        "body": {"type": "string"},
    },
    "required": ["headline", "body"],
}

PERSONALIZATION_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "body": {"type": "string"},
        "tone_note": {"type": "string"},
    },
    "required": ["title", "body", "tone_note"],
}
