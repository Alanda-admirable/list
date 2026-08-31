import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_HISTORIES, INITIAL_AUDIT_LOGS, INITIAL_EXECUTIVES } from '@/lib/database-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'audit';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (type === 'transfers') {
      const enrichedHistories = INITIAL_HISTORIES.slice(0, limit).map((h) => {
        const executive = INITIAL_EXECUTIVES.find((e) => e.id === h.executiveId);
        return {
          ...h,
          executive,
        };
      });
      return NextResponse.json({ success: true, data: enrichedHistories });
    }

    const logs = INITIAL_AUDIT_LOGS.slice(0, limit);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
