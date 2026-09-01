import { NextRequest, NextResponse } from 'next/server';
import { getExecutiveById, updateExecutiveRecord } from '@/lib/data-service';
import { uploadAvatarToSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
      const trimmedUrl = imageUrl.trim();
      finalPublicUrl = trimmedUrl;

      // Try downloading and storing into Supabase Public Storage
      if (isSupabaseConfigured && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
        try {
          const res = await fetch(trimmedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          });
          if (res.ok) {
            const arrayBuf = await res.arrayBuffer();
            const mimeType = res.headers.get('content-type') || 'image/jpeg';
            const uploadRes = await uploadAvatarToSupabase(
              Buffer.from(arrayBuf),
              `exec_${executiveId}.jpg`,
              mimeType
            );
            if (uploadRes.success && uploadRes.url) {
              finalPublicUrl = uploadRes.url;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not mirror remote image to Supabase, keeping original URL:', fetchErr);
        }
      }
    } else if (base64Data) {
      finalPublicUrl = base64Data;
      if (isSupabaseConfigured && base64Data.startsWith('data:')) {
        try {
          const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const uploadRes = await uploadAvatarToSupabase(
              buffer,
              `exec_${executiveId}.jpg`,
              mimeType
            );
            if (uploadRes.success && uploadRes.url) {
              finalPublicUrl = uploadRes.url;
            }
          }
        } catch (b64Err) {
          console.warn('Could not upload base64 to Supabase:', b64Err);
        }
      }
    } else {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ imageUrl หรือ base64Data' }, { status: 400 });
    }

    // Update record
    const updated = await updateExecutiveRecord(executiveId, {
      avatarUrl: finalPublicUrl,
      photoVerified: true,
      photoSource: finalPublicUrl.includes('supabase.co') ? 'Supabase Public Storage' : 'Google Images / Web',
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
