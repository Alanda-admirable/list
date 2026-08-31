import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganizationById,
  updateOrganizationRecord,
  deleteOrganizationRecord,
} from '@/lib/data-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const org = await getOrganizationById(id);

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
    const updated = await updateOrganizationRecord(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลหน่วยงาน' },
        { status: 404 }
      );
    }

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
    const success = await deleteOrganizationRecord(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลหน่วยงาน' },
        { status: 404 }
      );
    }

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
