import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.website) {
      return NextResponse.json({ error: 'Lead has no website' }, { status: 400 });
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { ai_status: 'analyzing' },
    });

    const content = await aiService.fetchWebsiteContent(lead.website);
    const analysisResult = await aiService.analyzeWebsite(lead.name, content);

    if (analysisResult.error) {
      throw new Error(analysisResult.error);
    }

    const generatedEmail = await aiService.generateOutreachEmail(lead, analysisResult);

    await prisma.leadAnalysis.upsert({
      where: { lead_id: lead.id },
      update: {
        tech_stack: JSON.stringify(analysisResult.tech_stack || []),
        ux_assessment: analysisResult.ux_assessment,
        mobile_friendly: analysisResult.mobile_friendly,
        business_insight: analysisResult.business_insight,
        ai_confidence: analysisResult.score / 100,
        generated_email: generatedEmail,
      },
      create: {
        lead_id: lead.id,
        tech_stack: JSON.stringify(analysisResult.tech_stack || []),
        ux_assessment: analysisResult.ux_assessment,
        mobile_friendly: analysisResult.mobile_friendly,
        business_insight: analysisResult.business_insight,
        ai_confidence: analysisResult.score / 100,
        generated_email: generatedEmail,
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        ai_status: 'completed',
        ai_score: analysisResult.score,
        ai_grade: analysisResult.grade,
        ai_tags: JSON.stringify(analysisResult.tech_stack || []),
        contact_email: analysisResult.contact_email,
      },
    });

    return NextResponse.json({ status: 'success', message: 'Analysis completed' });
  } catch (error: any) {
    console.error(`Analysis failed for lead ${leadId}:`, error);
    await prisma.lead.update({
      where: { id: leadId },
      data: { ai_status: 'failed' },
    });
    return NextResponse.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
