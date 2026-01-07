import httpx
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Optional
import urllib3

# Suppress insecure request warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class WebScraperService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

    async def fetch_page_content(self, url: str, timeout: float = 15.0) -> str:
        """Fetches the text content of a webpage."""
        if not url:
            return ""
        
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"

        try:
            async with httpx.AsyncClient(
                timeout=timeout, 
                follow_redirects=True, 
                headers=self.headers, 
                verify=False
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Remove non-content elements
                for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
                    element.extract()
                
                # Extract text
                text = soup.get_text(separator=' ', strip=True)
                
                # Basic cleaning: remove extra whitespace
                text = re.sub(r'\s+', ' ', text)
                
                return text[:15000] # Return a generous chunk for AI analysis
        except Exception as e:
            print(f"Scraper error for {url}: {e}")
            return f"Error fetching content: {str(e)}"

    async def extract_metadata(self, url: str) -> Dict:
        """Extracts basic metadata from the page."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=self.headers, verify=False) as client:
                response = await client.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                return {
                    "title": soup.title.string if soup.title else None,
                    "description": soup.find("meta", attrs={"name": "description"}).get("content") if soup.find("meta", attrs={"name": "description"}) else None,
                    "keywords": soup.find("meta", attrs={"name": "keywords"}).get("content") if soup.find("meta", attrs={"name": "keywords"}) else None
                }
        except:
            return {}
