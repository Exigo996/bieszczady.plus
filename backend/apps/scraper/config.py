"""
Configuration for Facebook Event Scraper
=========================================

Centralized configuration for scraper settings, selectors, and delays.
"""

from dataclasses import dataclass, field
from typing import List
import os


@dataclass
class ScraperConfig:
    """Configuration for Facebook scraper."""

    # Browser settings
    headless: bool = True
    user_agent: str = (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    )

    # Authentication
    cookie_file: str = 'data/cookies/facebook_cookies.json'

    # Rate limiting (seconds)
    min_delay: float = 1.0
    max_delay: float = 3.0
    post_scrape_delay: float = 2.0

    # Scraping limits
    max_posts_per_page: int = 50
    max_scroll_attempts: int = 20
    request_timeout: int = 30000  # milliseconds

    # Event detection keywords (Polish + English)
    event_keywords: List[str] = field(default_factory=lambda: [
        # Polish
        'koncert', 'festiwal', 'wydarzenie', 'spektakl', 'wystawa',
        'warsztaty', 'spotkanie', 'impreza', 'zabawa', 'pokaz',
        'prezentacja', 'konferencja', 'wykład', 'prelekcja',
        'występ', 'performance', 'projekcja', 'film',
        # English
        'concert', 'festival', 'event', 'show', 'exhibition',
        'workshop', 'meeting', 'party', 'presentation', 'lecture',
        'performance', 'screening', 'movie',
    ])

    # Location keywords for Bieszczady region
    location_keywords: List[str] = field(default_factory=lambda: [
        'Ustrzyki Dolne', 'Ustrzyki Górne', 'Lesko', 'Cisna',
        'Solina', 'Polańczyk', 'Wetlina', 'Bereżki', 'Muczne',
        'Czarna', 'Baligród', 'Komańcza', 'Sanok',
        'Bieszczady', 'Bieszczadach',
    ])

    # Date patterns (regex)
    date_patterns: List[str] = field(default_factory=lambda: [
        # Polish date formats
        r'\d{1,2}\.\d{1,2}\.\d{4}',  # 15.12.2025
        r'\d{1,2}\s+(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)',  # 15 grudnia
        r'\d{1,2}-\d{1,2}-\d{4}',  # 15-12-2025
        r'\d{4}-\d{1,2}-\d{1,2}',  # 2025-12-15
        # Time patterns
        r'\d{1,2}:\d{2}',  # 18:00
        r'\d{1,2}\.\d{2}',  # 18.00
    ])

    # Output settings
    output_dir: str = 'data/scraped_events'
    export_format: str = 'json'

    # Logging
    log_level: str = 'INFO'
    log_file: str = 'logs/scraper.log'

    # Django integration settings
    django_import_enabled: bool = True
    auto_translate: bool = True
    moderation_status: str = 'PENDING'  # PENDING, APPROVED, REJECTED

    @classmethod
    def from_env(cls) -> 'ScraperConfig':
        """Create configuration from environment variables."""
        return cls(
            headless=os.getenv('SCRAPER_HEADLESS', 'true').lower() == 'true',
            cookie_file=os.getenv('SCRAPER_COOKIE_FILE', 'data/cookies/facebook_cookies.json'),
            max_posts_per_page=int(os.getenv('SCRAPER_MAX_POSTS', '50')),
            output_dir=os.getenv('SCRAPER_OUTPUT_DIR', 'data/scraped_events'),
            log_level=os.getenv('SCRAPER_LOG_LEVEL', 'INFO'),
            django_import_enabled=os.getenv('SCRAPER_DJANGO_IMPORT', 'true').lower() == 'true',
            auto_translate=os.getenv('SCRAPER_AUTO_TRANSLATE', 'true').lower() == 'true',
        )


# Category mapping from keywords to Django Event categories
CATEGORY_MAPPING = {
    'koncert': 'CONCERT',
    'concert': 'CONCERT',
    'festiwal': 'FESTIVAL',
    'festival': 'FESTIVAL',
    'spektakl': 'THEATRE',
    'theatre': 'THEATRE',
    'theater': 'THEATRE',
    'teatr': 'THEATRE',
    'film': 'CINEMA',
    'movie': 'CINEMA',
    'cinema': 'CINEMA',
    'kino': 'CINEMA',
    'projekcja': 'CINEMA',
    'warsztaty': 'WORKSHOP',
    'workshop': 'WORKSHOP',
    'wykład': 'WORKSHOP',
    'lecture': 'WORKSHOP',
    'prelekcja': 'WORKSHOP',
    'wystawa': 'CULTURAL',
    'exhibition': 'CULTURAL',
    'impreza': 'CULTURAL',
    'event': 'CULTURAL',
}


# Price detection patterns
PRICE_PATTERNS = {
    'free': [
        r'\bwstęp\s+wolny\b',
        r'\bza\s+darmo\b',
        r'\bbezpłatny\b',
        r'\bgratis\b',
        r'\bfree\s+entry\b',
        r'\bfree\b',
    ],
    'paid': [
        r'\d+\s*zł',
        r'\d+\s*PLN',
        r'bilet',
        r'ticket',
        r'wstęp:\s*\d+',
        r'koszt',
        r'price',
    ],
}
