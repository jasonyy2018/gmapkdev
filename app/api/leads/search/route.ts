import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapsService } from '@/lib/maps';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const location = searchParams.get('location');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const results = await mapsService.searchPlaces(query, location || undefined);
    
    const savedLeads = [];
    for (const r of results) {
      try {
        let lead = await prisma.lead.findUnique({
          where: { place_id: r.place_id },
          include: { analysis: true },
        });

        if (!lead) {
          lead = await prisma.lead.create({
            data: {
              name: r.name || "Unknown Business",
              address: r.address,
              website: r.website,
              phone: r.phone,
              rating: r.rating,
              place_id: r.place_id!,
              search_query: query,
              search_location: location,
            },
            include: { analysis: true },
          });

          if (lead.website) {
            fetch(`${req.nextUrl.origin}/api/leads/${lead.id}/analyze`, {
              method: 'POST',
            }).catch(err => console.error('Background analysis trigger failed:', err));
          }
        }
        
        savedLeads.push({
          ...lead,
          ai_tags: JSON.parse(lead.ai_tags || '[]'),
          analysis: lead.analysis ? {
            ...lead.analysis,
            tech_stack: JSON.parse(lead.analysis.tech_stack || '[]'),
            email_subjects: JSON.parse(lead.analysis.email_subjects || '[]'),
          } : null,
        });
      } catch (error) {
        console.error(`Error saving lead ${r.name}:`, error);
        continue;
      }
    }

    return NextResponse.json(savedLeads);
  } catch (error: any) {
    console.error('Error in search:', error);
    return NextResponse.json({ error: `Maps search failed: ${error.message}` }, { status: 500 });
  }
}
