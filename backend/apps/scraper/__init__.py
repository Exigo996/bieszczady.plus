"""
Facebook Event Scraper for Bieszczady.plus
===========================================

Production-ready scraper for extracting event information from Facebook.
"""

from .facebook_scraper import FacebookEventScraper
from .config import ScraperConfig
from .utils import (
    parse_facebook_date,
    extract_location,
    detect_category,
    detect_price_type,
    enrich_event_data,
    validate_event_data,
)

__version__ = '1.0.0'
__author__ = 'Bieszczady.plus'

__all__ = [
    'FacebookEventScraper',
    'ScraperConfig',
    'parse_facebook_date',
    'extract_location',
    'detect_category',
    'detect_price_type',
    'enrich_event_data',
    'validate_event_data',
]
