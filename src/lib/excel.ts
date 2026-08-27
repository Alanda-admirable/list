import * as XLSX from 'xlsx';

export interface ExcelExecutiveRow {
  'รหัสหน่วยงาน (ถ้ามี)'?: string;
  'ชื่อหน่วยงาน/สังกัด'?: string;
  'ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)'?: string;
  'ประเภทหน่วยงาน'?: string;
  'จังหวัด'?: string;
  'อำเภอ'?: string;
  'คำนำหน้านาม'?: string;
  'ชื่อ'?: string;
  'นามสกุล'?: string;
  'ตำแหน่ง'?: string;
  'ระดับตำแหน่ง/ซี'?: string;
  'สถานะ (ACTIVE/ACTING/VACANT/RETIRED)'?: string;
  'วันที่แต่งตั้ง (YYYY-MM-DD)'?: string;
  'เลขที่คำสั่งแต่งตั้ง'?: string;
  'เบอร์โทรศัพท์'?: string;
  'อีเมล'?: string;
  'URL รูปภาพ'?: string;
  'ประวัติย่อ/นโยบาย'?: string;
}

export function generateTemplateBuffer(): Buffer {
  const sampleData: ExcelExecutiveRow[] = [
    {
      'ชื่อหน่วยงาน/สังกัด': 'สำนักนายกรัฐมนตรี',
      'ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)': 'CENTRAL',
      'ประเภทหน่วยงาน': 'สำนักนายกรัฐมนตรี',
      'จังหวัด': 'กรุงเทพมหานคร',
      'อำเภอ': 'ดุสิต',
      'คำนำหน้านาม': 'นางสาว',
      'ชื่อ': 'แพทองธาร',
      'นามสกุล': 'ชินวัตร',
      'ตำแหน่ง': 'นายกรัฐมนตรี',
      'ระดับตำแหน่ง/ซี': 'ข้าราชการการเมือง',
      'สถานะ (ACTIVE/ACTING/VACANT/RETIRED)': 'ACTIVE',
      'วันที่แต่งตั้ง (YYYY-MM-DD)': '2024-08-16',
      'เลขที่คำสั่งแต่งตั้ง': 'พระบรมราชโองการโปรดเกล้าฯ แต่งตั้งนายกรัฐมนตรี',
      'เบอร์โทรศัพท์': '02-280-9000',
      'อีเมล': 'prime_minister@opm.go.th',
      'URL รูปภาพ': '',
      'ประวัติย่อ/นโยบาย': 'นายกรัฐมนตรีไทยคนที่ 31',
    },
    {
      'ชื่อหน่วยงาน/สังกัด': 'จังหวัดเชียงใหม่',
      'ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)': 'PROVINCIAL',
      'ประเภทหน่วยงาน': 'จังหวัด',
      'จังหวัด': 'เชียงใหม่',
      'อำเภอ': 'เมืองเชียงใหม่',
      'คำนำหน้านาม': 'นาย',
      'ชื่อ': 'นิรัตน์',
      'นามสกุล': 'พงษ์สิทธิถาวร',
      'ตำแหน่ง': 'ผู้ว่าราชการจังหวัดเชียงใหม่',
      'ระดับตำแหน่ง/ซี': 'นักบริหารระดับสูง (ซี 10)',
      'สถานะ (ACTIVE/ACTING/VACANT/RETIRED)': 'ACTIVE',
      'วันที่แต่งตั้ง (YYYY-MM-DD)': '2022-10-01',
      'เลขที่คำสั่งแต่งตั้ง': 'คำสั่งกระทรวงมหาดไทย ที่ 650/2565',
      'เบอร์โทรศัพท์': '053-112-700',
      'อีเมล': 'governor@chiangmai.go.th',
      'URL รูปภาพ': '',
      'ประวัติย่อ/นโยบาย': 'ขับเคลื่อนการพัฒนาจังหวัดเชียงใหม่',
    },
    {
      'ชื่อหน่วยงาน/สังกัด': 'ที่ว่าการอำเภอเมืองเชียงใหม่',
      'ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)': 'DISTRICT',
      'ประเภทหน่วยงาน': 'อำเภอ',
      'จังหวัด': 'เชียงใหม่',
      'อำเภอ': 'เมืองเชียงใหม่',
      'คำนำหน้านาม': 'นาย',
      'ชื่อ': 'ดนัย',
      'นามสกุล': 'สุริยวรรณ',
      'ตำแหน่ง': 'นายอำเภอเมืองเชียงใหม่',
      'ระดับตำแหน่ง/ซี': 'ผู้อำนวยการระดับสูง (ซี 9)',
      'สถานะ (ACTIVE/ACTING/VACANT/RETIRED)': 'ACTIVE',
      'วันที่แต่งตั้ง (YYYY-MM-DD)': '2023-01-15',
      'เลขที่คำสั่งแต่งตั้ง': 'คำสั่งกรมการปกครอง ที่ 45/2566',
      'เบอร์โทรศัพท์': '053-221-016',
      'อีเมล': 'dopa5001@dopa.go.th',
      'URL รูปภาพ': '',
      'ประวัติย่อ/นโยบาย': 'บริหารราชการอำเภอเมืองเชียงใหม่',
    },
    {
      'ชื่อหน่วยงาน/สังกัด': 'องค์การบริหารส่วนจังหวัดเชียงใหม่',
      'ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)': 'LOCAL',
      'ประเภทหน่วยงาน': 'อบจ.',
      'จังหวัด': 'เชียงใหม่',
      'อำเภอ': 'เมืองเชียงใหม่',
      'คำนำหน้านาม': 'นาย',
      'ชื่อ': 'พิชัย',
      'นามสกุล': 'เลิศพงศ์อดิศร',
      'ตำแหน่ง': 'นายกองค์การบริหารส่วนจังหวัดเชียงใหม่',
      'ระดับตำแหน่ง/ซี': 'ผู้บริหารท้องถิ่น',
      'สถานะ (ACTIVE/ACTING/VACANT/RETIRED)': 'ACTIVE',
      'วันที่แต่งตั้ง (YYYY-MM-DD)': '2020-12-20',
      'เลขที่คำสั่งแต่งตั้ง': 'ประกาศ กกต.',
      'เบอร์โทรศัพท์': '053-998-333',
      'อีเมล': 'president@chiangmaipao.go.th',
      'URL รูปภาพ': '',
      'ประวัติย่อ/นโยบาย': 'ขับเคลื่อนโครงสร้างพื้นฐานและคุณภาพชีวิต อบจ.เชียงใหม่',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ทำเนียบผู้บริหาร');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export interface ExportableExecutive {
  prefix?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  positionLevel?: string | null;
  organization?: {
    name?: string | null;
    level?: string | null;
    category?: string | null;
    province?: string | null;
    district?: string | null;
  } | null;
  status?: string | null;
  appointmentDate?: Date | string | null;
  orderReference?: string | null;
  phone?: string | null;
  email?: string | null;
  updatedAt?: Date | string | null;
}

export function exportExecutivesToExcel(executives: ExportableExecutive[]): Buffer {
  const rows = executives.map((e, idx) => ({
    'ลำดับ': idx + 1,
    'คำนำหน้านาม': e.prefix || '',
    'ชื่อ': e.firstName || '',
    'นามสกุล': e.lastName || '',
    'ตำแหน่ง': e.position || '',
    'ระดับตำแหน่ง': e.positionLevel || '',
    'สังกัดหน่วยงาน': e.organization?.name || '',
    'ระดับการบริหาร': e.organization?.level === 'CENTRAL' ? 'ส่วนราชการ' : e.organization?.level === 'PROVINCIAL' ? 'ส่วนภูมิภาค' : e.organization?.level === 'DISTRICT' ? 'ระดับอำเภอ' : 'ท้องถิ่น',
    'ประเภทหน่วยงาน': e.organization?.category || '',
    'จังหวัด': e.organization?.province || '',
    'อำเภอ': e.organization?.district || '',
    'สถานะ': e.status === 'ACTIVE' ? 'ปฏิบัติราชการ' : e.status === 'ACTING' ? 'รักษาราชการแทน' : e.status === 'VACANT' ? 'ตำแหน่งว่าง' : 'พ้นตำแหน่ง',
    'วันที่ได้รับการแต่งตั้ง': e.appointmentDate ? new Date(e.appointmentDate).toISOString().split('T')[0] : '',
    'เลขที่คำสั่งแต่งตั้ง': e.orderReference || '',
    'เบอร์โทรศัพท์': e.phone || '',
    'อีเมล': e.email || '',
    'อัปเดตล่าสุด': e.updatedAt ? new Date(e.updatedAt).toLocaleString('th-TH') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ทำเนียบรายชื่อผู้บริหาร');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function parseExcelBuffer(buffer: Buffer): ExcelExecutiveRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<ExcelExecutiveRow>(ws);
}
