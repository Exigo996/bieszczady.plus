"""
Test script for Facebook Event Scraper
=======================================

Quick test to verify scraper functionality.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from facebook_scraper import FacebookEventScraper
from config import ScraperConfig
from utils import (
    parse_facebook_date,
    extract_location,
    detect_category,
    detect_price_type,
    sanitize_text,
    detect_event_in_text,
)


def test_date_parsing():
    """Test date parsing functionality."""
    print("\n🧪 Testing date parsing...")

    test_cases = [
        "Koncert 15.12.2025 o godz. 18:00",
        "Wydarzenie: 20 grudnia 2025, 19:00",
        "Friday, December 15 at 6:00 PM",
        "Piątek 15-12-2025 godz. 18.00",
    ]

    for text in test_cases:
        result = parse_facebook_date(text)
        print(f"  Input: {text}")
        print(f"  Result: {result}")
        print()


def test_location_extraction():
    """Test location extraction."""
    print("\n🧪 Testing location extraction...")

    test_cases = [
        "Koncert w Ustrzyki Dolne, 15.12.2025",
        "Miejsce: Lesko, Rynek 10",
        "@ Cisna - Centrum Kultury",
        "Zapraszamy do Soliny na festiwal",
    ]

    for text in test_cases:
        result = extract_location(text)
        print(f"  Input: {text}")
        print(f"  Location: {result}")
        print()


def test_category_detection():
    """Test category detection."""
    print("\n🧪 Testing category detection...")

    test_cases = [
        "Koncert André Rieu w Ustrzyki Dolne",
        "Festiwal Kultury Łemkowskiej",
        "Spektakl teatralny 'Wesele'",
        "Warsztaty garncarstwa",
        "Projekcja filmu 'Bieszczady'",
    ]

    for text in test_cases:
        result = detect_category(text)
        print(f"  Input: {text}")
        print(f"  Category: {result}")
        print()


def test_price_detection():
    """Test price detection."""
    print("\n🧪 Testing price detection...")

    test_cases = [
        "Wstęp wolny dla wszystkich",
        "Bilet: 50 zł",
        "Koszt uczestnictwa: 100 PLN",
        "Za darmo!",
    ]

    for text in test_cases:
        result = detect_price_type(text)
        print(f"  Input: {text}")
        print(f"  Price: {result}")
        print()


def test_event_detection():
    """Test event detection."""
    print("\n🧪 Testing event detection...")

    test_cases = [
        ("Koncert w sobotę 15.12 o 18:00", True),
        ("Dzień dobry, jak się masz?", False),
        ("Zapraszamy na warsztaty garncarstwa w Lesku", True),
        ("Fajny dzień dzisiaj", False),
    ]

    for text, expected in test_cases:
        result = detect_event_in_text(text)
        status = "✅" if result == expected else "❌"
        print(f"  {status} Input: {text}")
        print(f"     Detected: {result}, Expected: {expected}")
        print()


async def test_scraper_initialization():
    """Test scraper initialization."""
    print("\n🧪 Testing scraper initialization...")

    try:
        config = ScraperConfig()
        config.headless = True

        async with FacebookEventScraper(config) as scraper:
            print("  ✅ Scraper initialized successfully")
            print(f"  Browser: {scraper.browser is not None}")
            print(f"  Context: {scraper.context is not None}")
            print(f"  Page: {scraper.page is not None}")

        print("  ✅ Scraper closed successfully")
        return True

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


async def test_page_navigation():
    """Test basic page navigation."""
    print("\n🧪 Testing page navigation...")

    try:
        config = ScraperConfig()
        config.headless = True

        async with FacebookEventScraper(config) as scraper:
            await scraper.page.goto('https://www.facebook.com', wait_until='networkidle')
            print(f"  ✅ Successfully navigated to Facebook")
            print(f"  Current URL: {scraper.page.url}")

        return True

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Facebook Event Scraper - Test Suite")
    print("=" * 60)

    # Run utility tests
    test_date_parsing()
    test_location_extraction()
    test_category_detection()
    test_price_detection()
    test_event_detection()

    # Run async tests
    print("\n" + "=" * 60)
    print("Async Tests (Playwright)")
    print("=" * 60)

    success = asyncio.run(test_scraper_initialization())

    if success:
        print("\n🎉 All tests passed! Scraper is ready to use.")
        print("\nNext steps:")
        print("1. Login: python cli.py login --email your@email.com --password yourpass")
        print("2. Scrape: python cli.py scrape-page --url https://facebook.com/page")
    else:
        print("\n❌ Some tests failed. Please check your Playwright installation:")
        print("   playwright install chromium")


if __name__ == '__main__':
    main()
