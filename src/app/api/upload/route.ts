import { NextRequest, NextResponse } from 'next/server';
import { getExecutives, updateExecutiveRecord } from '@/lib/data-service';

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

    const results = [];

    // Case 1: Single file targeting specific executiveId
    if (executiveId && allFiles.length === 1) {
      const file = allFiles[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;

      await updateExecutiveRecord(executiveId, {
        avatarUrl: base64Url,
        photoVerified: true,
        photoSource: 'ไฟล์อัปโหลดจากผู้ดูแลระบบ',
      });

      return NextResponse.json({
        success: true,
        url: base64Url,
        message: 'อัปโหลดและผูกรูปถ่ายจริงของผู้บริหารสำเร็จ',
      });
    }

    // Case 2: Bulk upload / Name matching
    const { data: allExecutives } = await getExecutives({ limit: 1000 });

    for (const file of allFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
      const originalName = file.name;
      const baseNameWithoutExt = originalName.replace(/\.[^/.]+$/, '').toLowerCase();

      // Find matching executive
      const matchedExec = allExecutives.find((e: any) => {
        const fn = e.firstName.toLowerCase().trim();
        const ln = e.lastName.toLowerCase().trim();
        return (
          (fn && baseNameWithoutExt.includes(fn)) ||
          (ln && baseNameWithoutExt.includes(ln)) ||
          baseNameWithoutExt.includes(e.id)
        );
      });

      if (matchedExec) {
        await updateExecutiveRecord(matchedExec.id, {
          avatarUrl: base64Url,
          photoVerified: true,
          photoSource: 'ไฟล์อัปโหลดชุดหลายคน (Bulk Upload)',
        });

        results.push({
          fileName: originalName,
          matched: true,
          executive: `${matchedExec.prefix || ''}${matchedExec.firstName} ${matchedExec.lastName}`,
          url: base64Url,
        });
      } else {
        results.push({
          fileName: originalName,
          matched: false,
          url: base64Url,
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
