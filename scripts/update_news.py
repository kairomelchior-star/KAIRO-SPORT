import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "news.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

FEEDS = [
    ("BBC Sport", "https://feeds.bbci.co.uk/sport/football/rss.xml"),
    ("The Guardian", "https://www.theguardian.com/football/rss"),
    ("Google News – Afrique", "https://news.google.com/rss/search?q=football%20Afrique&hl=fr&gl=FR&ceid=FR:fr"),
]

def clean(text):
    text = unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\\s+", " ", text).strip()

def parse_date(value):
    if not value:
        return ""
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except Exception:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        except Exception:
            return ""

def fetch(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "KairoSport-NewsBot/1.0 (+https://kairomelchior-star.github.io)"}
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()

items = []
seen = set()

for source, url in FEEDS:
    try:
        root = ET.fromstring(fetch(url))
        for item in root.findall(".//item"):
            title = clean(item.findtext("title"))
            link = clean(item.findtext("link"))
            description = clean(item.findtext("description"))
            pub_date = parse_date(item.findtext("pubDate"))
            if not title or not link or link in seen:
                continue
            seen.add(link)
            items.append({
                "title": title,
                "link": link,
                "description": description[:220],
                "source": source,
                "published": pub_date
            })
    except Exception as exc:
        print(f"Flux indisponible: {source}: {exc}")

items.sort(key=lambda x: x["published"], reverse=True)
items = items[:12]

payload = {
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "items": items
}

OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(items)} actualités enregistrées dans {OUT}")
