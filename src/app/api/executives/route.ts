import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const level = searchParams.get('level') || 'ALL';
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';
    const category = searchParams.get('category') || '';
    const organizationId = searchParams.get('organizationId') || '';
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};

    if (level && level !== 'ALL') {
      where.organization = { ...where.organization, level };
    }

    if (province) {
      where.organization = { ...where.organization, province };
    }

    if (district) {
      where.organization = { ...where.organization, district };
    }

    if (category) {
      where.organization = { ...where.organization, category };
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (query) {
      const q = query.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { position: { contains: q } },
        { positionLevel: { contains: q } },
        { organization: { name: { contains: q } } },
        { organization: { province: { contains: q } } },
        { organization: { district: { contains: q } } },
      ];
    }

    const [total, executives] = await Promise.all([
      prisma.executive.count({ where }),
      prisma.executive.findMany({
        where,
        include: {
          organization: true,
          histories: {
            orderBy: { effectiveDate: 'desc' },
            take: 5,
          },
        },
        orderBy: [
          { orderIndex: 'asc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      data: executives,
    });
  } catch (error: any) {
    console.error('Error fetching executives:', error);
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
      prefix,
      firstName,
      lastName,
      position,
      positionLevel,
      organizationId,
      status = 'ACTIVE',
      appointmentDate,
      endDate,
      orderReference,
      phone,
      email,
      avatarUrl,
      bio,
      orderIndex = 0,
      adminName = 'ผู้ดูแลระบบ',
    } = body;

    if (!prefix || !firstName || !lastName || !position || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (คำนำหน้า, ชื่อ, นามสกุล, ตำแหน่ง, สังกัด)' },
        { status: 400 }
      );
    }

    const newExecutive = await prisma.executive.create({
      data: {
        prefix,
        firstName,
        lastName,
        position,
        positionLevel,
        organizationId,
        status,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        orderReference,
        phone,
        email,
        avatarUrl,
        bio,
        orderIndex: Number(orderIndex) || 0,
      },
      include: {
        organization: true,
      },
    });

    // Create Initial Position History
    await prisma.positionHistory.create({
      data: {
        executiveId: newExecutive.id,
        newPosition: position,
        organizationName: newExecutive.organization.name,
        effectiveDate: appointmentDate ? new Date(appointmentDate) : new Date(),
        orderReference: orderReference || 'คำสั่งแต่งตั้งเริ่มต้น',
        notes: 'บันทึกเข้าสู่ระบบครั้งแรก',
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'EXECUTIVE',
        entityId: newExecutive.id,
        title: `เพิ่มรายชื่อผู้บริหาร: ${prefix}${firstName} ${lastName} (${position})`,
        details: JSON.stringify(newExecutive),
        performedBy: adminName,
      },
    });

    return NextResponse.json({
      success: true,
      data: newExecutive,
      message: 'บันทึกข้อมูลผู้บริหารเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error creating executive:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
