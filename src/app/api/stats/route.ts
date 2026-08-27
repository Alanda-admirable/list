import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Breakdown by category
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
  } catch (error: any) {
    console.error('Error in stats route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
