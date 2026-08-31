import { NextRequest, NextResponse } from 'next/server';
import { getExecutiveById, updateExecutiveRecord } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { executiveId, imageUrl, base64Data } = body;

    if (!executiveId) {
      return NextResponse.json({ success: false, error: 'ระบุ executiveId ไม่ถูกต้อง' }, { status: 400 });
    }

    const executive = await getExecutiveById(executiveId);

    if (!executive) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลผู้บริหาร' }, { status: 404 });
    }

    let finalPublicUrl = '';

    if (imageUrl) {
      finalPublicUrl = imageUrl.trim();
    } else if (base64Data) {
      finalPublicUrl = base64Data;
    } else {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ imageUrl หรือ base64Data' }, { status: 400 });
    }

    // Update record
    const updated = await updateExecutiveRecord(executiveId, {
      avatarUrl: finalPublicUrl,
      photoVerified: true,
      photoSource: imageUrl ? 'Google Images / Web' : 'User Upload',
    });

    return NextResponse.json({
      success: true,
      data: updated,
      avatarUrl: finalPublicUrl,
      message: 'บันทึกรูปภาพจริงของผู้บริหารเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Error fetching/saving avatar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
