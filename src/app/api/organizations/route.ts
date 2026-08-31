import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrganizations, getExecutives } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level') || undefined;
    const province = searchParams.get('province') || undefined;
    const category = searchParams.get('category') || undefined;
    const parentId = searchParams.get('parentId') || undefined;
    const query = searchParams.get('q') || undefined;
    const tree = searchParams.get('tree') === 'true';

    if (tree) {
      // Fetch all organizations
      const allOrgs = await getOrganizations({ province, category });
      const { data: allExecs } = await getExecutives({ limit: 1000 });

      // Build Map
      const orgMap: Record<string, any> = {};
      allOrgs.forEach((org: any) => {
        orgMap[org.id] = {
          ...org,
          executives: allExecs.filter((e: any) => e.organizationId === org.id),
          children: [],
        };
      });

      const rootNodes: any[] = [];
      allOrgs.forEach((org: any) => {
        if (org.parentId && orgMap[org.parentId]) {
          orgMap[org.parentId].children.push(orgMap[org.id]);
        } else {
          if (!level || level === 'ALL' || org.level === level) {
            rootNodes.push(orgMap[org.id]);
          }
        }
      });

      return NextResponse.json({ success: true, data: rootNodes });
    }

    const organizations = await getOrganizations({
      level,
      province,
      category,
      parentId,
      query,
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
