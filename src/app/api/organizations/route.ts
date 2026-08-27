import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const province = searchParams.get('province');
    const category = searchParams.get('category');
    const tree = searchParams.get('tree') === 'true';

    const where: any = {};
    if (level && level !== 'ALL') where.level = level;
    if (province) where.province = province;
    if (category) where.category = category;

    if (tree) {
      // Fetch hierarchical tree (top-level organizations with nested children and executives)
      const topOrgs = await prisma.organization.findMany({
        where: {
          parentId: null,
          ...(level && level !== 'ALL' ? { level } : {}),
          ...(province ? { province } : {}),
        },
        include: {
          executives: {
            orderBy: { orderIndex: 'asc' },
          },
          children: {
            include: {
              executives: {
                orderBy: { orderIndex: 'asc' },
              },
              children: {
                include: {
                  executives: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      });

      return NextResponse.json({ success: true, data: topOrgs });
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        parent: true,
        _count: {
          select: { executives: true, children: true },
        },
      },
      orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: organizations,
    });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      nameEn,
      code,
      level,
      category,
      ministry,
      province,
      district,
      parentId,
      address,
      phone,
      email,
      website,
      orderIndex = 0,
    } = body;

    if (!name || !level || !category) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อหน่วยงาน ระดับ และประเภทหน่วยงาน' },
        { status: 400 }
      );
    }

    const newOrg = await prisma.organization.create({
      data: {
        name,
        nameEn,
        code: code || `ORG-${Date.now()}`,
        level,
        category,
        ministry,
        province,
        district,
        parentId: parentId || null,
        address,
        phone,
        email,
        website,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'ORGANIZATION',
        entityId: newOrg.id,
        title: `เพิ่มหน่วยงาน: ${newOrg.name} (${newOrg.category})`,
        details: JSON.stringify(newOrg),
        performedBy: 'ผู้ดูแลระบบ',
      },
    });

    return NextResponse.json({
      success: true,
      data: newOrg,
      message: 'เพิ่มหน่วยงานเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
