import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { analysis: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const formattedLead = {
      ...lead,
      ai_tags: JSON.parse(lead.ai_tags || '[]'),
      analysis: lead.analysis ? {
        ...lead.analysis,
        tech_stack: JSON.parse(lead.analysis.tech_stack || '[]'),
        email_subjects: JSON.parse(lead.analysis.email_subjects || '[]'),
      } : null,
    };

    return NextResponse.json(formattedLead);
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}
