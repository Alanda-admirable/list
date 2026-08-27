const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// Load extracted pages JSON
const rawPages = JSON.parse(fs.readFileSync('extracted_pathum.json', 'utf8'));

const PREFIXES = [
  'ร้อยตำรวจเอก ดร.', 'ร.ต.อ. ดร.', 'พ.ต.อ. ดร.', 'พล.ต.อ. ดร.', 'พล.ต.ท. ดร.',
  'นายแพทย์', 'แพทย์หญิง', 'ทันตแพทย์', 'ทันตแพทย์หญิง', 'เภสัชกร', 'เภสัชกรหญิง',
  'พลตำรวจเอก', 'พลตำรวจโท', 'พลตำรวจตรี', 'พันตำรวจเอก', 'พันตำรวจโท', 'พันตำรวจตรี', 'ร้อยตำรวจเอก', 'ร้อยตำรวจโท', 'ร้อยตำรวจตรี',
  'พล.ต.อ.', 'พล.ต.ท.', 'พล.ต.ต.', 'พ.ต.อ.', 'พ.ต.ท.', 'พ.ต.ต.', 'ร.ต.อ.', 'ร.ต.ท.', 'ร.ต.ต.',
  'พลเอก', 'พลโท', 'พลตรี', 'พันเอก', 'พันโท', 'พันตรี', 'ร้อยเอก', 'ร้อยโท', 'ร้อยตรี', 'ว่าที่ร้อยตรี', 'ว่าที่ ร.ต.', 'ว่าที่ร้อยตำรวจตรี',
  'พ.อ.', 'พ.ท.', 'พ.ต.', 'ร.อ.', 'ร.ท.', 'ร.ต.',
  'ดร.', 'ศาสตราจารย์', 'รองศาสตราจารย์', 'ผู้ช่วยศาสตราจารย์',
  'นางสาว', 'นาง', 'นาย'
];

function normalizeThai(text) {
  if (!text) return '';
  let t = text;
  t = t.replace(/\u0e4d\u0e32/g, '\u0e33'); // sara am
  t = t.replace(/\s+/g, ' ');
  t = t.replace(/ที/g, 'ที่').replace(/ชัน/g, 'ชั้น').replace(/เพือ/g, 'เพื่อ').replace(/เนือง/g, 'เนื่อง');
  t = t.replace(/ตั ง/g, 'ตั้ง').replace(/ตัง/g, 'ตั้ง').replace(/ป ้ องกัน/g, 'ป้องกัน').replace(/ป ิน/g, 'ปิ่น');
  t = t.replace(/ฟ ืนฟู/g, 'ฟื้นฟู').replace(/เลี ยง/g, 'เลี้ยง').replace(/นํ า/g, 'น้ำ').replace(/นํา/g, 'นำ');
  t = t.replace(/เฟ ือง/g, 'เฟื่อง').replace(/เอียม/g, 'เอี่ยม').replace(/มิง/g, 'มิ่ง');
  t = t.replace(/ขัยสุริยา/g, 'ชัยสุริยา').replace(/ฝ ่ าย/g, 'ฝ่าย');
  t = t.replace(/ว่าที ร.ต./g, 'ว่าที่ ร.ต.').replace(/ว่าทีร้อยตรี/g, 'ว่าที่ร้อยตรี');
  t = t.replace(/สนันรักษ์/g, 'สนั่นรักษ์').replace(/บึงยีโถ/g, 'บึงยี่โถ');
  t = t.replace(/ทองสีมัน/g, 'ทองสีมันต์').replace(/เกื อกูล/g, 'เกื้อกูล');
  t = t.replace(/พงษ์สวัสดิ /g, 'พงษ์สวัสดิ์ ').replace(/หาญสวัสดิ /g, 'หาญสวัสดิ์ ');
  t = t.replace(/สมศักดิ /g, 'สมศักดิ์ ').replace(/วิระศักดิ /g, 'วิระศักดิ์ ');
  t = t.replace(/คํารณวิทย์/g, 'คำรณวิทย์').replace(/ตรีลุพธ์/g, 'ตรีลุพธ์');
  t = t.replace(/รัศมิ/g, 'รัศมิ์').replace(/รังสิวัฒนศักดิ/g, 'รังสิวัฒนศักดิ์');
  t = t.replace(/ภู่สมบุญ/g, 'ภู่สมบุญ').replace(/อึ งอัมพรวิไล/g, 'อึ้งอัมพรวิไล');
  t = t.replace(/กิตติศักดิ /g, 'กิตติศักดิ์ ').replace(/ศักดิดา/g, 'ศักดา').replace(/กองสัมฤทธิ /g, 'กองสัมฤทธิ์ ');
  t = t.replace(/เจริญกัลป ์/g, 'เจริญกัลป์').replace(/วันสิริภักดิ /g, 'วันสิริภักดิ์ ');
  t = t.replace(/กุลศักดิ /g, 'กุลศักดิ์ ');
  t = t.replace(/บางเดือ/g, 'บางเดื่อ').replace(/สว่างเถือน/g, 'สว่างเถื่อน').replace(/เกรียงศักดิ/g, 'เกรียงศักดิ์').replace(/เณรเถือน/g, 'เณรเถื่อน');
  t = t.replace(/พึงความสุข/g, 'พึ่งความสุข').replace(/พึงพูลผล/g, 'พึ่งพูลผล');
  t = t.replace(/เกาะโพธิ/g, 'เกาะโพธิ์');
  t = t.replace(/เจริญนนทสิทธิ/g, 'เจริญนนทสิทธิ์');
  t = t.replace(/คํารณ/g, 'คำรณ');
  return t.trim();
}

function parseNameAndPhone(line) {
  const norm = normalizeThai(line);
  const phoneMatch = norm.match(/(?:0[-\s]?\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4}|0[689]\d[-\s]?\d{3,4}[-\s]?\d{4}|Hotline\s*\d+)/);
  let nameStr = norm;
  let phoneStr = '';
  if (phoneMatch) {
    nameStr = norm.substring(0, phoneMatch.index).trim();
    phoneStr = norm.substring(phoneMatch.index).trim();
  }

  let prefix = '';
  for (const p of PREFIXES) {
    if (nameStr.startsWith(p)) {
      prefix = p;
      nameStr = nameStr.substring(p.length).trim();
      break;
    }
  }

  nameStr = nameStr.replace(/[\(\)\d\-\,\/\:\.]/g, '').trim();
  const parts = nameStr.split(/\s+/).filter(Boolean);
  let firstName = '';
  let lastName = '';
  if (parts.length >= 2) {
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  } else if (parts.length === 1) {
    firstName = parts[0];
  }

  return { prefix: prefix || 'นาย', firstName, lastName, phone: phoneStr };
}

function classifyRecord(pos, pageNo) {
  let level = 'PROVINCIAL';
  let category = 'ส่วนราชการประจำจังหวัด';
  let district = 'เมืองปทุมธานี';
  let orgName = 'สำนักงานจังหวัดปทุมธานี';
  let posLevel = 'นักบริหารระดับสูง';
  let address = 'ศาลากลางจังหวัดปทุมธานี ถนนปทุมธานีเฉลิมพระเกียรติ ตำบลบางปรอก อำเภอเมืองปทุมธานี 12000';

  // 1. Provincial Leaders
  if (pos.includes('ผู้ว่าราชการจังหวัด')) {
    orgName = 'จังหวัดปทุมธานี (ศาลากลางจังหวัดปทุมธานี)';
    level = 'PROVINCIAL';
    category = 'จังหวัด';
    posLevel = 'นักบริหารระดับสูง (ซี 10)';
  } else if (pos.includes('รองผู้ว่าราชการจังหวัด')) {
    orgName = 'จังหวัดปทุมธานี (ศาลากลางจังหวัดปทุมธานี)';
    level = 'PROVINCIAL';
    category = 'จังหวัด';
    posLevel = 'นักบริหารระดับต้น (ซี 9)';
  } else if (pos.includes('กอ.รมน.') || pos.includes('รอง ผอ.รมน.')) {
    orgName = 'กองอำนวยการรักษาความมั่นคงภายในจังหวัดปทุมธานี (กอ.รมน.จว.ปท.)';
    level = 'PROVINCIAL';
    category = 'ส่วนราชการประจำจังหวัด';
    posLevel = 'นายทหารสัญญาบัตรระดับสูง';
  } else if (pos.includes('เหล่ากาชาด')) {
    orgName = 'เหล่ากาชาดจังหวัดปทุมธานี';
    level = 'PROVINCIAL';
    category = 'ส่วนราชการประจำจังหวัด';
    address = 'ถนนเทศปทุม ตำบลบางปรอก อำเภอเมืองปทุมธานี 12000';
  } else if (pos.includes('ปลัดจังหวัด')) {
    orgName = 'ที่ทำการปกครองจังหวัดปทุมธานี';
    level = 'PROVINCIAL';
    category = 'ที่ทำการปกครองจังหวัด';
    posLevel = 'นักบริหารระดับสูง (ซี 9)';
  } else if (pos.includes('สํานักงานจังหวัด') || pos.includes('สำนักงานจังหวัด') || pos.includes('หัวหน้าสํานักงานจังหวัด') || pos.includes('ผอ.กลุ่มงาน') || pos.includes('จ่าจังหวัด') || pos.includes('เสมียนตรา')) {
    orgName = 'สำนักงานจังหวัดปทุมธานี';
    level = 'PROVINCIAL';
    category = 'สำนักงานจังหวัด';
    posLevel = 'ผู้อำนวยการระดับสูง';
  } 
  
  // 2. District Level
  else if (pos.includes('นายอำเภอ') || pos.includes('นายอําเภอ')) {
    level = 'DISTRICT';
    category = 'อำเภอ';
    posLevel = 'ผู้อำนวยการระดับสูง (ซี 9)';
    if (pos.includes('เมือง')) {
      orgName = 'ที่ว่าการอำเภอเมืองปทุมธานี';
      district = 'เมืองปทุมธานี';
      address = 'ถนนเทศปทุม ตำบลบางปรอก อำเภอเมืองปทุมธานี 12000';
    } else if (pos.includes('คลองหลวง')) {
      orgName = 'ที่ว่าการอำเภอคลองหลวง';
      district = 'คลองหลวง';
      address = 'ถนนพหลโยธิน ตำบลคลองสอง อำเภอคลองหลวง ปทุมธานี 12120';
    } else if (pos.includes('ธัญบุรี')) {
      orgName = 'ที่ว่าการอำเภอธัญบุรี';
      district = 'ธัญบุรี';
      address = 'ถนนรังสิต-นครนายก ตำบลรังสิต อำเภอธัญบุรี ปทุมธานี 12110';
    } else if (pos.includes('หนองเสือ')) {
      orgName = 'ที่ว่าการอำเภอหนองเสือ';
      district = 'หนองเสือ';
      address = 'ตำบลบึงบา อำเภอหนองเสือ ปทุมธานี 12170';
    } else if (pos.includes('ลาดหลุมแก้ว')) {
      orgName = 'ที่ว่าการอำเภอลาดหลุมแก้ว';
      district = 'ลาดหลุมแก้ว';
      address = 'ตำบลระแหง อำเภอลาดหลุมแก้ว ปทุมธานี 12140';
    } else if (pos.includes('ลำลูกกา') || pos.includes('ลําลูกกา')) {
      orgName = 'ที่ว่าการอำเภอลำลูกกา';
      district = 'ลำลูกกา';
      address = 'ตำบลลำลูกกา อำเภอลำลูกกา ปทุมธานี 12150';
    } else if (pos.includes('สามโคก')) {
      orgName = 'ที่ว่าการอำเภอสามโคก';
      district = 'สามโคก';
      address = 'ตำบลบางเตย อำเภอสามโคก ปทุมธานี 12160';
    } else {
      orgName = `ที่ว่าการ${pos}`;
    }
  } else if (pos.includes('ปลัดอำเภอ') || pos.includes('เกษตรอำเภอ') || pos.includes('สาธารณสุขอำเภอ') || pos.includes('พัฒนาการอำเภอ') || pos.includes('สัสดีอำเภอ') || pos.includes('ท้องถิ่นอำเภอ')) {
    level = 'DISTRICT';
    category = 'ส่วนราชการประจำอำเภอ';
    posLevel = 'ชำนาญการพิเศษ / อำนวยการระดับต้น';
    if (pos.includes('เมือง')) district = 'เมืองปทุมธานี', orgName = 'ที่ว่าการอำเภอเมืองปทุมธานี';
    else if (pos.includes('คลองหลวง')) district = 'คลองหลวง', orgName = 'ที่ว่าการอำเภอคลองหลวง';
    else if (pos.includes('ธัญบุรี')) district = 'ธัญบุรี', orgName = 'ที่ว่าการอำเภอธัญบุรี';
    else if (pos.includes('หนองเสือ')) district = 'หนองเสือ', orgName = 'ที่ว่าการอำเภอหนองเสือ';
    else if (pos.includes('ลาดหลุมแก้ว')) district = 'ลาดหลุมแก้ว', orgName = 'ที่ว่าการอำเภอลาดหลุมแก้ว';
    else if (pos.includes('ลำลูกกา') || pos.includes('ลําลูกกา')) district = 'ลำลูกกา', orgName = 'ที่ว่าการอำเภอลำลูกกา';
    else if (pos.includes('สามโคก')) district = 'สามโคก', orgName = 'ที่ว่าการอำเภอสามโคก';
    else orgName = 'ส่วนราชการประจำอำเภอ (ปทุมธานี)';
  }

  // 3. Local Administration (อบจ., เทศบาล, อบต.)
  else if (pos.includes('องค์การบริหารส่วนจังหวัด') || pos.includes('อบจ.')) {
    level = 'LOCAL';
    category = 'อบจ.';
    orgName = 'องค์การบริหารส่วนจังหวัดปทุมธานี (อบจ.ปทุมธานี)';
    district = 'เมืองปทุมธานี';
    posLevel = 'ผู้บริหารท้องถิ่น (นายก อบจ.)';
    address = 'เลขที่ 99 หมู่ 2 ถนนปทุมธานี-สายใน ตำบลบางขะแยง อำเภอเมืองปทุมธานี 12000';
  } else if (pos.includes('เทศบาลนคร') || pos.includes('เทศมนตรีนคร')) {
    level = 'LOCAL';
    category = 'เทศบาลนคร';
    orgName = 'เทศบาลนครรังสิต';
    district = 'ธัญบุรี';
    posLevel = 'ผู้บริหารท้องถิ่น (นายกเทศมนตรีนคร)';
    address = 'เลขที่ 151 ถนนปทุมธานี-รังสิต ตำบลประชาธิปัตย์ อำเภอธัญบุรี 12130';
  } else if (pos.includes('เทศบาลเมือง') || pos.includes('เทศมนตรีเมือง')) {
    level = 'LOCAL';
    category = 'เทศบาลเมือง';
    posLevel = 'ผู้บริหารท้องถิ่น (นายกเทศมนตรีเมือง)';
    const m = pos.match(/(?:เทศบาลเมือง|เทศมนตรีเมือง)(.+)/);
    const nameT = m ? m[1].trim() : pos;
    orgName = `เทศบาลเมือง${nameT}`;
    if (nameT.includes('ท่าโขลง') || nameT.includes('คลองหลวง')) district = 'คลองหลวง';
    else if (nameT.includes('สนั่นรักษ์') || nameT.includes('บึงยี่โถ')) district = 'ธัญบุรี';
    else if (nameT.includes('คูคต') || nameT.includes('ลำสามแก้ว') || nameT.includes('ลาดสวาย')) district = 'ลำลูกกา';
    else if (nameT.includes('บางคูวัด') || nameT.includes('บางกะดี') || nameT.includes('ปทุมธานี')) district = 'เมืองปทุมธานี';
  } else if (pos.includes('เทศบาลตำบล') || pos.includes('เทศมนตรีตำบล') || pos.includes('เทศบาลตําบล') || pos.includes('เทศมนตรีตําบล')) {
    level = 'LOCAL';
    category = 'เทศบาลตำบล';
    posLevel = 'ผู้บริหารท้องถิ่น (นายกเทศมนตรีตำบล)';
    const m = pos.match(/(?:เทศบาลตำบล|เทศมนตรีตำบล|เทศบาลตําบล|เทศมนตรีตําบล)(.+)/);
    const nameT = m ? m[1].trim() : pos;
    orgName = `เทศบาลตำบล${nameT}`;
    if (nameT.includes('ธัญบุรี')) district = 'ธัญบุรี';
    else if (nameT.includes('ลำลูกกา') || nameT.includes('ลำไทร') || nameT.includes('ลําลูกกา') || nameT.includes('ลําไทร')) district = 'ลำลูกกา';
    else if (nameT.includes('หนองเสือ') || nameT.includes('หนองสามวัง')) district = 'หนองเสือ';
    else if (nameT.includes('ระแหง') || nameT.includes('คลองพระอุดม') || nameT.includes('คูขวาง')) district = 'ลาดหลุมแก้ว';
    else if (nameT.includes('สามโคก') || nameT.includes('บางเตย')) district = 'สามโคก';
    else district = 'เมืองปทุมธานี';
  } else if (pos.includes('อบต.') || pos.includes('องค์การบริหารส่วนตำบล') || pos.includes('องค์การบริหารส่วนตําบล')) {
    level = 'LOCAL';
    category = 'อบต.';
    posLevel = 'ผู้บริหารท้องถิ่น (นายก อบต.)';
    const m = pos.match(/(?:นายก\s*อบต\.|นายก\s*องค์การบริหารส่วนตำบล|นายก\s*องค์การบริหารส่วนตําบล|อบต\.|องค์การบริหารส่วนตำบล|องค์การบริหารส่วนตําบล)(.+)/);
    const nameT = m ? m[1].trim() : pos;
    orgName = `องค์การบริหารส่วนตำบล${nameT}`;
    if (/คลองสาม|คลองสี่|คลองสี|คลองห้า|คลองหก|คลองเจ็ด/.test(nameT)) district = 'คลองหลวง';
    else if (/บึงคำพร้อย|บึงคําพร้อย|บึงทองหลาง|บึงคอไห|ลำลูกกา|ลําลูกกา|พืชอุดม|ลำไทร|ลําไทร/.test(nameT)) district = 'ลำลูกกา';
    else if (/กระแชง|ท้ายเกาะ|เชียงรากน้อย|บางโพธิ์เหนือ|บางโพธิเหนือ|คลองควาย|บ้านงิ้ว|บ้านงิ ว|บางกระบือ/.test(nameT)) district = 'สามโคก';
    else if (/ระแหง|คูบางหลวง|หน้าไม้|ลาดหลุมแก้ว|บ่อเงิน/.test(nameT)) district = 'ลาดหลุมแก้ว';
    else if (/บึงบอน|บึงบา|บึงชำอ้อ|บึงชําอ้อ|บึงกาสาม|ศาลาครุ|นพรัตน์/.test(nameT)) district = 'หนองเสือ';
    else district = 'เมืองปทุมธานี';
  }

  // 4. Police (สภ.)
  else if (pos.includes('สถานีตำรวจภูธร') || pos.includes('สถานีตํารวจภูธร') || pos.includes('สภ.') || pos.includes('ผู้กำกับการ') || pos.includes('ผู้กํากับการ')) {
    level = 'PROVINCIAL';
    category = 'สถานีตำรวจ';
    posLevel = 'ข้าราชการตำรวจระดับสูง';
    const m = pos.match(/(?:สถานีตำรวจภูธร|สถานีตํารวจภูธร|สภ\.)(.+)/);
    if (m) {
      orgName = `สถานีตำรวจภูธร${m[1].trim()}`;
    } else {
      const cleanP = pos.replace(/ผู้กำกับการ|ผู้กํากับการ/g, '').trim();
      orgName = cleanP.startsWith('สถานีตำรวจ') ? cleanP : `สถานีตำรวจภูธร${cleanP}`;
    }
  }

  // 5. Hospital (โรงพยาบาล)
  else if (pos.includes('โรงพยาบาล') || pos.includes('รพ.')) {
    level = 'PROVINCIAL';
    category = 'โรงพยาบาล';
    posLevel = 'นายแพทย์เชี่ยวชาญ / ผอ.โรงพยาบาล';
    const m = pos.match(/(?:โรงพยาบาล|รพ\.)(.+)/);
    orgName = `โรงพยาบาล${m ? m[1].trim() : pos}`;
  }

  // 6. Court & Justice & Independent
  else if (pos.includes('ศาล') || pos.includes('ผู้พิพากษา')) {
    level = 'CENTRAL';
    category = 'ศาลยุติธรรม';
    orgName = pos.includes('ธัญบุรี') ? 'ศาลจังหวัดธัญบุรี' : (pos.includes('เยาวชน') ? 'ศาลเยาวชนและครอบครัวจังหวัดปทุมธานี' : 'ศาลจังหวัดปทุมธานี');
    posLevel = 'ข้าราชการตุลาการ';
  } else if (pos.includes('อัยการ')) {
    level = 'CENTRAL';
    category = 'สำนักงานอัยการ';
    orgName = pos.includes('ธัญบุรี') ? 'สำนักงานอัยการจังหวัดธัญบุรี' : 'สำนักงานอัยการจังหวัดปทุมธานี';
    posLevel = 'ข้าราชการอัยการ';
  } else if (pos.includes('ปปช.') || pos.includes('ป.ป.ช.')) {
    level = 'CENTRAL';
    category = 'องค์กรอิสระ';
    orgName = 'สำนักงาน ป.ป.ช. ประจำจังหวัดปทุมธานี';
  } else if (pos.includes('ตรวจเงินแผ่นดิน') || pos.includes('สตง.')) {
    level = 'CENTRAL';
    category = 'องค์กรอิสระ';
    orgName = 'สำนักตรวจเงินแผ่นดินจังหวัดปทุมธานี';
  } else if (pos.includes('เลือกตั้ง') || pos.includes('เลือกตัง') || pos.includes('กกต.')) {
    level = 'CENTRAL';
    category = 'องค์กรอิสระ';
    orgName = 'สำนักงานคณะกรรมการการเลือกตั้งประจำจังหวัดปทุมธานี';
  } else if (pos.includes('คปภ.')) {
    level = 'CENTRAL';
    category = 'องค์กรกำกับดูแล';
    orgName = 'สำนักงาน คปภ. จังหวัดปทุมธานี';
  }

  // 7. State Enterprises
  else if (pos.includes('การประปา') || pos.includes('กปภ.')) {
    level = 'CENTRAL';
    category = 'รัฐวิสาหกิจ';
    orgName = 'การประปาส่วนภูมิภาค (สาขาปทุมธานี/รังสิต)';
  } else if (pos.includes('การไฟฟ้า') || pos.includes('กฟภ.')) {
    level = 'CENTRAL';
    category = 'รัฐวิสาหกิจ';
    orgName = 'การไฟฟ้าส่วนภูมิภาค จังหวัดปทุมธานี';
  }

  // 8. Provincial Departments
  else if (pos.includes('จังหวัด')) {
    level = 'PROVINCIAL';
    category = 'ส่วนราชการประจำจังหวัด';
    posLevel = 'อำนวยการระดับสูง';
    const t = pos.replace(/จังหวัด/g, '').trim();
    orgName = `สำนักงาน${t}จังหวัดปทุมธานี`;
    if (!orgName.includes('ปทุมธานี')) orgName += 'ปทุมธานี';
  } else {
    level = 'PROVINCIAL';
    category = 'ส่วนราชการประจำจังหวัด';
    orgName = `สำนักงาน${pos}จังหวัดปทุมธานี`;
  }

  return { orgName, level, category, district, posLevel, address };
}

async function main() {
  console.log('--- Starting Pathum Thani Directory Importer ---');

  // Clear existing records to ensure a fresh, consistent dataset based on NamePathum2701692
  await prisma.auditLog.deleteMany({});
  await prisma.positionHistory.deleteMany({});
  await prisma.executive.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Cleared existing database records.');

  const parsedItems = [];
  for (const page of rawPages) {
    const pno = page.page;
    const lines = page.text.split('\n').map(normalizeThai).filter(Boolean);

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (['ที่ทำงาน โทรสาร มือถือ', 'ชื่อ-สกุล หมายเลขโทรศัพท์', 'หมายเลขโทรศัพท์', 'ชื่อ-สกุล', 'ทำเนียบส่วนราชการจังหวัดปทุมธานี', 'ผู้บริหารสูงสุดภายในจังหวัด'].includes(line)) {
        i++;
        continue;
      }

      if (i + 1 < lines.length) {
        const nextL = lines[i + 1];
        const hasPhone = /0\d{1,2}[-\s]?\d{3,4}/.test(nextL) || nextL.includes('Hotline');
        const hasPrefix = PREFIXES.some(p => nextL.includes(p));

        if ((hasPhone || hasPrefix) && !['เลขที่', 'ศาลากลาง', 'ถนนเทศปทุม', 'ที่ทำงาน โทรสาร', 'องค์กรภาคเอกชน'].some(k => nextL.includes(k))) {
          let pos = line;
          pos = pos.replace(/(?:0[-\s]?\d{1,2}[-\s]?\d{2,4}[-\s]?\d{3,4}|0[689]\d[-\s]?\d{3,4}[-\s]?\d{4}|Hotline\s*\d+).*/g, '').trim();
          if (!['เลขที่', 'ศาลากลาง', 'ถนน', 'ซอย', 'หมู่ที่', 'องค์กรภาคเอกชน'].some(k => pos.includes(k))) {
            const { prefix, firstName, lastName, phone } = parseNameAndPhone(nextL);
            if (firstName || lastName) {
              parsedItems.push({
                page: pno,
                position: pos,
                prefix,
                firstName: firstName || 'ตำแหน่งว่าง',
                lastName: lastName || '(รอดำรงตำแหน่ง)',
                phone
              });
            }
            i += 2;
            continue;
          }
        }
      }
      i++;
    }
  }

  console.log(`Parsed ${parsedItems.length} executive items from PDF.`);

  // Map and create organizations in Prisma
  const orgMap = new Map();
  let orgCount = 0;
  let execCount = 0;

  for (const item of parsedItems) {
    const classification = classifyRecord(item.position, item.page);
    const orgKey = `${classification.orgName}__${classification.level}__${classification.district}`;

    let orgId = orgMap.get(orgKey);
    if (!orgId) {
      orgCount++;
      const code = `ORG-PT-${String(orgCount).padStart(4, '0')}`;
      const newOrg = await prisma.organization.create({
        data: {
          code,
          name: classification.orgName,
          nameEn: null,
          level: classification.level,
          category: classification.category,
          province: 'ปทุมธานี',
          district: classification.district,
          address: classification.address,
          phone: item.phone ? item.phone.split(/[\,\s]/)[0] : null,
          email: null,
          orderIndex: orgCount
        }
      });
      orgId = newOrg.id;
      orgMap.set(orgKey, orgId);
    }

    execCount++;
    const isVacant = item.firstName === 'ตำแหน่งว่าง';
    const createdExec = await prisma.executive.create({
      data: {
        prefix: item.prefix,
        firstName: item.firstName,
        lastName: item.lastName,
        position: item.position,
        positionLevel: classification.posLevel,
        organizationId: orgId,
        status: isVacant ? 'VACANT' : 'ACTIVE',
        appointmentDate: new Date('2024-10-01T00:00:00.000Z'),
        orderReference: 'คำสั่งแต่งตั้งตามทำเนียบส่วนราชการจังหวัดปทุมธานี (2567-2569)',
        phone: item.phone || null,
        email: null,
        bio: `ผู้บริหารสังกัด ${classification.orgName} จังหวัดปทุมธานี`,
        orderIndex: execCount
      }
    });

    // Create Initial Position History
    await prisma.positionHistory.create({
      data: {
        executiveId: createdExec.id,
        previousPosition: 'ตำแหน่งก่อนหน้า',
        newPosition: item.position,
        organizationName: classification.orgName,
        effectiveDate: new Date('2024-10-01T00:00:00.000Z'),
        orderReference: 'ทำเนียบส่วนราชการจังหวัดปทุมธานี ฉบับทางการ',
        notes: 'บันทึกฐานข้อมูลจากเอกสาร NamePathum2701692'
      }
    });
  }

  // Link Organization Hierarchy (Parent-Child relationships for Org Chart)
  console.log('Linking organization hierarchy...');
  const rootProv = await prisma.organization.findFirst({
    where: { name: { contains: 'ศาลากลางจังหวัดปทุมธานี' } }
  });

  if (rootProv) {
    // Find district offices
    const districtOffices = await prisma.organization.findMany({
      where: {
        level: 'DISTRICT',
        category: 'อำเภอ'
      }
    });

    const districtMap = {};
    for (const d of districtOffices) {
      if (d.district) districtMap[d.district] = d.id;
      // Link district office to province root
      await prisma.organization.update({
        where: { id: d.id },
        data: { parentId: rootProv.id }
      });
    }

    // Link provincial departments, hospitals, police stations to province root
    await prisma.organization.updateMany({
      where: {
        level: 'PROVINCIAL',
        id: { not: rootProv.id },
        parentId: null
      },
      data: { parentId: rootProv.id }
    });

    // Link local government (เทศบาล, อบต.) to their respective district office
    for (const [distName, distOrgId] of Object.entries(districtMap)) {
      await prisma.organization.updateMany({
        where: {
          level: 'LOCAL',
          district: distName,
          category: { in: ['เทศบาลนคร', 'เทศบาลเมือง', 'เทศบาลตำบล', 'อบต.'] },
          parentId: null
        },
        data: { parentId: distOrgId }
      });
    }

    // Link อบจ. to province root
    await prisma.organization.updateMany({
      where: {
        category: 'อบจ.',
        parentId: null
      },
      data: { parentId: rootProv.id }
    });
  }

  // Audit Log Entry
  await prisma.auditLog.create({
    data: {
      action: 'IMPORT',
      entityType: 'SYSTEM',
      entityId: 'NAMEPATHUM-2701692',
      title: 'นำเข้าข้อมูลทำเนียบผู้บริหารจังหวัดปทุมธานี (NamePathum2701692.pdf)',
      details: JSON.stringify({
        sourceFile: 'NamePathum2701692.pdf',
        totalExecutives: execCount,
        totalOrganizations: orgCount,
        province: 'ปทุมธานี',
        hierarchyLinked: true,
        status: 'SUCCESS'
      }),
      performedBy: 'ระบบนำเข้าอัตโนมัติ (Automated Import Engine)'
    }
  });

  console.log(`\n🎉 Import Complete!`);
  console.log(`- Created ${orgCount} Organizations across 4 levels`);
  console.log(`- Created ${execCount} Executives with position histories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
