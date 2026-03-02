import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin, urlparse

# ==============================
# QUANTORV CONFIG
# ==============================

SITE_URL = "https://quantorv-games.com"

INDEXNOW_KEY = "010f9beb3f3141579dafc9f8617404d1"

KEY_LOCATION = f"{SITE_URL}/{INDEXNOW_KEY}.txt"

INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

INDEXED_FILE = "quantorv_indexed_urls.txt"

MAX_DEPTH = 3

# ==============================


# ==============================
# GET URLS FROM SITEMAP
# ==============================

def get_sitemap_urls():

    sitemap_url = urljoin(SITE_URL, "sitemap.xml")

    urls = set()

    try:

        res = requests.get(sitemap_url, timeout=15)

        if res.status_code == 200:

            soup = BeautifulSoup(res.text, "xml")

            for loc in soup.find_all("loc"):

                urls.add(loc.text.strip())

            print(f"🗺 Sitemap URLs found: {len(urls)}")

        else:

            print("⚠ sitemap.xml not found")

    except Exception as e:

        print("Sitemap error:", e)

    return urls


# ==============================
# CRAWL SITE
# ==============================

def crawl_site(url, depth, visited=None):

    if visited is None:

        visited = set()

    if depth == 0:

        return visited

    try:

        res = requests.get(url, timeout=15)

        if res.status_code != 200:

            return visited

        soup = BeautifulSoup(res.text, "lxml")

        for a in soup.find_all("a", href=True):

            full = urljoin(url, a["href"])

            if urlparse(full).netloc == urlparse(SITE_URL).netloc:

                if full not in visited:

                    visited.add(full)

                    crawl_site(full, depth - 1, visited)

    except Exception as e:

        print("Crawl error:", e)

    return visited


# ==============================
# LOAD INDEXED URLS
# ==============================

def load_indexed():

    if not os.path.exists(INDEXED_FILE):

        return set()

    with open(INDEXED_FILE, "r") as f:

        return set(line.strip() for line in f)


# ==============================
# SAVE INDEXED URLS
# ==============================

def save_indexed(urls):

    with open(INDEXED_FILE, "a") as f:

        for url in urls:

            f.write(url + "\n")


# ==============================
# SUBMIT TO INDEXNOW
# ==============================

def submit_to_indexnow(urls):

    if not urls:

        return

    payload = {

        "host": urlparse(SITE_URL).netloc,

        "key": INDEXNOW_KEY,

        "keyLocation": KEY_LOCATION,

        "urlList": list(urls)

    }

    headers = {

        "Content-Type": "application/json"

    }

    try:

        res = requests.post(

            INDEXNOW_ENDPOINT,

            headers=headers,

            data=json.dumps(payload),

            timeout=15

        )

        if res.status_code == 200:

            print(f"✅ Submitted {len(urls)} URLs")

        else:

            print("❌ Error:", res.status_code, res.text)

    except Exception as e:

        print("Submit error:", e)


# ==============================
# MAIN
# ==============================

def main():

    print("🔍 Quantorv IndexNow Scanner Starting")

    sitemap_urls = get_sitemap_urls()

    crawled_urls = crawl_site(SITE_URL, MAX_DEPTH)

    all_urls = sitemap_urls.union(crawled_urls)

    print(f"🌐 Total found: {len(all_urls)}")

    indexed = load_indexed()

    new_urls = all_urls - indexed

    print(f"🆕 New URLs: {len(new_urls)}")

    if new_urls:

        submit_to_indexnow(new_urls)

        save_indexed(new_urls)

    else:

        print("✔ No new URLs")


# ==============================

if __name__ == "__main__":

    main()