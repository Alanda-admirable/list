import { NextRequest, NextResponse } from 'next/server';
import {
  getExecutiveById,
  updateExecutiveRecord,
  deleteExecutiveRecord,
} from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const executive = await getExecutiveById(id);

    if (!executive) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: executive },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
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
    const updated = await updateExecutiveRecord(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'อัปเดตข้อมูลผู้บริหารเรียบร้อยแล้ว',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteExecutiveRecord(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้บริหาร' },
        { status: 404 }
      );
    }

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
