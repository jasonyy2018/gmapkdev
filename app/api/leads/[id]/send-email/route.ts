import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      include: { analysis: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.contact_email) {
      return NextResponse.json({ error: 'Lead has no contact email' }, { status: 400 });
    }

    if (!lead.analysis || !lead.analysis.generated_email) {
      return NextResponse.json({ error: 'No generated email found for this lead' }, { status: 400 });
    }

    console.log(`--- Sending Email (Mock) ---`);
    console.log(`To: ${lead.contact_email}`);
    console.log(`Subject: Business Inquiry for ${lead.name}`);
    console.log(`Body: ${lead.analysis.generated_email.substring(0, 100)}...`);
    
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'contacted',
        contact_attempts: { increment: 1 },
        last_contacted: new Date(),
      },
    });

    return NextResponse.json({ status: 'success', message: 'Email sent' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
