import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const executiveId = formData.get('executiveId') as string | null;

    const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่พบไฟล์รูปภาพ' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const results = [];

    // Case 1: Single file targeting specific executiveId
    if (executiveId && allFiles.length === 1) {
      const file = allFiles[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const cleanName = `real_exec_${executiveId}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, cleanName);
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/avatars/${cleanName}`;

      await prisma.executive.update({
        where: { id: executiveId },
        data: { avatarUrl: publicUrl },
      });

      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: 'อัปโหลดและผูกรูปถ่ายจริงของผู้บริหารสำเร็จ',
      });
    }

    // Case 2: Bulk upload / Name matching
    const allExecutives = await prisma.executive.findMany();

    for (const file of allFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name;
      const baseNameWithoutExt = path.parse(originalName).name.toLowerCase();
      const ext = path.extname(originalName) || '.jpg';

      // Find matching executive
      const matchedExec = allExecutives.find((e) => {
        const fn = e.firstName.toLowerCase().trim();
        const ln = e.lastName.toLowerCase().trim();
        return (
          (fn && baseNameWithoutExt.includes(fn)) ||
          (ln && baseNameWithoutExt.includes(ln)) ||
          baseNameWithoutExt.includes(e.id)
        );
      });

      const cleanName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(uploadDir, cleanName);
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/avatars/${cleanName}`;

      if (matchedExec) {
        await prisma.executive.update({
          where: { id: matchedExec.id },
          data: { avatarUrl: publicUrl },
        });

        results.push({
          fileName: originalName,
          matched: true,
          executive: `${matchedExec.prefix || ''}${matchedExec.firstName} ${matchedExec.lastName}`,
          url: publicUrl,
        });
      } else {
        results.push({
          fileName: originalName,
          matched: false,
          url: publicUrl,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      matchedCount: results.filter((r) => r.matched).length,
      totalCount: results.length,
      message: `ประมวลผลอัปโหลด ${results.length} ไฟล์ (จับคู่สำเร็จ ${results.filter((r) => r.matched).length} ท่าน)`,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
