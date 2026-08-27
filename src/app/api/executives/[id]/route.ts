import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executive = await prisma.executive.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        histories: {
          orderBy: { effectiveDate: 'desc' },
        },
      },
    });

    if (!executive) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: executive });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const existing = await prisma.executive.findUnique({
      where: { id: params.id },
      include: { organization: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

    const {
      prefix,
      firstName,
      lastName,
      position,
      positionLevel,
      organizationId,
      status,
      appointmentDate,
      endDate,
      orderReference,
      phone,
      email,
      avatarUrl,
      bio,
      orderIndex,
      isTransfer,
      transferNotes,
      adminName = 'ผู้ดูแลระบบ',
    } = body;

    // Check if position or organization changed or isTransfer is requested
    const isPositionChanged =
      isTransfer ||
      position !== existing.position ||
      (organizationId && organizationId !== existing.organizationId);

    const updated = await prisma.executive.update({
      where: { id: params.id },
      data: {
        prefix: prefix ?? existing.prefix,
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        position: position ?? existing.position,
        positionLevel: positionLevel ?? existing.positionLevel,
        organizationId: organizationId ?? existing.organizationId,
        status: status ?? existing.status,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : existing.appointmentDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        orderReference: orderReference ?? existing.orderReference,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
        bio: bio ?? existing.bio,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : existing.orderIndex,
      },
      include: {
        organization: true,
      },
    });

    // If transferred / promoted / position changed, record in PositionHistory
    if (isPositionChanged) {
      await prisma.positionHistory.create({
        data: {
          executiveId: updated.id,
          previousPosition: existing.position,
          newPosition: updated.position,
          organizationName: updated.organization.name,
          effectiveDate: appointmentDate ? new Date(appointmentDate) : new Date(),
          orderReference: orderReference || 'คำสั่งโยกย้าย/ปรับปรุงตำแหน่ง',
          notes: transferNotes || `ปรับปรุงตำแหน่งจาก "${existing.position}" เป็น "${updated.position}"`,
        },
      });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: isPositionChanged ? 'TRANSFER' : 'UPDATE',
        entityType: 'EXECUTIVE',
        entityId: updated.id,
        title: isPositionChanged
          ? `โยกย้าย/ปรับตำแหน่ง: ${updated.prefix}${updated.firstName} ${updated.lastName} สู่ ${updated.position}`
          : `แก้ไขข้อมูลผู้บริหาร: ${updated.prefix}${updated.firstName} ${updated.lastName}`,
        details: JSON.stringify({ before: existing, after: updated }),
        performedBy: adminName,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'อัปเดตข้อมูลผู้บริหารเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error updating executive:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.executive.findUnique({
      where: { id: params.id },
      include: { organization: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

    await prisma.executive.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'EXECUTIVE',
        entityId: params.id,
        title: `ลบข้อมูลผู้บริหาร: ${existing.prefix}${existing.firstName} ${existing.lastName} (${existing.position})`,
        details: JSON.stringify(existing),
        performedBy: 'ผู้ดูแลระบบ',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลผู้บริหารเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error deleting executive:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
