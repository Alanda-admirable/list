import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { executiveId, imageUrl, base64Data, filename } = body;

    if (!executiveId) {
      return NextResponse.json({ success: false, error: 'ระบุ executiveId ไม่ถูกต้อง' }, { status: 400 });
    }

    const executive = await prisma.executive.findUnique({
      where: { id: executiveId },
    });

    if (!executive) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลผู้บริหาร' }, { status: 404 });
    }

    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    let finalPublicUrl = '';

    // Case 1: Base64 Data
    if (base64Data) {
      const ext = filename ? path.extname(filename) || '.jpg' : '.jpg';
      const cleanFileName = `real_exec_${executiveId}_${Date.now()}${ext}`;
      const filePath = path.join(avatarsDir, cleanFileName);
      const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');
      fs.writeFileSync(filePath, buffer);
      finalPublicUrl = `/avatars/${cleanFileName}`;
    }
    // Case 2: Direct Image URL from WWW
    else if (imageUrl) {
      finalPublicUrl = imageUrl.trim();
    } else {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ imageUrl หรือ base64Data' }, { status: 400 });
    }

    // Update database
    const updated = await prisma.executive.update({
      where: { id: executiveId },
      data: { avatarUrl: finalPublicUrl },
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
