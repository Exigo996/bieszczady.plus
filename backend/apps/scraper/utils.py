"""
Utility functions for Facebook Event Scraper
=============================================

Helper functions for parsing dates, locations, text, and detection.
"""

import re
import asyncio
import random
from datetime import datetime, timedelta
from typing import Dict, Optional, Any, List
import logging

from .config import ScraperConfig, CATEGORY_MAPPING, PRICE_PATTERNS

logger = logging.getLogger(__name__)


# Polish month names mapping
POLISH_MONTHS = {
    'stycznia': 1, 'lutego': 2, 'marca': 3, 'kwietnia': 4,
    'maja': 5, 'czerwca': 6, 'lipca': 7, 'sierpnia': 8,
    'września': 9, 'października': 10, 'listopada': 11, 'grudnia': 12,
    'styczeń': 1, 'luty': 2, 'marzec': 3, 'kwiecień': 4,
    'maj': 5, 'czerwiec': 6, 'lipiec': 7, 'sierpień': 8,
    'wrzesień': 9, 'październik': 10, 'listopad': 11, 'grudzień': 12,
    # Short forms
    'sty': 1, 'lut': 2, 'mar': 3, 'kwi': 4, 'maj': 5, 'cze': 6,
    'lip': 7, 'sie': 8, 'wrz': 9, 'paź': 10, 'lis': 11, 'gru': 12,
}

# English month names
ENGLISH_MONTHS = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
}

# Day names for parsing "next Friday" etc.
POLISH_DAYS = {
    'poniedziałek': 0, 'wtorek': 1, 'środa': 2, 'czwartek': 3,
    'piątek': 4, 'sobota': 5, 'niedziela': 6,
    'pn': 0, 'wt': 1, 'śr': 2, 'czw': 3, 'pt': 4, 'sob': 5, 'ndz': 6,
}


async def random_delay(min_seconds: float = 1.0, max_seconds: float = 3.0):
    """
    Add random delay to mimic human behavior.

    Args:
        min_seconds: Minimum delay in seconds
        max_seconds: Maximum delay in seconds
    """
    delay = random.uniform(min_seconds, max_seconds)
    await asyncio.sleep(delay)


def sanitize_text(text: str) -> str:
    """
    Clean and sanitize text content.

    Args:
        text: Raw text to sanitize

    Returns:
        Cleaned text
    """
    if not text:
        return ''

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove emoji excess (keep some but not too many)
    # Count emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE
    )

    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)

    # Remove Facebook-specific patterns
    text = re.sub(r'See (more|translation)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Zobacz (więcej|tłumaczenie)', '', text, flags=re.IGNORECASE)

    # Trim and return
    return text.strip()


def detect_event_in_text(text: str, config: Optional[ScraperConfig] = None) -> bool:
    """
    Detect if text contains event-related keywords.

    Args:
        text: Text to analyze
        config: Scraper configuration with keywords

    Returns:
        True if event detected, False otherwise
    """
    if not text:
        return False

    text_lower = text.lower()

    # Use default config if not provided
    if config is None:
        config = ScraperConfig()

    # Check for event keywords
    for keyword in config.event_keywords:
        if keyword.lower() in text_lower:
            return True

    # Check for date patterns
    for pattern in config.date_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            # If we have a date, likely an event
            return True

    return False


def parse_facebook_date(text: str) -> Optional[Dict[str, Any]]:
    """
    Parse date and time from Facebook post text.

    Handles various formats:
    - 15.12.2025, 18:00
    - 15 grudnia 2025 o 18:00
    - Friday, December 15 at 6:00 PM
    - Piątek 15.12 godz. 18:00

    Args:
        text: Text containing date information

    Returns:
        Dictionary with start_date, end_date, or None
    """
    if not text:
        return None

    result = {}
    text_lower = text.lower()

    # Try to extract date components
    day = None
    month = None
    year = None
    hour = None
    minute = None

    # Pattern 1: DD.MM.YYYY format
    date_match = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', text)
    if date_match:
        day, month, year = map(int, date_match.groups())

    # Pattern 2: DD-MM-YYYY format
    if not date_match:
        date_match = re.search(r'(\d{1,2})-(\d{1,2})-(\d{4})', text)
        if date_match:
            day, month, year = map(int, date_match.groups())

    # Pattern 3: YYYY-MM-DD format (ISO)
    if not date_match:
        date_match = re.search(r'(\d{4})-(\d{1,2})-(\d{1,2})', text)
        if date_match:
            year, month, day = map(int, date_match.groups())

    # Pattern 4: Polish month names (e.g., "15 grudnia 2025")
    if not date_match:
        for month_name, month_num in POLISH_MONTHS.items():
            pattern = rf'(\d{{1,2}})\s+{month_name}(?:\s+(\d{{4}}))?'
            match = re.search(pattern, text_lower)
            if match:
                day = int(match.group(1))
                month = month_num
                year = int(match.group(2)) if match.group(2) else datetime.now().year
                # If month is in the past, assume next year
                if month < datetime.now().month:
                    year += 1
                break

    # Pattern 5: English month names
    if not date_match and not month:
        for month_name, month_num in ENGLISH_MONTHS.items():
            pattern = rf'(\d{{1,2}})\s+{month_name}(?:\s+(\d{{4}}))?'
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                day = int(match.group(1))
                month = month_num
                year = int(match.group(2)) if match.group(2) else datetime.now().year
                if month < datetime.now().month:
                    year += 1
                break

    # Extract time (HH:MM format)
    time_match = re.search(r'(\d{1,2})[:\.](\d{2})', text)
    if time_match:
        hour, minute = map(int, time_match.groups())

        # Handle 12-hour format (PM)
        if 'pm' in text_lower and hour < 12:
            hour += 12
        elif 'am' in text_lower and hour == 12:
            hour = 0

    # Try to extract relative dates (e.g., "next Friday")
    if not day:
        for day_name, day_offset in POLISH_DAYS.items():
            if day_name in text_lower:
                # Calculate next occurrence of this day
                today = datetime.now()
                days_ahead = day_offset - today.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                target_date = today + timedelta(days=days_ahead)
                day, month, year = target_date.day, target_date.month, target_date.year
                break

    # Construct datetime object if we have enough information
    if day and month:
        try:
            if not year:
                year = datetime.now().year

            # Create date
            event_date = datetime(year, month, day)

            # Add time if available
            if hour is not None and minute is not None:
                event_date = event_date.replace(hour=hour, minute=minute)

            result['start_date'] = event_date.isoformat()

            # Try to extract end time
            end_time_pattern = r'do\s+(\d{1,2})[:\.](\d{2})|until\s+(\d{1,2})[:\.](\d{2})|[-–]\s*(\d{1,2})[:\.](\d{2})'
            end_match = re.search(end_time_pattern, text_lower)

            if end_match:
                # Extract end hour and minute
                for i in range(0, len(end_match.groups()), 2):
                    if end_match.group(i + 1):
                        end_hour = int(end_match.group(i + 1))
                        end_minute = int(end_match.group(i + 2))

                        end_date = event_date.replace(hour=end_hour, minute=end_minute)
                        result['end_date'] = end_date.isoformat()
                        break

            return result

        except ValueError as e:
            logger.warning(f"Invalid date components: day={day}, month={month}, year={year} - {e}")
            return None

    return None


def extract_location(text: str, config: Optional[ScraperConfig] = None) -> Optional[str]:
    """
    Extract location/venue from text.

    Args:
        text: Text containing location information
        config: Scraper configuration with location keywords

    Returns:
        Location string or None
    """
    if not text:
        return None

    # Use default config if not provided
    if config is None:
        config = ScraperConfig()

    text_lower = text.lower()

    # Check for known Bieszczady locations
    for location in config.location_keywords:
        if location.lower() in text_lower:
            return location

    # Try to extract location from common patterns
    location_patterns = [
        r'(?:miejsce|location|venue)[:\s]+([^\n,]+)',
        r'(?:w|in)\s+([A-ZŁĄĆĘŃÓŚŹŻ][a-złąćęńóśźż\s]+(?:Dolne|Górne|Nowy|Stary)?)',
        r'@\s*([A-ZŁĄĆĘŃÓŚŹŻ][a-złąćęńóśźż\s]+)',
    ]

    for pattern in location_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            if 3 < len(location) < 50:  # Reasonable length
                return location

    return None


def detect_category(text: str) -> str:
    """
    Detect event category from text based on keywords.

    Args:
        text: Event text

    Returns:
        Category code (e.g., 'CONCERT', 'FESTIVAL')
    """
    text_lower = text.lower()

    for keyword, category in CATEGORY_MAPPING.items():
        if keyword in text_lower:
            return category

    return 'CULTURAL'  # Default category


def detect_price_type(text: str) -> Dict[str, Any]:
    """
    Detect if event is free or paid and extract price if available.

    Args:
        text: Event text

    Returns:
        Dictionary with price_type and price_amount
    """
    text_lower = text.lower()

    result = {
        'price_type': 'FREE',
        'price_amount': None,
        'price_currency': 'PLN',
    }

    # Check for free keywords
    for pattern in PRICE_PATTERNS['free']:
        if re.search(pattern, text_lower):
            return result

    # Check for paid keywords and extract amount
    for pattern in PRICE_PATTERNS['paid']:
        match = re.search(pattern, text_lower)
        if match:
            result['price_type'] = 'PAID'

            # Try to extract amount
            amount_match = re.search(r'(\d+)\s*(?:zł|PLN)', text, re.IGNORECASE)
            if amount_match:
                result['price_amount'] = float(amount_match.group(1))

            return result

    return result


def extract_organizer_info(text: str) -> Dict[str, Any]:
    """
    Extract organizer contact information.

    Args:
        text: Event text

    Returns:
        Dictionary with organizer contact details
    """
    result = {}

    # Extract phone number
    phone_patterns = [
        r'\+?48\s*\d{3}\s*\d{3}\s*\d{3}',
        r'\d{3}[-\s]?\d{3}[-\s]?\d{3}',
    ]

    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            result['phone'] = match.group(0)
            break

    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    if email_match:
        result['email'] = email_match.group(0)

    # Extract website
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    url_match = re.search(url_pattern, text)
    if url_match:
        result['website'] = url_match.group(0)

    return result


def validate_event_data(event_data: Dict[str, Any]) -> bool:
    """
    Validate that event data has minimum required fields.

    Args:
        event_data: Event dictionary

    Returns:
        True if valid, False otherwise
    """
    # Must have either a title, or both date and location
    has_title = 'title' in event_data and len(event_data['title']) >= 5

    has_date = 'start_date' in event_data
    has_location = 'location' in event_data

    return has_title or (has_date and has_location)


def enrich_event_data(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich event data with additional detected fields.

    Args:
        event_data: Basic event data

    Returns:
        Enriched event data
    """
    text = event_data.get('description', '')

    if not text:
        return event_data

    # Detect category
    if 'category' not in event_data:
        event_data['category'] = detect_category(text)

    # Detect price information
    if 'price_type' not in event_data:
        price_info = detect_price_type(text)
        event_data.update(price_info)

    # Extract organizer info
    if 'organizer_contact' not in event_data:
        organizer_info = extract_organizer_info(text)
        if organizer_info:
            event_data['organizer_contact'] = organizer_info

    return event_data
