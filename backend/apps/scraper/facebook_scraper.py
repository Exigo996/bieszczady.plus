"""
Facebook Event Scraper using Playwright
========================================

Production-ready scraper for extracting event information from Facebook posts.
Handles dynamic content, anti-bot measures, and various post formats.

Author: Claude Code
Project: Bieszczady.plus
"""

import asyncio
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path
import logging

from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from playwright.async_api import TimeoutError as PlaywrightTimeoutError

from .config import ScraperConfig
from .utils import (
    parse_facebook_date,
    extract_location,
    sanitize_text,
    random_delay,
    detect_event_in_text
)

# Configure logging
logger = logging.getLogger(__name__)


class FacebookEventScraper:
    """
    Async Facebook event scraper using Playwright.

    Handles:
    - Facebook authentication
    - Cookie persistence
    - Anti-bot detection avoidance
    - Dynamic content loading
    - Multiple post formats
    - Rate limiting
    """

    def __init__(self, config: ScraperConfig):
        self.config = config
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._login_cookies: Optional[List[Dict]] = None

    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def initialize(self):
        """Initialize browser with anti-detection measures."""
        logger.info("Initializing Playwright browser...")

        playwright = await async_playwright().start()

        # Launch browser with stealth settings
        self.browser = await playwright.chromium.launch(
            headless=self.config.headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ]
        )

        # Create context with realistic user agent and viewport
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent=self.config.user_agent,
            locale='pl-PL',
            timezone_id='Europe/Warsaw',
            permissions=['geolocation'],
            geolocation={'latitude': 49.4, 'longitude': 22.5},  # Bieszczady region
        )

        # Add stealth scripts to avoid detection
        await self.context.add_init_script("""
            // Override navigator.webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });

            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });

            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['pl-PL', 'pl', 'en-US', 'en']
            });
        """)

        self.page = await self.context.new_page()

        # Load cookies if available
        await self._load_cookies()

        logger.info("Browser initialized successfully")

    async def close(self):
        """Clean up browser resources."""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        logger.info("Browser closed")

    async def login(self, email: str, password: str) -> bool:
        """
        Login to Facebook with provided credentials.

        Args:
            email: Facebook account email
            password: Facebook account password

        Returns:
            bool: True if login successful, False otherwise
        """
        logger.info(f"Attempting login for {email}...")

        try:
            # Navigate to Facebook login page
            await self.page.goto('https://www.facebook.com/login', wait_until='networkidle')
            await random_delay(2, 4)

            # Fill login form
            await self.page.fill('input[name="email"]', email)
            await random_delay(0.5, 1.5)

            await self.page.fill('input[name="pass"]', password)
            await random_delay(0.5, 1.5)

            # Click login button
            await self.page.click('button[name="login"]')

            # Wait for navigation
            await self.page.wait_for_load_state('networkidle', timeout=30000)
            await random_delay(3, 5)

            # Check if login was successful
            current_url = self.page.url

            # Handle 2FA or checkpoint if needed
            if 'checkpoint' in current_url or 'two_factor' in current_url:
                logger.warning("2FA or checkpoint detected - manual intervention required")
                return False

            if 'login' in current_url:
                logger.error("Login failed - still on login page")
                return False

            # Save cookies for future use
            await self._save_cookies()

            logger.info("Login successful")
            return True

        except Exception as e:
            logger.error(f"Login error: {e}")
            return False

    async def scrape_page_events(self, page_url: str, max_posts: int = 50) -> List[Dict[str, Any]]:
        """
        Scrape events from a Facebook page.

        Args:
            page_url: URL of the Facebook page to scrape
            max_posts: Maximum number of posts to scrape

        Returns:
            List of event dictionaries
        """
        logger.info(f"Scraping events from: {page_url}")

        events = []

        try:
            # Navigate to page
            await self.page.goto(page_url, wait_until='networkidle')
            await random_delay(2, 4)

            # Close any popups/modals
            await self._close_popups()

            # Scroll and load posts
            posts = await self._load_posts(max_posts)

            logger.info(f"Found {len(posts)} posts to analyze")

            # Extract events from posts
            for i, post in enumerate(posts):
                try:
                    event_data = await self._extract_event_from_post(post)

                    if event_data:
                        events.append(event_data)
                        logger.info(f"Extracted event {i+1}: {event_data.get('title', 'Unknown')}")

                    await random_delay(1, 2)

                except Exception as e:
                    logger.warning(f"Error extracting event from post {i+1}: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error scraping page: {e}")

        logger.info(f"Extracted {len(events)} events from {page_url}")
        return events

    async def scrape_event_page(self, event_url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape structured event data from Facebook event page.

        Args:
            event_url: URL of the Facebook event

        Returns:
            Event dictionary or None
        """
        logger.info(f"Scraping event page: {event_url}")

        try:
            await self.page.goto(event_url, wait_until='networkidle')
            await random_delay(2, 4)

            await self._close_popups()

            # Extract structured event data
            event_data = await self._extract_structured_event()

            if event_data:
                logger.info(f"Successfully extracted event: {event_data.get('title', 'Unknown')}")
                return event_data
            else:
                logger.warning("No event data found on page")
                return None

        except Exception as e:
            logger.error(f"Error scraping event page: {e}")
            return None

    async def _load_posts(self, max_posts: int) -> List:
        """
        Scroll page and load posts with infinite scroll handling.

        Args:
            max_posts: Maximum number of posts to load

        Returns:
            List of post elements
        """
        posts = []
        scroll_attempts = 0
        max_scroll_attempts = 20
        previous_post_count = 0

        while len(posts) < max_posts and scroll_attempts < max_scroll_attempts:
            # Find all posts on page
            # Facebook uses various selectors - try multiple
            post_selectors = [
                'div[data-ad-preview="message"]',
                'div[role="article"]',
                'div.userContentWrapper',
                'div[data-pagelet^="FeedUnit"]',
            ]

            for selector in post_selectors:
                try:
                    elements = await self.page.query_selector_all(selector)
                    if elements:
                        posts = elements
                        break
                except:
                    continue

            current_post_count = len(posts)

            # If no new posts loaded, stop scrolling
            if current_post_count == previous_post_count:
                scroll_attempts += 1
            else:
                scroll_attempts = 0
                previous_post_count = current_post_count

            # Scroll down
            await self.page.evaluate('window.scrollBy(0, window.innerHeight)')
            await random_delay(2, 4)

            logger.debug(f"Loaded {current_post_count} posts (attempt {scroll_attempts})")

        return posts[:max_posts]

    async def _extract_event_from_post(self, post_element) -> Optional[Dict[str, Any]]:
        """
        Extract event information from a Facebook post.

        Args:
            post_element: Playwright element handle for post

        Returns:
            Event dictionary or None if no event detected
        """
        try:
            # Get post text content
            text_content = await post_element.inner_text()

            # Check if post contains event-related keywords
            if not detect_event_in_text(text_content):
                return None

            # Extract various fields
            event_data = {
                'source': 'facebook_post',
                'scraped_at': datetime.now().isoformat(),
            }

            # Extract title (usually first line or bold text)
            title = await self._extract_title(post_element, text_content)
            if title:
                event_data['title'] = title

            # Extract date and time
            date_info = parse_facebook_date(text_content)
            if date_info:
                event_data.update(date_info)

            # Extract location
            location = extract_location(text_content)
            if location:
                event_data['location'] = location

            # Extract description
            event_data['description'] = sanitize_text(text_content)

            # Extract images
            images = await self._extract_images(post_element)
            if images:
                event_data['images'] = images

            # Extract post URL
            post_url = await self._extract_post_url(post_element)
            if post_url:
                event_data['external_url'] = post_url

            # Only return if we have minimum required fields
            if 'title' in event_data or ('start_date' in event_data and 'location' in event_data):
                return event_data

            return None

        except Exception as e:
            logger.warning(f"Error extracting event from post: {e}")
            return None

    async def _extract_structured_event(self) -> Optional[Dict[str, Any]]:
        """
        Extract structured data from Facebook event page.

        Returns:
            Event dictionary or None
        """
        try:
            event_data = {
                'source': 'facebook_event',
                'scraped_at': datetime.now().isoformat(),
                'external_url': self.page.url,
            }

            # Extract Facebook event ID from URL
            event_id_match = re.search(r'/events/(\d+)', self.page.url)
            if event_id_match:
                event_data['facebook_event_id'] = event_id_match.group(1)

            # Extract title
            title_selectors = [
                'h1',
                'span[dir="auto"]',
                '[role="heading"]',
            ]

            for selector in title_selectors:
                try:
                    title_elem = await self.page.query_selector(selector)
                    if title_elem:
                        title = await title_elem.inner_text()
                        if title and len(title) > 5:
                            event_data['title'] = sanitize_text(title)
                            break
                except:
                    continue

            # Extract date/time - look for structured data
            page_content = await self.page.content()

            # Try to extract from JSON-LD structured data
            json_ld_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', page_content, re.DOTALL)
            if json_ld_match:
                try:
                    json_data = json.loads(json_ld_match.group(1))
                    if 'startDate' in json_data:
                        event_data['start_date'] = json_data['startDate']
                    if 'endDate' in json_data:
                        event_data['end_date'] = json_data['endDate']
                    if 'location' in json_data:
                        location = json_data['location']
                        if isinstance(location, dict):
                            event_data['location'] = location.get('name', '')
                except:
                    pass

            # Extract description
            description_text = await self.page.evaluate('''() => {
                const descElements = document.querySelectorAll('[data-ad-preview="message"], [data-ad-comet-preview="message"]');
                for (const elem of descElements) {
                    if (elem.innerText && elem.innerText.length > 20) {
                        return elem.innerText;
                    }
                }
                return '';
            }''')

            if description_text:
                event_data['description'] = sanitize_text(description_text)

            # Extract images
            images = await self._extract_images(None)
            if images:
                event_data['images'] = images

            return event_data if 'title' in event_data else None

        except Exception as e:
            logger.error(f"Error extracting structured event: {e}")
            return None

    async def _extract_title(self, post_element, text_content: str) -> Optional[str]:
        """Extract title from post."""
        try:
            # Try to find bold/emphasized text (usually event title)
            bold_selectors = ['strong', 'b', 'h2', 'h3', '[style*="font-weight: 700"]']

            for selector in bold_selectors:
                try:
                    bold_elem = await post_element.query_selector(selector)
                    if bold_elem:
                        title = await bold_elem.inner_text()
                        if title and 10 <= len(title) <= 200:
                            return sanitize_text(title)
                except:
                    continue

            # Fallback: use first line if it looks like a title
            lines = text_content.split('\n')
            first_line = lines[0].strip() if lines else ''

            if first_line and 10 <= len(first_line) <= 200:
                return sanitize_text(first_line)

            return None

        except:
            return None

    async def _extract_images(self, post_element) -> List[str]:
        """Extract image URLs from post."""
        images = []

        try:
            # Find all images in post (or whole page if post_element is None)
            if post_element:
                img_elements = await post_element.query_selector_all('img')
            else:
                img_elements = await self.page.query_selector_all('img')

            for img in img_elements:
                try:
                    src = await img.get_attribute('src')
                    # Filter out icons, profile pictures, and tiny images
                    if src and 'scontent' in src and 'safe_image' not in src:
                        # Get higher resolution version if available
                        if '&_nc_cat=' in src:
                            # Remove size restrictions from URL
                            src = re.sub(r'&oh=[^&]*', '', src)
                            src = re.sub(r'&oe=[^&]*', '', src)
                        images.append(src)
                except:
                    continue

            # Remove duplicates while preserving order
            images = list(dict.fromkeys(images))

            # Limit to first 5 images
            return images[:5]

        except:
            return []

    async def _extract_post_url(self, post_element) -> Optional[str]:
        """Extract permalink URL from post."""
        try:
            # Find link with timestamp (usually permalink)
            link_elements = await post_element.query_selector_all('a[href*="/posts/"], a[href*="/photos/"], a[href*="/videos/"]')

            for link in link_elements:
                href = await link.get_attribute('href')
                if href and ('posts' in href or 'photos' in href or 'videos' in href):
                    # Convert relative to absolute URL
                    if href.startswith('/'):
                        return f"https://www.facebook.com{href}"
                    return href.split('?')[0]  # Remove query params

            return None

        except:
            return None

    async def _close_popups(self):
        """Close cookie banners, login prompts, and other popups."""
        popup_selectors = [
            'div[aria-label="Close"]',
            'button[aria-label="Close"]',
            'div[aria-label="Zamknij"]',
            'button[aria-label="Zamknij"]',
            'div[data-testid="cookie-policy-manage-dialog-accept-button"]',
        ]

        for selector in popup_selectors:
            try:
                popup = await self.page.query_selector(selector)
                if popup:
                    await popup.click()
                    await random_delay(0.5, 1)
            except:
                continue

    async def _save_cookies(self):
        """Save cookies to file for session persistence."""
        cookies = await self.context.cookies()
        self._login_cookies = cookies

        cookie_file = Path(self.config.cookie_file)
        cookie_file.parent.mkdir(parents=True, exist_ok=True)

        with open(cookie_file, 'w') as f:
            json.dump(cookies, f)

        logger.info(f"Cookies saved to {cookie_file}")

    async def _load_cookies(self):
        """Load cookies from file if available."""
        cookie_file = Path(self.config.cookie_file)

        if cookie_file.exists():
            try:
                with open(cookie_file, 'r') as f:
                    cookies = json.load(f)

                await self.context.add_cookies(cookies)
                self._login_cookies = cookies

                logger.info(f"Cookies loaded from {cookie_file}")
            except Exception as e:
                logger.warning(f"Failed to load cookies: {e}")

    def export_events(self, events: List[Dict], output_file: str):
        """
        Export events to JSON file.

        Args:
            events: List of event dictionaries
            output_file: Path to output JSON file
        """
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

        logger.info(f"Exported {len(events)} events to {output_path}")
