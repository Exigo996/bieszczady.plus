#!/usr/bin/env python3
"""
Facebook Event Scraper CLI
===========================

Command-line interface for scraping Facebook events.

Usage:
    python cli.py login --email EMAIL --password PASSWORD
    python cli.py scrape-page --url URL [--max-posts 50]
    python cli.py scrape-event --url URL
    python cli.py scrape-multiple --urls urls.txt
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path
import logging

from facebook_scraper import FacebookEventScraper
from config import ScraperConfig
from utils import enrich_event_data, validate_event_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/scraper.log')
    ]
)

logger = logging.getLogger(__name__)


async def login_command(args):
    """Handle login command."""
    config = ScraperConfig.from_env()
    config.headless = not args.visible

    async with FacebookEventScraper(config) as scraper:
        success = await scraper.login(args.email, args.password)

        if success:
            print("✅ Login successful! Cookies saved for future use.")
            return 0
        else:
            print("❌ Login failed. Please check credentials or handle 2FA manually.")
            return 1


async def scrape_page_command(args):
    """Handle scrape-page command."""
    config = ScraperConfig.from_env()
    config.headless = not args.visible
    config.max_posts_per_page = args.max_posts

    async with FacebookEventScraper(config) as scraper:
        # Scrape events
        events = await scraper.scrape_page_events(args.url, max_posts=args.max_posts)

        # Enrich and validate
        valid_events = []
        for event in events:
            enriched = enrich_event_data(event)
            if validate_event_data(enriched):
                valid_events.append(enriched)

        print(f"\n✅ Scraped {len(valid_events)} valid events from {args.url}")

        # Export to file
        if args.output:
            output_file = args.output
        else:
            timestamp = asyncio.get_event_loop().time()
            output_file = f"data/scraped_events/events_{int(timestamp)}.json"

        scraper.export_events(valid_events, output_file)
        print(f"📁 Events exported to: {output_file}")

        # Print summary
        if args.verbose:
            print("\n📋 Event Summary:")
            for i, event in enumerate(valid_events[:5], 1):
                print(f"{i}. {event.get('title', 'No title')} - {event.get('start_date', 'No date')}")
            if len(valid_events) > 5:
                print(f"   ... and {len(valid_events) - 5} more events")

        return 0


async def scrape_event_command(args):
    """Handle scrape-event command."""
    config = ScraperConfig.from_env()
    config.headless = not args.visible

    async with FacebookEventScraper(config) as scraper:
        # Scrape event
        event = await scraper.scrape_event_page(args.url)

        if not event:
            print("❌ Failed to scrape event")
            return 1

        # Enrich event data
        event = enrich_event_data(event)

        print(f"\n✅ Scraped event: {event.get('title', 'Unknown')}")

        # Export to file
        if args.output:
            output_file = args.output
        else:
            timestamp = asyncio.get_event_loop().time()
            output_file = f"data/scraped_events/event_{int(timestamp)}.json"

        scraper.export_events([event], output_file)
        print(f"📁 Event exported to: {output_file}")

        # Print details
        if args.verbose:
            print("\n📋 Event Details:")
            print(json.dumps(event, indent=2, ensure_ascii=False))

        return 0


async def scrape_multiple_command(args):
    """Handle scrape-multiple command."""
    # Read URLs from file
    urls_file = Path(args.urls)
    if not urls_file.exists():
        print(f"❌ File not found: {urls_file}")
        return 1

    urls = urls_file.read_text().strip().split('\n')
    urls = [url.strip() for url in urls if url.strip() and not url.startswith('#')]

    print(f"📄 Found {len(urls)} URLs to scrape")

    config = ScraperConfig.from_env()
    config.headless = not args.visible

    all_events = []

    async with FacebookEventScraper(config) as scraper:
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Scraping: {url}")

            try:
                # Detect if it's an event page or regular page
                if '/events/' in url:
                    event = await scraper.scrape_event_page(url)
                    if event:
                        all_events.append(enrich_event_data(event))
                else:
                    events = await scraper.scrape_page_events(url, max_posts=args.max_posts)
                    for event in events:
                        enriched = enrich_event_data(event)
                        if validate_event_data(enriched):
                            all_events.append(enriched)

                print(f"  ✅ Found {len(all_events)} events so far")

            except Exception as e:
                print(f"  ❌ Error: {e}")
                continue

    print(f"\n✅ Total events scraped: {len(all_events)}")

    # Export to file
    if args.output:
        output_file = args.output
    else:
        timestamp = asyncio.get_event_loop().time()
        output_file = f"data/scraped_events/events_batch_{int(timestamp)}.json"

    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_events, f, ensure_ascii=False, indent=2)

    print(f"📁 Events exported to: {output_file}")

    return 0


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Facebook Event Scraper for Bieszczady.plus',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Login command
    login_parser = subparsers.add_parser('login', help='Login to Facebook')
    login_parser.add_argument('--email', required=True, help='Facebook email')
    login_parser.add_argument('--password', required=True, help='Facebook password')
    login_parser.add_argument('--visible', action='store_true', help='Show browser (not headless)')

    # Scrape page command
    scrape_page_parser = subparsers.add_parser('scrape-page', help='Scrape events from a Facebook page')
    scrape_page_parser.add_argument('--url', required=True, help='Facebook page URL')
    scrape_page_parser.add_argument('--max-posts', type=int, default=50, help='Maximum posts to scrape')
    scrape_page_parser.add_argument('--output', help='Output JSON file')
    scrape_page_parser.add_argument('--visible', action='store_true', help='Show browser')
    scrape_page_parser.add_argument('--verbose', action='store_true', help='Verbose output')

    # Scrape event command
    scrape_event_parser = subparsers.add_parser('scrape-event', help='Scrape a Facebook event page')
    scrape_event_parser.add_argument('--url', required=True, help='Facebook event URL')
    scrape_event_parser.add_argument('--output', help='Output JSON file')
    scrape_event_parser.add_argument('--visible', action='store_true', help='Show browser')
    scrape_event_parser.add_argument('--verbose', action='store_true', help='Verbose output')

    # Scrape multiple command
    scrape_multiple_parser = subparsers.add_parser('scrape-multiple', help='Scrape multiple URLs from file')
    scrape_multiple_parser.add_argument('--urls', required=True, help='Text file with URLs (one per line)')
    scrape_multiple_parser.add_argument('--max-posts', type=int, default=50, help='Max posts per page')
    scrape_multiple_parser.add_argument('--output', help='Output JSON file')
    scrape_multiple_parser.add_argument('--visible', action='store_true', help='Show browser')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Ensure directories exist
    Path('data/cookies').mkdir(parents=True, exist_ok=True)
    Path('data/scraped_events').mkdir(parents=True, exist_ok=True)
    Path('logs').mkdir(parents=True, exist_ok=True)

    # Run command
    if args.command == 'login':
        return asyncio.run(login_command(args))
    elif args.command == 'scrape-page':
        return asyncio.run(scrape_page_command(args))
    elif args.command == 'scrape-event':
        return asyncio.run(scrape_event_command(args))
    elif args.command == 'scrape-multiple':
        return asyncio.run(scrape_multiple_command(args))


if __name__ == '__main__':
    sys.exit(main())
