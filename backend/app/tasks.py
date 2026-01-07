from .db import engine
from .models import Lead, LeadAnalysis
from .services.ai_service import AIService
from .services.scraper_service import WebScraperService
from .config import settings
import datetime as dt

# Create service instances for task use
ai_service = AIService()
scraper_service = WebScraperService()

async def analyze_lead_task(lead_id: int):
    """
    Background task to analyze a lead's website.
    Coordinates scraping and AI analysis.
    """
    print(f"Starting AI analysis task for lead {lead_id}")
    
    with Session(engine) as session:
        lead = session.get(Lead, lead_id)
        if not lead or not lead.website:
            print(f"Skipping analysis for lead {lead_id}: No website URL.")
            return

        # Update status to analyzing
        lead.ai_status = "analyzing"
        lead.updated_at = dt.datetime.utcnow()
        session.add(lead)
        session.commit()
        session.refresh(lead)

        try:
            # 1. Fetch content
            print(f"Scraping website: {lead.website}")
            content = await scraper_service.fetch_page_content(lead.website)
            
            if not content or content.startswith("Error"):
                print(f"Scrape failed for {lead.name}: {content}")
                lead.ai_status = "failed"
                session.add(lead)
                session.commit()
                return

            # 2. AI Analysis
            print(f"Analyzing content with Gemini for {lead.name}...")
            analysis_data = await ai_service.analyze_website(lead.name, content)

            if "error" not in analysis_data:
                # Create Analysis record
                analysis = LeadAnalysis(
                    lead_id=lead.id,
                    tech_stack=analysis_data.get("tech_stack", []),
                    ux_assessment=analysis_data.get("ux_assessment"),
                    mobile_friendly=analysis_data.get("mobile_friendly"),
                    business_insight=analysis_data.get("business_insight"),
                    detailed_analysis=analysis_data.get("ux_assessment"), # Temporary mapping
                    ai_confidence=0.85 # Placeholder
                )
                session.add(analysis)

                # Update Lead record
                lead.ai_score = analysis_data.get("score")
                lead.ai_grade = analysis_data.get("grade")
                lead.contact_email = analysis_data.get("contact_email")
                lead.ai_tags = analysis_data.get("tech_stack", [])[:5]
                lead.ai_status = "completed"
                lead.status = "analyzed"
                print(f"Analysis successfully completed for {lead.name}")
            else:
                print(f"AI error for {lead.name}: {analysis_data.get('error')}")
                lead.ai_status = "failed"

            lead.updated_at = dt.datetime.utcnow()
            session.add(lead)
            session.commit()

        except Exception as e:
            print(f"Unexpected error in analysis task for lead {lead_id}: {e}")
            lead.ai_status = "failed"
            lead.updated_at = dt.datetime.utcnow()
            session.add(lead)
            session.commit()
