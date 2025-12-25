# Quick Start Guide

Get up and running with the Facebook Event Scraper in 5 minutes!

## 1. Install Dependencies

```bash
cd backend/apps/scraper
pip install -r requirements.txt
playwright install chromium
```

## 2. Create Directories

```bash
mkdir -p data/cookies data/scraped_events logs
```

## 3. Login to Facebook

```bash
python cli.py login --email your@email.com --password yourpassword
```

**Tip**: If you have 2FA enabled, use `--visible` to see the browser and complete 2FA manually.

## 4. Scrape Your First Page

```bash
python cli.py scrape-page \
  --url https://www.facebook.com/YOUR_PAGE \
  --max-posts 20 \
  --verbose
```

## 5. View Results

Results are saved in `data/scraped_events/` as JSON files.

```bash
cat data/scraped_events/*.json | python -m json.tool
```

## Common Use Cases

### Scrape Multiple Pages

Create `urls.txt`:
```
https://www.facebook.com/page1
https://www.facebook.com/page2
```

Run:
```bash
python cli.py scrape-multiple --urls urls.txt
```

### Scrape a Specific Event

```bash
python cli.py scrape-event --url https://www.facebook.com/events/123456789
```

### Run in Docker

```bash
docker-compose -f docker-compose.scraper.yml build
docker-compose -f docker-compose.scraper.yml run facebook-scraper \
  python cli.py scrape-page --url https://www.facebook.com/YOUR_PAGE
```

## Troubleshooting

### Login Issues
- **2FA Required**: Use `--visible` flag
- **Checkpoint**: Run with `--visible` and complete manually
- **Blocked**: Wait 24 hours, increase delays in config.py

### No Events Found
- Check page is public
- Verify URL is correct
- Try with `--visible` to see what scraper sees
- Adjust keywords in config.py

### Rate Limited
Edit `config.py`:
```python
min_delay: float = 3.0  # Increase delays
max_delay: float = 6.0
```

## Next Steps

1. **Django Integration**: See `django_integration.py` for management commands
2. **Automation**: Set up Celery tasks for daily scraping
3. **Customization**: Adjust keywords and patterns in `config.py`

## Need Help?

- Read full documentation: [README.md](./README.md)
- Check examples: [example_urls.txt](./example_urls.txt)
- Review code: [facebook_scraper.py](./facebook_scraper.py)

Happy scraping! 🚀
