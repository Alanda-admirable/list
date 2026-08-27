import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'audit'; // 'audit' or 'transfers'
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (type === 'transfers') {
      const histories = await prisma.positionHistory.findMany({
        include: {
          executive: {
            include: { organization: true },
          },
        },
        orderBy: { effectiveDate: 'desc' },
        take: limit,
      });

      return NextResponse.json({ success: true, data: histories });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
