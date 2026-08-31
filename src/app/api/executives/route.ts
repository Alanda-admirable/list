import { NextRequest, NextResponse } from 'next/server';
import { getExecutives, createExecutiveRecord } from '@/lib/data-service';

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

    const result = await getExecutives({
      query,
      level,
      province,
      district,
      category,
      organizationId,
      status,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        total: result.total,
        data: result.data,
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
    const { prefix, firstName, lastName, position, organizationId } = body;

    if (!prefix || !firstName || !lastName || !position || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (คำนำหน้า, ชื่อ, นามสกุล, ตำแหน่ง, สังกัด)' },
        { status: 400 }
      );
    }

    const newExecutive = await createExecutiveRecord(body);

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
