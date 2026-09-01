import { NextRequest, NextResponse } from 'next/server';
import {
  getExecutives,
  getOrganizations,
  createOrganizationRecord,
  createExecutiveRecord,
  updateExecutiveRecord,
} from '@/lib/data-service';
import {
  generateTemplateBuffer,
  exportExecutivesToExcel,
  exportExecutivesToCsv,
  parseExcelBuffer,
  ExcelExecutiveRow,
} from '@/lib/excel';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'export';
    const format = searchParams.get('format') || 'xlsx';

    if (type === 'template') {
      const buffer = generateTemplateBuffer();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="thai_gov_executives_template.xlsx"',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // Export with filters from Edge DataService
    const level = searchParams.get('level');
    const province = searchParams.get('province');
    const status = searchParams.get('status');

    const execsResult = await getExecutives({ limit: 5000 });
    let executives = execsResult.data;
    if (level && level !== 'ALL') {
      executives = executives.filter((e) => e.organization?.level === level);
    }
    if (province) {
      executives = executives.filter((e) => e.organization?.province === province);
    }
    if (status) {
      executives = executives.filter((e) => e.status === status);
    }

    const timestamp = new Date().toISOString().split('T')[0];

    // CSV format with UTF-8 BOM
    if (format === 'csv') {
      const csvContent = exportExecutivesToCsv(executives);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="thai_gov_directory_${timestamp}.csv"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // Default: Excel .xlsx format
    const buffer = exportExecutivesToExcel(executives);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="thai_gov_directory_${timestamp}.xlsx"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export Failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'กรุณาอัปโหลดไฟล์ Excel' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rows = parseExcelBuffer(buffer) as ExcelExecutiveRow[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลในไฟล์ Excel ที่อัปโหลด' }, { status: 400 });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: { row: number; reason: string }[] = [];

    const existingOrgs = await getOrganizations();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // header is row 1

      const orgName = (row['ชื่อหน่วยงาน/สังกัด'] || '').trim();
      const firstName = (row['ชื่อ'] || '').trim();
      const lastName = (row['นามสกุล'] || '').trim();
      const position = (row['ตำแหน่ง'] || '').trim();
      const prefix = (row['คำนำหน้านาม'] || 'นาย').trim();
      const level = (row['ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)'] || 'CENTRAL').trim().toUpperCase();
      const category = (row['ประเภทหน่วยงาน'] || 'ส่วนราชการ').trim();
      const province = row['จังหวัด'] ? row['จังหวัด'].trim() : null;
      const district = row['อำเภอ'] ? row['อำเภอ'].trim() : null;
      const positionLevel = row['ระดับตำแหน่ง/ซี'] ? row['ระดับตำแหน่ง/ซี'].trim() : null;
      const status = (row['สถานะ (ACTIVE/ACTING/VACANT/RETIRED)'] || 'ACTIVE').trim().toUpperCase();
      const orderReference = row['เลขที่คำสั่งแต่งตั้ง'] ? row['เลขที่คำสั่งแต่งตั้ง'].trim() : null;
      const phone = row['เบอร์โทรศัพท์'] ? String(row['เบอร์โทรศัพท์']).trim() : null;
      const email = row['อีเมล'] ? String(row['อีเมล']).trim() : null;
      const avatarUrl = row['URL รูปภาพ'] ? String(row['URL รูปภาพ']).trim() : null;
      const bio = row['ประวัติย่อ/นโยบาย'] ? String(row['ประวัติย่อ/นโยบาย']).trim() : null;

      let appointmentDate: string | null = null;
      if (row['วันที่แต่งตั้ง (YYYY-MM-DD)']) {
        const parsed = new Date(row['วันที่แต่งตั้ง (YYYY-MM-DD)']);
        if (!isNaN(parsed.getTime())) appointmentDate = parsed.toISOString();
      }

      if (!orgName || !firstName || !position) {
        failedCount++;
        errors.push({ row: rowNum, reason: 'ขาดข้อมูลจำเป็น (ชื่อหน่วยงาน, ชื่อ, หรือตำแหน่ง)' });
        continue;
      }

      // Find or create organization
      let org: any = existingOrgs.find((o) => o.name.toLowerCase() === orgName.toLowerCase());

      if (!org) {
        org = await createOrganizationRecord({
          name: orgName,
          level: ['CENTRAL', 'PROVINCIAL', 'DISTRICT', 'LOCAL'].includes(level) ? level : 'CENTRAL',
          category,
          province,
          district,
          code: `ORG-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });
        existingOrgs.push(org as any);
      }

      // Check if executive exists
      const allExecs = await getExecutives({ limit: 5000, organizationId: org.id });
      const existingExec = allExecs.data.find(
        (e) => e.firstName.toLowerCase() === firstName.toLowerCase() && e.lastName?.toLowerCase() === lastName.toLowerCase()
      );

      if (existingExec) {
        await updateExecutiveRecord(existingExec.id, {
          prefix,
          position,
          positionLevel,
          status: ['ACTIVE', 'ACTING', 'VACANT', 'RETIRED'].includes(status) ? status : 'ACTIVE',
          appointmentDate: appointmentDate || existingExec.appointmentDate,
          orderReference: orderReference || existingExec.orderReference,
          phone: phone || existingExec.phone,
          email: email || existingExec.email,
          avatarUrl: avatarUrl || existingExec.avatarUrl,
          bio: bio || existingExec.bio,
        });
      } else {
        await createExecutiveRecord({
          prefix,
          firstName,
          lastName,
          position,
          positionLevel,
          organizationId: org.id,
          status: ['ACTIVE', 'ACTING', 'VACANT', 'RETIRED'].includes(status) ? status : 'ACTIVE',
          appointmentDate,
          orderReference,
          phone,
          email,
          avatarUrl,
          bio,
        });
      }

      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลสำเร็จ ${successCount} รายการ ${failedCount > 0 ? `(ผิดพลาด ${failedCount} รายการ)` : ''}`,
      totalProcessed: rows.length,
      successCount,
      failedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import Failed' },
      { status: 500 }
    );
  }
}
