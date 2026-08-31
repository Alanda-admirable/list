import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_ORGANIZATIONS, INITIAL_EXECUTIVES, INITIAL_AUDIT_LOGS } from '@/lib/database-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [
      totalExecutives,
      activeCount,
      actingCount,
      vacantCount,
      retiredCount,
      totalOrganizations,
      centralCount,
      provincialCount,
      districtCount,
      localCount,
      recentUpdates,
    ] = await Promise.all([
      prisma.executive.count(),
      prisma.executive.count({ where: { status: 'ACTIVE' } }),
      prisma.executive.count({ where: { status: 'ACTING' } }),
      prisma.executive.count({ where: { status: 'VACANT' } }),
      prisma.executive.count({ where: { status: 'RETIRED' } }),
      prisma.organization.count(),
      prisma.executive.count({ where: { organization: { level: 'CENTRAL' } } }),
      prisma.executive.count({ where: { organization: { level: 'PROVINCIAL' } } }),
      prisma.executive.count({ where: { organization: { level: 'DISTRICT' } } }),
      prisma.executive.count({ where: { organization: { level: 'LOCAL' } } }),
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    if (totalExecutives > 0) {
      const orgsByCategory = await prisma.organization.groupBy({
        by: ['category'],
        _count: { id: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          executives: {
            total: totalExecutives,
            active: activeCount,
            acting: actingCount,
            vacant: vacantCount,
            retired: retiredCount,
          },
          byLevel: {
            central: centralCount,
            provincial: provincialCount,
            district: districtCount,
            local: localCount,
          },
          organizations: {
            total: totalOrganizations,
            byCategory: orgsByCategory,
          },
          recentUpdates,
        },
      });
    }
  } catch (error: any) {
    console.warn('Prisma stats failed, using fallback metrics:', error);
  }

  // Cloudflare fallback calculation
  const totalExecutives = INITIAL_EXECUTIVES.length;
  const activeCount = INITIAL_EXECUTIVES.filter((e) => e.status === 'ACTIVE').length;
  const actingCount = INITIAL_EXECUTIVES.filter((e) => e.status === 'ACTING').length;
  const vacantCount = INITIAL_EXECUTIVES.filter((e) => e.status === 'VACANT').length;
  const retiredCount = INITIAL_EXECUTIVES.filter((e) => e.status === 'RETIRED').length;
  const totalOrganizations = INITIAL_ORGANIZATIONS.length;
  const centralCount = INITIAL_EXECUTIVES.filter((e) => e.organization?.level === 'CENTRAL').length;
  const provincialCount = INITIAL_EXECUTIVES.filter((e) => e.organization?.level === 'PROVINCIAL').length;
  const districtCount = INITIAL_EXECUTIVES.filter((e) => e.organization?.level === 'DISTRICT').length;
  const localCount = INITIAL_EXECUTIVES.filter((e) => e.organization?.level === 'LOCAL').length;

  const categoryCounts: Record<string, number> = {};
  INITIAL_ORGANIZATIONS.forEach((o) => {
    categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
  });
  const orgsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    _count: { id: count },
  }));

  return NextResponse.json({
    success: true,
    data: {
      executives: {
        total: totalExecutives,
        active: activeCount,
        acting: actingCount,
        vacant: vacantCount,
        retired: retiredCount,
      },
      byLevel: {
        central: centralCount,
        provincial: provincialCount,
        district: districtCount,
        local: localCount,
      },
      organizations: {
        total: totalOrganizations,
        byCategory: orgsByCategory,
      },
      recentUpdates: INITIAL_AUDIT_LOGS.slice(0, 10),
    },
  });
}
