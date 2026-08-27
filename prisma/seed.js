const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Thai Government Executive Directory data...');

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.positionHistory.deleteMany({});
  await prisma.executive.deleteMany({});
  await prisma.organization.deleteMany({});

  // -------------------------------------------------------------
  // 1. ส่วนราชการ (CENTRAL ADMINISTRATION)
  // -------------------------------------------------------------
  // สำนักนายกรัฐมนตรี
  const opm = await prisma.organization.create({
    data: {
      code: 'ORG-C-001',
      name: 'สำนักนายกรัฐมนตรี',
      nameEn: 'Office of the Prime Minister',
      level: 'CENTRAL',
      category: 'สำนักนายกรัฐมนตรี',
      ministry: 'สำนักนายกรัฐมนตรี',
      address: 'ทำเนียบรัฐบาล ถนนพิษณุโลก เขตดุสิต กรุงเทพมหานคร 10300',
      phone: '02-280-9000',
      email: 'contact@opm.go.th',
      website: 'https://www.opm.go.th',
      orderIndex: 1,
    },
  });

  // กระทรวงมหาดไทย
  const moi = await prisma.organization.create({
    data: {
      code: 'ORG-C-002',
      name: 'กระทรวงมหาดไทย',
      nameEn: 'Ministry of Interior',
      level: 'CENTRAL',
      category: 'กระทรวง',
      ministry: 'กระทรวงมหาดไทย',
      address: 'ถนนอัษฎางค์ แขวงราชบพิธ เขตพระนคร กรุงเทพฯ 10200',
      phone: '02-222-1141',
      email: 'saraban@moi.go.th',
      website: 'https://www.moi.go.th',
      orderIndex: 2,
    },
  });

  const dopa = await prisma.organization.create({
    data: {
      code: 'ORG-C-002-01',
      name: 'กรมการปกครอง',
      nameEn: 'Department of Provincial Administration',
      level: 'CENTRAL',
      category: 'กรม',
      ministry: 'กระทรวงมหาดไทย',
      parentId: moi.id,
      address: 'ถนนอัษฎางค์ แขวงราชบพิธ เขตพระนคร กรุงเทพฯ 10200',
      phone: '02-221-8150',
      website: 'https://www.dopa.go.th',
      orderIndex: 1,
    },
  });

  const dla = await prisma.organization.create({
    data: {
      code: 'ORG-C-002-02',
      name: 'กรมส่งเสริมการปกครองท้องถิ่น',
      nameEn: 'Department of Local Administration',
      level: 'CENTRAL',
      category: 'กรม',
      ministry: 'กระทรวงมหาดไทย',
      parentId: moi.id,
      address: 'ถนนนครราชสีมา แขวงดุสิต เขตดุสิต กรุงเทพฯ 10300',
      phone: '02-241-9000',
      website: 'https://www.dla.go.th',
      orderIndex: 2,
    },
  });

  const ddpm = await prisma.organization.create({
    data: {
      code: 'ORG-C-002-03',
      name: 'กรมป้องกันและบรรเทาสาธารณภัย',
      nameEn: 'Department of Disaster Prevention and Mitigation',
      level: 'CENTRAL',
      category: 'กรม',
      ministry: 'กระทรวงมหาดไทย',
      parentId: moi.id,
      address: 'ถนนอู่ทองนอก แขวงดุสิต เขตดุสิต กรุงเทพฯ 10300',
      phone: '02-637-3000',
      website: 'https://www.disaster.go.th',
      orderIndex: 3,
    },
  });

  // กระทรวงการคลัง
  const mof = await prisma.organization.create({
    data: {
      code: 'ORG-C-003',
      name: 'กระทรวงการคลัง',
      nameEn: 'Ministry of Finance',
      level: 'CENTRAL',
      category: 'กระทรวง',
      ministry: 'กระทรวงการคลัง',
      address: 'ถนนพระรามที่ 6 แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400',
      phone: '02-126-5800',
      website: 'https://www.mof.go.th',
      orderIndex: 3,
    },
  });

  // กระทรวงสาธารณสุข
  const moph = await prisma.organization.create({
    data: {
      code: 'ORG-C-004',
      name: 'กระทรวงสาธารณสุข',
      nameEn: 'Ministry of Public Health',
      level: 'CENTRAL',
      category: 'กระทรวง',
      ministry: 'กระทรวงสาธารณสุข',
      address: 'ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมืองนนทบุรี นนทบุรี 11000',
      phone: '02-590-1000',
      website: 'https://www.moph.go.th',
      orderIndex: 4,
    },
  });

  const ddc = await prisma.organization.create({
    data: {
      code: 'ORG-C-004-01',
      name: 'กรมควบคุมโรค',
      nameEn: 'Department of Disease Control',
      level: 'CENTRAL',
      category: 'กรม',
      ministry: 'กระทรวงสาธารณสุข',
      parentId: moph.id,
      address: 'ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมืองนนทบุรี นนทบุรี 11000',
      phone: '02-590-3000',
      website: 'https://ddc.moph.go.th',
      orderIndex: 1,
    },
  });

  // กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม
  const mdes = await prisma.organization.create({
    data: {
      code: 'ORG-C-005',
      name: 'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม',
      nameEn: 'Ministry of Digital Economy and Society',
      level: 'CENTRAL',
      category: 'กระทรวง',
      ministry: 'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม',
      address: 'ศูนย์ราชการเฉลิมพระเกียรติฯ 80 พรรษา ถนนแจ้งวัฒนะ กรุงเทพฯ 10210',
      phone: '02-141-6747',
      website: 'https://www.mdes.go.th',
      orderIndex: 5,
    },
  });

  // -------------------------------------------------------------
  // 2. ส่วนภูมิภาค (PROVINCIAL ADMINISTRATION - จังหวัด)
  // -------------------------------------------------------------
  const provChiangmai = await prisma.organization.create({
    data: {
      code: 'ORG-P-50',
      name: 'จังหวัดเชียงใหม่',
      nameEn: 'Chiang Mai Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'เชียงใหม่',
      address: 'ศาลากลางจังหวัดเชียงใหม่ ถนนโชตนา ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ 50300',
      phone: '053-112-700',
      email: 'chiangmai@moi.go.th',
      website: 'https://www.chiangmai.go.th',
      orderIndex: 1,
    },
  });

  const provChonburi = await prisma.organization.create({
    data: {
      code: 'ORG-P-20',
      name: 'จังหวัดชลบุรี',
      nameEn: 'Chonburi Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'ชลบุรี',
      address: 'ศาลากลางจังหวัดชลบุรี ถนนมนตเสวี ตำบลบางปลาสร้อย อำเภอเมืองชลบุรี 20000',
      phone: '038-275-034',
      email: 'chonburi@moi.go.th',
      website: 'https://www.chonburi.go.th',
      orderIndex: 2,
    },
  });

  const provKorat = await prisma.organization.create({
    data: {
      code: 'ORG-P-30',
      name: 'จังหวัดนครราชสีมา',
      nameEn: 'Nakhon Ratchasima Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'นครราชสีมา',
      address: 'ศาลากลางจังหวัดนครราชสีมา ถนนมหาดไทย ตำบลในเมือง อำเภอเมืองนครราชสีมา 30000',
      phone: '044-242-024',
      website: 'https://www.nakhonratchasima.go.th',
      orderIndex: 3,
    },
  });

  const provPhuket = await prisma.organization.create({
    data: {
      code: 'ORG-P-83',
      name: 'จังหวัดภูเก็ต',
      nameEn: 'Phuket Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'ภูเก็ต',
      address: 'ศาลากลางจังหวัดภูเก็ต ถนนท่าแคลง ตำบลตลาดเหนือ อำเภอเมืองภูเก็ต 83000',
      phone: '076-211-102',
      website: 'https://www.phuket.go.th',
      orderIndex: 4,
    },
  });

  const provSongkhla = await prisma.organization.create({
    data: {
      code: 'ORG-P-90',
      name: 'จังหวัดสงขลา',
      nameEn: 'Songkhla Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'สงขลา',
      address: 'ศาลากลางจังหวัดสงขลา ถนนราชดำเนิน ตำบลบ่อยาง อำเภอเมืองสงขลา 90000',
      phone: '074-310-000',
      website: 'https://www.songkhla.go.th',
      orderIndex: 5,
    },
  });

  const provKhonkaen = await prisma.organization.create({
    data: {
      code: 'ORG-P-40',
      name: 'จังหวัดขอนแก่น',
      nameEn: 'Khon Kaen Province',
      level: 'PROVINCIAL',
      category: 'จังหวัด',
      province: 'ขอนแก่น',
      address: 'ศาลากลางจังหวัดขอนแก่น ถนนศูนย์ราชการ ตำบลในเมือง อำเภอเมืองขอนแก่น 40000',
      phone: '043-236-000',
      website: 'https://www.khonkaen.go.th',
      orderIndex: 6,
    },
  });

  // -------------------------------------------------------------
  // 3. ระดับอำเภอ (DISTRICT ADMINISTRATION - ที่ว่าการอำเภอ)
  // -------------------------------------------------------------
  const distMuangChiangmai = await prisma.organization.create({
    data: {
      code: 'ORG-D-5001',
      name: 'ที่ว่าการอำเภอเมืองเชียงใหม่',
      nameEn: 'Mueang Chiang Mai District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'เชียงใหม่',
      district: 'เมืองเชียงใหม่',
      parentId: provChiangmai.id,
      address: 'ถนนอินทวโรรส ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
      phone: '053-221-016',
      orderIndex: 1,
    },
  });

  const distMaeRim = await prisma.organization.create({
    data: {
      code: 'ORG-D-5007',
      name: 'ที่ว่าการอำเภอแม่ริม',
      nameEn: 'Mae Rim District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'เชียงใหม่',
      district: 'แม่ริม',
      parentId: provChiangmai.id,
      address: 'ตำบลริมใต้ อำเภอแม่ริม เชียงใหม่ 50180',
      phone: '053-299-136',
      orderIndex: 2,
    },
  });

  const distMuangChonburi = await prisma.organization.create({
    data: {
      code: 'ORG-D-2001',
      name: 'ที่ว่าการอำเภอเมืองชลบุรี',
      nameEn: 'Mueang Chonburi District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'ชลบุรี',
      district: 'เมืองชลบุรี',
      parentId: provChonburi.id,
      address: 'ตำบลบางปลาสร้อย อำเภอเมืองชลบุรี ชลบุรี 20000',
      phone: '038-282-045',
      orderIndex: 1,
    },
  });

  const distBanglamung = await prisma.organization.create({
    data: {
      code: 'ORG-D-2004',
      name: 'ที่ว่าการอำเภอบางละมุง',
      nameEn: 'Bang Lamung District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'ชลบุรี',
      district: 'บางละมุง',
      parentId: provChonburi.id,
      address: 'ถนนสุขุมวิท ตำบลนาเกลือ อำเภอบางละมุง ชลบุรี 20150',
      phone: '038-443-020',
      orderIndex: 2,
    },
  });

  const distMuangKorat = await prisma.organization.create({
    data: {
      code: 'ORG-D-3001',
      name: 'ที่ว่าการอำเภอเมืองนครราชสีมา',
      nameEn: 'Mueang Nakhon Ratchasima District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'นครราชสีมา',
      district: 'เมืองนครราชสีมา',
      parentId: provKorat.id,
      address: 'ถนนจอมพล ตำบลในเมือง อำเภอเมืองนครราชสีมา นครราชสีมา 30000',
      phone: '044-242-105',
      orderIndex: 1,
    },
  });

  const distPakchong = await prisma.organization.create({
    data: {
      code: 'ORG-D-3021',
      name: 'ที่ว่าการอำเภอปากช่อง',
      nameEn: 'Pak Chong District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'นครราชสีมา',
      district: 'ปากช่อง',
      parentId: provKorat.id,
      address: 'ถนนมิตรภาพ ตำบลปากช่อง อำเภอปากช่อง นครราชสีมา 30130',
      phone: '044-311-032',
      orderIndex: 2,
    },
  });

  const distMuangPhuket = await prisma.organization.create({
    data: {
      code: 'ORG-D-8301',
      name: 'ที่ว่าการอำเภอเมืองภูเก็ต',
      nameEn: 'Mueang Phuket District Office',
      level: 'DISTRICT',
      category: 'อำเภอ',
      province: 'ภูเก็ต',
      district: 'เมืองภูเก็ต',
      parentId: provPhuket.id,
      address: 'ถนนแม่หลวน ตำบลตลาดเหนือ อำเภอเมืองภูเก็ต ภูเก็ต 83000',
      phone: '076-211-137',
      orderIndex: 1,
    },
  });

  // -------------------------------------------------------------
  // 4. องค์กรปกครองส่วนท้องถิ่น (LOCAL ADMINISTRATION - ท้องถิ่น)
  // -------------------------------------------------------------
  // รูปแบบพิเศษ
  const bma = await prisma.organization.create({
    data: {
      code: 'ORG-L-BMA',
      name: 'กรุงเทพมหานคร',
      nameEn: 'Bangkok Metropolitan Administration',
      level: 'LOCAL',
      category: 'องค์กรพิเศษ',
      province: 'กรุงเทพมหานคร',
      address: '173 ถนนดินสอ แขวงเสาชิงช้า เขตพระนคร กรุงเทพฯ 10200',
      phone: '02-221-2141',
      website: 'https://www.bangkok.go.th',
      orderIndex: 1,
    },
  });

  const pattaya = await prisma.organization.create({
    data: {
      code: 'ORG-L-PAT',
      name: 'เมืองพัทยา',
      nameEn: 'Pattaya City',
      level: 'LOCAL',
      category: 'องค์กรพิเศษ',
      province: 'ชลบุรี',
      district: 'บางละมุง',
      address: '171 หมู่ที่ 6 ถนนพัทยาเหนือ ตำบลนาเกลือ อำเภอบางละมุง ชลบุรี 20150',
      phone: '038-253-100',
      website: 'https://www.pattaya.go.th',
      orderIndex: 2,
    },
  });

  // อบจ.
  const paoChiangmai = await prisma.organization.create({
    data: {
      code: 'ORG-L-PAO-50',
      name: 'องค์การบริหารส่วนจังหวัดเชียงใหม่',
      nameEn: 'Chiang Mai Provincial Administrative Organization',
      level: 'LOCAL',
      category: 'อบจ.',
      province: 'เชียงใหม่',
      address: 'อาคารศูนย์ราชการจังหวัดเชียงใหม่ ถนนโชตนา ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ 50300',
      phone: '053-998-333',
      website: 'https://www.chiangmaipao.go.th',
      orderIndex: 3,
    },
  });

  const paoChonburi = await prisma.organization.create({
    data: {
      code: 'ORG-L-PAO-20',
      name: 'องค์การบริหารส่วนจังหวัดชลบุรี',
      nameEn: 'Chonburi Provincial Administrative Organization',
      level: 'LOCAL',
      category: 'อบจ.',
      province: 'ชลบุรี',
      address: 'ตำบลเสม็ด อำเภอเมืองชลบุรี ชลบุรี 20000',
      phone: '038-398-039',
      website: 'https://www.chonpao.go.th',
      orderIndex: 4,
    },
  });

  const paoKorat = await prisma.organization.create({
    data: {
      code: 'ORG-L-PAO-30',
      name: 'องค์การบริหารส่วนจังหวัดนครราชสีมา',
      nameEn: 'Nakhon Ratchasima PAO',
      level: 'LOCAL',
      category: 'อบจ.',
      province: 'นครราชสีมา',
      address: 'ถนนกำแหงสงคราม ตำบลในเมือง อำเภอเมืองนครราชสีมา 30000',
      phone: '044-243-555',
      website: 'https://www.koratpao.go.th',
      orderIndex: 5,
    },
  });

  // เทศบาลนคร / เทศบาลเมือง / เทศบาลตำบล
  const nmChiangmai = await prisma.organization.create({
    data: {
      code: 'ORG-L-MUN-5001',
      name: 'เทศบาลนครเชียงใหม่',
      nameEn: 'Chiang Mai City Municipality',
      level: 'LOCAL',
      category: 'เทศบาลนคร',
      province: 'เชียงใหม่',
      district: 'เมืองเชียงใหม่',
      address: '1 ถนนวังสิงห์คำ ตำบลช้างม่อย อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300',
      phone: '053-259-000',
      website: 'https://www.cmcity.go.th',
      orderIndex: 6,
    },
  });

  const tmMaerim = await prisma.organization.create({
    data: {
      code: 'ORG-L-MUN-5007',
      name: 'เทศบาลตำบลแม่ริม',
      nameEn: 'Mae Rim Sub-district Municipality',
      level: 'LOCAL',
      category: 'เทศบาลตำบล',
      province: 'เชียงใหม่',
      district: 'แม่ริม',
      address: 'ตำบลริมใต้ อำเภอแม่ริม เชียงใหม่ 50180',
      phone: '053-297-008',
      website: 'https://www.maerimcity.go.th',
      orderIndex: 7,
    },
  });

  const nmNonthaburi = await prisma.organization.create({
    data: {
      code: 'ORG-L-MUN-1201',
      name: 'เทศบาลนครนนทบุรี',
      nameEn: 'Nonthaburi City Municipality',
      level: 'LOCAL',
      category: 'เทศบาลนคร',
      province: 'นนทบุรี',
      district: 'เมืองนนทบุรี',
      address: 'ถนนรัตนาธิเบศร์ ตำบลบางกระสอ อำเภอเมืองนนทบุรี 11000',
      phone: '02-589-0500',
      website: 'https://www.nakornnont.go.th',
      orderIndex: 8,
    },
  });

  // อบต.
  const saoSuthep = await prisma.organization.create({
    data: {
      code: 'ORG-L-SAO-5001',
      name: 'องค์การบริหารส่วนตำบลสุเทพ',
      nameEn: 'Suthep Sub-district Administrative Organization',
      level: 'LOCAL',
      category: 'อบต.',
      province: 'เชียงใหม่',
      district: 'เมืองเชียงใหม่',
      address: 'หมู่ 1 ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
      phone: '053-810-740',
      website: 'https://www.suthep.go.th',
      orderIndex: 9,
    },
  });

  const saoMoosi = await prisma.organization.create({
    data: {
      code: 'ORG-L-SAO-3021',
      name: 'องค์การบริหารส่วนตำบลหมูสี',
      nameEn: 'Moo Si SAO',
      level: 'LOCAL',
      category: 'อบต.',
      province: 'นครราชสีมา',
      district: 'ปากช่อง',
      address: 'ตำบลหมูสี อำเภอปากช่อง นครราชสีมา 30130',
      phone: '044-297-155',
      website: 'https://www.moosi.go.th',
      orderIndex: 10,
    },
  });

  // -------------------------------------------------------------
  // SEED EXECUTIVES (รายชื่อผู้บริหาร)
  // -------------------------------------------------------------
  const executivesData = [
    // 1. ส่วนกลาง (Central)
    {
      prefix: 'นางสาว',
      firstName: 'แพทองธาร',
      lastName: 'ชินวัตร',
      position: 'นายกรัฐมนตรี',
      positionLevel: 'ข้าราชการการเมือง',
      organizationId: opm.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-08-16'),
      orderReference: 'พระบรมราชโองการโปรดเกล้าฯ แต่งตั้งนายกรัฐมนตรี วันที่ 16 สิงหาคม 2567',
      phone: '02-280-9000 ต่อ 4001',
      email: 'prime_minister@opm.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      bio: 'นายกรัฐมนตรีไทย คนที่ 31',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'อนุทิน',
      lastName: 'ชาญวีรกูล',
      position: 'รองนายกรัฐมนตรี และรัฐมนตรีว่าการกระทรวงมหาดไทย',
      positionLevel: 'ข้าราชการการเมือง',
      organizationId: moi.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-09-01'),
      orderReference: 'พระบรมราชโองการโปรดเกล้าฯ แต่งตั้งรัฐมนตรี',
      phone: '02-222-1141',
      email: 'minister@moi.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'กำกับดูแลงานกระทรวงมหาดไทยและการบริหารราชการแผ่นดินส่วนภูมิภาคและท้องถิ่น',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'อรรษิษฐ์',
      lastName: 'สัมพันธรัตน์',
      position: 'ปลัดกระทรวงมหาดไทย',
      positionLevel: 'นักบริหารระดับสูง (ซี 11)',
      organizationId: moi.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-10-01'),
      orderReference: 'คำสั่งสำนักนายกรัฐมนตรี ที่ 254/2567',
      phone: '02-221-1824',
      email: 'permanent_sec@moi.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      bio: 'อดีตอธิบดีกรมการปกครอง ดำรงตำแหน่งปลัดกระทรวงมหาดไทย',
      orderIndex: 2,
    },
    {
      prefix: 'นาย',
      firstName: 'สยาม',
      lastName: 'ศิริมงคล',
      position: 'อธิบดีกรมการปกครอง',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: dopa.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-10-01'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 890/2567',
      phone: '02-221-8150',
      email: 'director@dopa.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'อดีตผู้ว่าราชการจังหวัดนครราชสีมา',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'ขจร',
      lastName: 'ศรีชวโนทัย',
      position: 'อธิบดีกรมส่งเสริมการปกครองท้องถิ่น',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: dla.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-10-01'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 712/2565',
      phone: '02-241-9000 ต่อ 1001',
      email: 'director@dla.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      bio: 'กำกับดูแลและส่งเสริมการปฏิบัติงานของ อปท. ทั่วประเทศ',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'พิชัย',
      lastName: 'ชุณหวชิร',
      position: 'รองนายกรัฐมนตรี และรัฐมนตรีว่าการกระทรวงการคลัง',
      positionLevel: 'ข้าราชการการเมือง',
      organizationId: mof.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-04-28'),
      phone: '02-126-5800',
      email: 'minister@mof.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นายแพทย์',
      firstName: 'สมศักดิ์',
      lastName: 'เทพสุทิน',
      position: 'รัฐมนตรีว่าการกระทรวงสาธารณสุข',
      positionLevel: 'ข้าราชการการเมือง',
      organizationId: moph.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-04-28'),
      phone: '02-590-1000',
      email: 'minister@moph.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นายแพทย์',
      firstName: 'ธงชัย',
      lastName: 'กีรติหัตถยากร',
      position: 'อธิบดีกรมควบคุมโรค',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: ddc.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-10-01'),
      phone: '02-590-3000',
      email: 'director@ddc.moph.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },

    // 2. ส่วนภูมิภาค (Provincial)
    {
      prefix: 'นาย',
      firstName: 'นิรัตน์',
      lastName: 'พงษ์สิทธิถาวร',
      position: 'ผู้ว่าราชการจังหวัดเชียงใหม่',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-10-01'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 650/2565',
      phone: '053-112-700',
      email: 'governor@chiangmai.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=face',
      bio: 'ขับเคลื่อนการพัฒนาจังหวัดเชียงใหม่ เมืองน่าอยู่ และการแก้ปัญหาหมอกควันไฟป่า',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'วรวิทย์',
      lastName: 'ชัยสวัสดิ์',
      position: 'รองผู้ว่าราชการจังหวัดเชียงใหม่',
      positionLevel: 'นักบริหารระดับต้น (ซี 9)',
      organizationId: provChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2021-10-01'),
      phone: '053-112-705',
      email: 'deputy_gov1@chiangmai.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      orderIndex: 2,
    },
    {
      prefix: 'นาย',
      firstName: 'ชัชวาลย์',
      lastName: 'ปัญญา',
      position: 'รองผู้ว่าราชการจังหวัดเชียงใหม่',
      positionLevel: 'นักบริหารระดับต้น (ซี 9)',
      organizationId: provChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-10-01'),
      phone: '053-112-706',
      email: 'deputy_gov2@chiangmai.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
      orderIndex: 3,
    },
    {
      prefix: 'นาย',
      firstName: 'ธวัชชัย',
      lastName: 'ศรีทอง',
      position: 'ผู้ว่าราชการจังหวัดชลบุรี',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provChonburi.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-10-01'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 652/2565',
      phone: '038-275-034',
      email: 'governor@chonburi.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
      bio: 'ขับเคลื่อนเขตพัฒนาพิเศษภาคตะวันออก (EEC) และการท่องเที่ยวชลบุรี',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'ชัยวัฒน์',
      lastName: 'ชื่นโกสุม',
      position: 'ผู้ว่าราชการจังหวัดนครราชสีมา',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provKorat.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2024-03-20'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 210/2567',
      phone: '044-242-024',
      email: 'governor@nakhonratchasima.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face',
      bio: 'อดีตอธิบดีกรมการพัฒนาชุมชน',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'โสภณ',
      lastName: 'สุวรรณรัตน์',
      position: 'ผู้ว่าราชการจังหวัดภูเก็ต',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provPhuket.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-10-01'),
      orderReference: 'คำสั่งกระทรวงมหาดไทย ที่ 780/2566',
      phone: '076-211-102',
      email: 'governor@phuket.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      bio: 'บริหารจัดการเมืองท่องเที่ยวระดับโลกและระบบความปลอดภัย',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'สมนึก',
      lastName: 'พรหมเขียว',
      position: 'ผู้ว่าราชการจังหวัดสงขลา',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provSongkhla.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-10-01'),
      phone: '074-310-000',
      email: 'governor@songkhla.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'ไกรสร',
      lastName: 'กองฉลาด',
      position: 'ผู้ว่าราชการจังหวัดขอนแก่น',
      positionLevel: 'นักบริหารระดับสูง (ซี 10)',
      organizationId: provKhonkaen.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-10-01'),
      phone: '043-236-000',
      email: 'governor@khonkaen.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },

    // 3. ระดับอำเภอ (District)
    {
      prefix: 'นาย',
      firstName: 'ดนัย',
      lastName: 'สุริยวรรณ',
      position: 'นายอำเภอเมืองเชียงใหม่',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distMuangChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-01-15'),
      orderReference: 'คำสั่งกรมการปกครอง ที่ 45/2566',
      phone: '053-221-016',
      email: 'dopa5001@dopa.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
      bio: 'รับผิดชอบการบริหารงานปกครองอำเภอศูนย์กลางเศรษฐกิจและวัฒนธรรมเชียงใหม่',
      orderIndex: 1,
    },
    {
      prefix: 'ว่าที่ร้อยตรี',
      firstName: 'นพรัตน์',
      lastName: 'ศุภกิจโกศล',
      position: 'นายอำเภอแม่ริม',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distMaeRim.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-06-01'),
      phone: '053-299-136',
      email: 'dopa5007@dopa.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'วีกิจ',
      lastName: 'มานะโรจน์กิจ',
      position: 'นายอำเภอบางละมุง',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distBanglamung.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-11-01'),
      orderReference: 'คำสั่งกรมการปกครอง ที่ 1102/2566',
      phone: '038-443-020',
      email: 'dopa2004@dopa.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face',
      bio: 'รับผิดชอบการดูแลพื้นที่เศรษฐกิจและการท่องเที่ยวเมืองพัทยาและบางละมุง',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'ศุภภิมิตร',
      lastName: 'เปาริก',
      position: 'นายอำเภอเมืองชลบุรี',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distMuangChonburi.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-12-01'),
      phone: '038-282-045',
      email: 'dopa2001@dopa.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'บัลลังก์',
      lastName: 'ไวทย์ศิริ',
      position: 'นายอำเภอเมืองนครราชสีมา',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distMuangKorat.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-02-01'),
      phone: '044-242-105',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'คณัสชนม์',
      lastName: 'ศรีเจริญ',
      position: 'นายอำเภอปากช่อง',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distPakchong.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-04-10'),
      phone: '044-311-032',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    {
      prefix: 'นาย',
      firstName: 'วรศิษย์',
      lastName: 'พุฒจีบ',
      position: 'นายอำเภอเมืองภูเก็ต',
      positionLevel: 'ผู้อำนวยการระดับสูง (ซี 9)',
      organizationId: distMuangPhuket.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2023-10-15'),
      phone: '076-211-137',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },

    // 4. ท้องถิ่น (Local Administration)
    // กรุงเทพมหานคร
    {
      prefix: 'นาย',
      firstName: 'ชัชชาติ',
      lastName: 'สิทธิพันธุ์',
      position: 'ผู้ว่าราชการกรุงเทพมหานคร',
      positionLevel: 'ผู้บริหารองค์กรปกครองส่วนท้องถิ่นรูปแบบพิเศษ',
      organizationId: bma.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-05-22'),
      orderReference: 'ประกาศคณะกรรมการการเลือกตั้ง วันที่ 31 พฤษภาคม 2565',
      phone: '02-221-2141 ต่อ 1001',
      email: 'governor@bangkok.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      bio: 'ผู้ว่าราชการกรุงเทพมหานคร จากการเลือกตั้งโดยตรงของประชาชน นโยบายเมืองน่าอยู่ 9 ด้าน 9 ดี',
      orderIndex: 1,
    },
    {
      prefix: 'นางสาว',
      firstName: 'ทวิดา',
      lastName: 'กมลเวชช',
      position: 'รองผู้ว่าราชการกรุงเทพมหานคร',
      positionLevel: 'ผู้บริหารท้องถิ่นรูปแบบพิเศษ',
      organizationId: bma.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-06-01'),
      phone: '02-221-2141 ต่อ 1005',
      email: 'tavida@bangkok.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      orderIndex: 2,
    },
    // เมืองพัทยา
    {
      prefix: 'นาย',
      firstName: 'ปรเมศวร์',
      lastName: 'งามพิเชษฐ์',
      position: 'นายกเมืองพัทยา',
      positionLevel: 'ผู้บริหารองค์กรปกครองส่วนท้องถิ่นรูปแบบพิเศษ',
      organizationId: pattaya.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2022-05-22'),
      orderReference: 'ประกาศคณะกรรมการการเลือกตั้ง เรื่อง ผลการเลือกตั้งนายกเมืองพัทยา',
      phone: '038-253-100 ต่อ 101',
      email: 'mayor@pattaya.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'นายกเมืองพัทยา นโยบาย Better Pattaya ต่อยอด ต่อเนื่อง เพื่อพัทยาที่ดีขึ้น',
      orderIndex: 1,
    },
    // อบจ.เชียงใหม่
    {
      prefix: 'นาย',
      firstName: 'พิชัย',
      lastName: 'เลิศพงศ์อดิศร',
      position: 'นายกองค์การบริหารส่วนจังหวัดเชียงใหม่',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: paoChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2020-12-20'),
      phone: '053-998-333 ต่อ 101',
      email: 'president@chiangmaipao.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      bio: 'นายก อบจ.เชียงใหม่ ขับเคลื่อนโครงสร้างพื้นฐานและการพัฒนาคุณภาพชีวิตประชาชนเชียงใหม่',
      orderIndex: 1,
    },
    // อบจ.ชลบุรี
    {
      prefix: 'นาย',
      firstName: 'วิทยา',
      lastName: 'คุณปลื้ม',
      position: 'นายกองค์การบริหารส่วนจังหวัดชลบุรี',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: paoChonburi.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2020-12-20'),
      phone: '038-398-039 ต่อ 111',
      email: 'president@chonpao.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    // อบจ.นครราชสีมา
    {
      prefix: 'นางสาว',
      firstName: 'ยลดา',
      lastName: 'หวังศุภกิจโกศล',
      position: 'นายกองค์การบริหารส่วนจังหวัดนครราชสีมา',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: paoKorat.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2020-12-20'),
      phone: '044-243-555 ต่อ 101',
      email: 'president@koratpao.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    // เทศบาลนครเชียงใหม่
    {
      prefix: 'นาย',
      firstName: 'อัศนี',
      lastName: 'บูรณุปกรณ์',
      position: 'นายกเทศมนตรีนครเชียงใหม่',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: nmChiangmai.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2021-03-28'),
      phone: '053-259-000 ต่อ 100',
      email: 'mayor@cmcity.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'บริหารจัดการพื้นที่เทศบาลนครเชียงใหม่ เมืองเก่า และระบบสาธารณูปโภคเมือง',
      orderIndex: 1,
    },
    // ตัวอย่างตำแหน่ง รักษาราชการแทน (ACTING)
    {
      prefix: 'นาย',
      firstName: 'สุรศักดิ์',
      lastName: 'เจริญสุข',
      position: 'ปลัดเทศบาลตำบลแม่ริม (รักษาราชการแทนนายกเทศมนตรีตำบลแม่ริม)',
      positionLevel: 'นักบริหารงานท้องถิ่นระดับกลาง',
      organizationId: tmMaerim.id,
      status: 'ACTING',
      appointmentDate: new Date('2024-05-01'),
      orderReference: 'คำสั่งอำเภอแม่ริม ที่ 88/2567',
      phone: '053-297-008',
      email: 'palad@maerimcity.go.th',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    // อบต.สุเทพ
    {
      prefix: 'นาย',
      firstName: 'พุฒิพงศ์',
      lastName: 'ศิริมาตย์',
      position: 'นายกองค์การบริหารส่วนตำบลสุเทพ',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: saoSuthep.id,
      status: 'ACTIVE',
      appointmentDate: new Date('2021-11-28'),
      phone: '053-810-740',
      email: 'suthep.sao@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=face',
      orderIndex: 1,
    },
    // อบต.หมูสี (ตำแหน่งว่าง VACANT)
    {
      prefix: '(-)',
      firstName: 'ตำแหน่งว่าง',
      lastName: '(รอการเลือกตั้ง/แต่งตั้งใหม่)',
      position: 'นายกองค์การบริหารส่วนตำบลหมูสี',
      positionLevel: 'ผู้บริหารท้องถิ่น',
      organizationId: saoMoosi.id,
      status: 'VACANT',
      appointmentDate: null,
      orderReference: 'ประกาศพ้นจากตำแหน่งเนื่องจากครบวาระ',
      phone: '044-297-155',
      avatarUrl: null,
      bio: 'อยู่ระหว่างดำเนินการตามกระบวนการสรรหาหรือเลือกตั้ง',
      orderIndex: 1,
    },
  ];

  for (const execData of executivesData) {
    const createdExec = await prisma.executive.create({
      data: execData,
    });

    // Create a position history entry
    await prisma.positionHistory.create({
      data: {
        executiveId: createdExec.id,
        previousPosition: 'ตำแหน่งก่อนหน้า',
        newPosition: createdExec.position,
        organizationName: execData.position,
        effectiveDate: execData.appointmentDate || new Date(),
        orderReference: execData.orderReference || 'คำสั่งแต่งตั้งประจำปี',
        notes: 'ได้รับการแต่งตั้งดำรงตำแหน่งตามระเบียบราชการ',
      },
    });
  }

  // Create Sample Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'IMPORT',
        entityType: 'EXECUTIVE',
        entityId: 'SYSTEM-INIT',
        title: 'นำเข้าข้อมูลตั้งต้นระบบทำเนียบผู้บริหาร',
        details: JSON.stringify({ count: executivesData.length, status: 'SUCCESS' }),
        performedBy: 'ผู้ดูแลระบบกลาง',
        timestamp: new Date(),
      },
      {
        action: 'UPDATE',
        entityType: 'EXECUTIVE',
        entityId: opm.id,
        title: 'อัปเดตข้อมูลผู้บริหารระดับสูง สำนักนายกรัฐมนตรี',
        details: JSON.stringify({ field: 'appointmentDate', status: 'ACTIVE' }),
        performedBy: 'นายทะเบียนส่วนกลาง',
        timestamp: new Date(),
      },
    ],
  });

  console.log(`Database seeded successfully with:`);
  console.log(`- ${await prisma.organization.count()} Organizations`);
  console.log(`- ${await prisma.executive.count()} Executives`);
  console.log(`- ${await prisma.positionHistory.count()} Position History records`);
  console.log(`- ${await prisma.auditLog.count()} Audit Logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
