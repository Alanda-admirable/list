import { NextRequest, NextResponse } from 'next/server';
import { getExecutives, updateExecutiveRecord } from '@/lib/data-service';
import { uploadAvatarToSupabase, isSupabaseConfigured } from '@/lib/supabase';

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

    // Helper to process single image file to public URL or fallback base64
    async function processImageFile(file: File): Promise<{ url: string; isCloudStorage: boolean }> {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';

      if (isSupabaseConfigured) {
        const uploadRes = await uploadAvatarToSupabase(buffer, file.name, mimeType);
        if (uploadRes.success && uploadRes.url) {
          return { url: uploadRes.url, isCloudStorage: true };
        }
      }

      // Fallback to Base64 Data URL if Supabase is not yet configured or failed
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return { url: base64Url, isCloudStorage: false };
    }

    // Case 1: Single file targeting specific executiveId
    if (executiveId && allFiles.length === 1) {
      const file = allFiles[0];
      const { url, isCloudStorage } = await processImageFile(file);

      await updateExecutiveRecord(executiveId, {
        avatarUrl: url,
        photoVerified: true,
        photoSource: isCloudStorage ? 'Supabase Public Storage' : 'ไฟล์อัปโหลดจากผู้ดูแลระบบ',
      });

      return NextResponse.json({
        success: true,
        url,
        storage: isCloudStorage ? 'supabase' : 'local',
        message: isCloudStorage
          ? 'อัปโหลดภาพขึ้น Supabase Public Storage และบันทึกเรียบร้อย'
          : 'อัปโหลดและผูกรูปถ่ายจริงของผู้บริหารสำเร็จ',
      });
    }

    // Case 2: Bulk upload / Name matching
    const { data: allExecutives } = await getExecutives({ limit: 1000 });

    for (const file of allFiles) {
      const { url, isCloudStorage } = await processImageFile(file);
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
          avatarUrl: url,
          photoVerified: true,
          photoSource: isCloudStorage ? 'Supabase Public Storage (Bulk)' : 'ไฟล์อัปโหลดชุดหลายคน (Bulk Upload)',
        });

        results.push({
          fileName: originalName,
          matched: true,
          executive: `${matchedExec.prefix || ''}${matchedExec.firstName} ${matchedExec.lastName}`,
          url,
          storage: isCloudStorage ? 'supabase' : 'local',
        });
      } else {
        results.push({
          fileName: originalName,
          matched: false,
          url,
          storage: isCloudStorage ? 'supabase' : 'local',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      matchedCount: results.filter((r) => r.matched).length,
      totalCount: results.length,
      isSupabaseActive: isSupabaseConfigured,
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
