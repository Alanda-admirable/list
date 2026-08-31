import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        executives: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลหน่วยงาน' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: org });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลหน่วยงาน' },
        { status: 404 }
      );
    }

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
      orderIndex,
    } = body;

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        nameEn: nameEn ?? existing.nameEn,
        code: code ?? existing.code,
        level: level ?? existing.level,
        category: category ?? existing.category,
        ministry: ministry !== undefined ? ministry : existing.ministry,
        province: province !== undefined ? province : existing.province,
        district: district !== undefined ? district : existing.district,
        parentId: parentId !== undefined ? (parentId || null) : existing.parentId,
        address: address ?? existing.address,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        website: website ?? existing.website,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'ORGANIZATION',
        entityId: updated.id,
        title: `แก้ไขข้อมูลหน่วยงาน: ${updated.name}`,
        details: JSON.stringify({ before: existing, after: updated }),
        performedBy: 'ผู้ดูแลระบบ',
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'อัปเดตข้อมูลหน่วยงานเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { executives: true, children: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลหน่วยงาน' },
        { status: 404 }
      );
    }

    if (existing._count.executives > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบหน่วยงานได้เนื่องจากมีข้อมูลผู้บริหารสังกัดอยู่ ${existing._count.executives} ท่าน (กรุณาย้ายหรือลบข้อมูลผู้บริหารก่อน)`,
        },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'ORGANIZATION',
        entityId: id,
        title: `ลบหน่วยงาน: ${existing.name}`,
        performedBy: 'ผู้ดูแลระบบ',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบหน่วยงานเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
