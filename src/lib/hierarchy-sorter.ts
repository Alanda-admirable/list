import { Executive } from '@/components/ExecutiveCard';

export interface HierarchySection {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  order: number;
  subsections: HierarchySubsection[];
}

export interface HierarchySubsection {
  id: string;
  title: string;
  description?: string;
  executives: Executive[];
}

// Seniority score for positions
export function getPositionSeniorityScore(position: string, prefix: string = '', level: string = ''): number {
  let score = 0;
  const p = (position || '').trim();
  const pre = (prefix || '').trim();

  // 1. Provincial Governor & Deputies
  if (p.includes('ผู้ว่าราชการจังหวัด')) {
    if (p.startsWith('รอง')) score += 90000;
    else score += 100000;
  } else if (p.includes('นายกองค์การบริหารส่วนจังหวัด')) {
    if (p.startsWith('รอง')) score += 85000;
    else score += 92000;
  } else if (p.includes('นายกเทศมนตรีนคร')) {
    if (p.startsWith('รอง')) score += 78000;
    else score += 84000;
  } else if (p.includes('นายกเทศมนตรีเมือง')) {
    if (p.startsWith('รอง')) score += 72000;
    else score += 78000;
  } else if (p.includes('นายกเทศมนตรีตำบล')) {
    if (p.startsWith('รอง')) score += 65000;
    else score += 70000;
  } else if (p.includes('นายกองค์การบริหารส่วนตำบล')) {
    if (p.startsWith('รอง')) score += 58000;
    else score += 63000;
  } else if (p.includes('นายกเหล่ากาชาด')) {
    score += 88000;
  } else if (p.includes('ปลัดจังหวัด')) {
    score += 86000;
  } else if (p.includes('หัวหน้าสำนักงานจังหวัด')) {
    score += 85000;
  } else if (p.includes('นายอำเภอ')) {
    score += 80000;
  } else if (p.includes('ผู้บังคับการ') || p.includes('ผบก.')) {
    score += 84000;
  } else if (p.includes('ผู้บัญชาการ') || p.includes('ผบ.')) {
    score += 82000;
  } else if (p.includes('นายแพทย์สาธารณสุข')) {
    score += 81000;
  } else if (p.includes('ผู้อำนวยการโรงพยาบาล')) {
    score += 79000;
  } else if (p.startsWith('ผู้อำนวยการ') || p.startsWith('ผอ.')) {
    score += 75000;
  } else if (p.includes('หัวหน้าส่วน') || p.includes('หน.สนง.') || p.includes('เจ้าพนักงานที่ดินจังหวัด')) {
    score += 76000;
  } else if (p.includes('คลังจังหวัด') || p.includes('พาณิชย์จังหวัด') || p.includes('เกษตรจังหวัด')) {
    score += 76000;
  } else if (p.includes('จ่าจังหวัด') || p.includes('ป้องกันจังหวัด') || p.includes('เสมียนตราจังหวัด')) {
    score += 70000;
  } else if (p.includes('ปลัดอำเภอ')) {
    score += 60000;
  } else {
    score += 40000;
  }

  // 2. Rank Bonus (ยศทหาร/ตำรวจ/วิชาการ)
  if (/^(พลเอก|พล\.อ\.|พลตำรวจเอก|พล\.ต\.อ\.)/.test(pre)) score += 15000;
  else if (/^(พลโท|พล\.ท\.|พลตำรวจโท|พล\.ต\.ท\.)/.test(pre)) score += 12000;
  else if (/^(พลตรี|พล\.ต\.|พลตำรวจตรี|พล\.ต\.ต\.)/.test(pre)) score += 10000;
  else if (/^(พันเอก|พ\.อ\.|พันตำรวจเอก|พ\.ต\.อ\.)/.test(pre)) score += 8000;
  else if (/^(พันโท|พ\.ท\.|พันตำรวจโท|พ\.ต\.ท\.)/.test(pre)) score += 6000;
  else if (/^(พันตรี|พ\.ต\.|พันตำรวจตรี|พ\.ต\.ต\.)/.test(pre)) score += 4500;
  else if (/^(ร้อยเอก|ร\.อ\.|ร้อยตำรวจเอก|ร\.ต\.อ\.)/.test(pre)) score += 3500;
  else if (/^(ร้อยโท|ร\.ท\.|ร้อยตำรวจโท|ร\.ต\.ท\.)/.test(pre)) score += 2500;
  else if (/^(ร้อยตรี|ร\.ต\.|ร้อยตำรวจตรี|ร\.ต\.ต\.)/.test(pre)) score += 1500;
  else if (/^(ว่าที่ร้อยตรี|ว่าที่ ร\.ต\.)/.test(pre)) score += 800;
  else if (/^(ศ\.|ศ\.ดร\.|ศาสตราจารย์)/.test(pre)) score += 9000;
  else if (/^(รศ\.|รศ\.ดร\.|รองศาสตราจารย์)/.test(pre)) score += 7000;
  else if (/^(ผศ\.|ผศ\.ดร\.|ผู้ช่วยศาสตราจารย์)/.test(pre)) score += 5000;
  else if (/^(ดร\.|นพ\.|พญ\.|นายแพทย์|แพทย์หญิง)/.test(pre)) score += 4000;

  return score;
}

// Organize all executives into 5 official administrative tiers
export function groupExecutivesByOfficialHierarchy(executives: Executive[]): HierarchySection[] {
  // Sort helper
  const sortBySeniority = (list: Executive[]) => {
    return [...list].sort((a, b) => {
      const scoreA = getPositionSeniorityScore(a.position, a.prefix, a.organization?.level);
      const scoreB = getPositionSeniorityScore(b.position, b.prefix, b.organization?.level);
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Highest score first
      }
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });
  };

  // Section 1: ผู้บริหารสูงสุดประจำจังหวัด (Provincial Leadership)
  const tier1Execs: Executive[] = [];

  // Section 2: ที่ทำการปกครองและสำนักงานจังหวัด (Provincial Administration & Governor's Office)
  const tier2Execs: Executive[] = [];

  // Section 3: ส่วนราชการประจำจังหวัดและกระทรวง (Provincial Departmental Agencies)
  const tier3ByMinistry: Record<string, Executive[]> = {
    'กระทรวงมหาดไทย / ฝ่ายความมั่นคง / กฎหมาย': [],
    'กระทรวงการคลัง / พาณิชย์ / อุตสาหกรรม (เศรษฐกิจ)': [],
    'กระทรวงเกษตรและสหกรณ์ / ทรัพยากรธรรมชาติ': [],
    'กระทรวงสาธารณสุข / สังคมและความมั่นคงของมนุษย์': [],
    'กระทรวงคมนาคม / ดิจิทัล / การท่องเที่ยวและกีฬา': [],
    'กระทรวงแรงงาน / วัฒนธรรม / พระพุทธศาสนา / การศึกษา': [],
  };

  // Section 4: ส่วนราชการระดับอำเภอ (District Administration - 7 อำเภอ)
  const tier4ByDistrict: Record<string, Executive[]> = {
    'อำเภอเมืองปทุมธานี': [],
    'อำเภอคลองหลวง': [],
    'อำเภอธัญบุรี': [],
    'อำเภอลำลูกกา': [],
    'อำเภอลาดหลุมแก้ว': [],
    'อำเภอสามโคก': [],
    'อำเภอหนองเสือ': [],
    'ระดับอำเภอทั่วไป': [],
  };

  // Section 5: องค์กรปกครองส่วนท้องถิ่น (Local Administrations - อปท.)
  const tier5ByOrgType: Record<string, Executive[]> = {
    'องค์การบริหารส่วนจังหวัดปทุมธานี (อบจ.)': [],
    'เทศบาลนคร': [],
    'เทศบาลเมือง': [],
    'เทศบาลตำบล': [],
    'องค์การบริหารส่วนตำบล (อบต.)': [],
  };

  executives.forEach((exec) => {
    const org = exec.organization;
    const orgName = org?.name || '';
    const pos = exec.position || '';
    const level = org?.level || 'CENTRAL';
    const category = org?.category || '';
    const district = org?.district || '';

    // Check Tier 1: Provincial Leadership
    if (
      pos.includes('ผู้ว่าราชการจังหวัด') ||
      pos.includes('รองผู้ว่าราชการจังหวัด') ||
      pos.includes('นายกเหล่ากาชาด') ||
      pos.includes('รอง ผอ.รมน.จว.ปท.(ฝ่ายทหาร)')
    ) {
      tier1Execs.push(exec);
      return;
    }

    // Check Tier 2: Provincial Admin & Strategy Office (ศาลากลาง / ที่ทำการปกครอง / สนง.จังหวัด)
    if (
      orgName.includes('สำนักงานจังหวัด') ||
      orgName.includes('ที่ทำการปกครองจังหวัด') ||
      orgName.includes('เหล่ากาชาด') ||
      pos.includes('ปลัดจังหวัด') ||
      pos.includes('หัวหน้าสำนักงานจังหวัด') ||
      pos.includes('จ่าจังหวัด') ||
      pos.includes('เสมียนตราจังหวัด') ||
      pos.includes('ป้องกันจังหวัด') ||
      pos.includes('กลุ่มงานยุทธศาสตร์') ||
      pos.includes('กลุ่มงานอำนวยการ') ||
      pos.includes('กลุ่มงานบริหารทรัพยากรบุคคล') ||
      pos.includes('ศูนย์ดำรงธรรม') ||
      pos.includes('ตรวจสอบภายใน')
    ) {
      tier2Execs.push(exec);
      return;
    }

    // Check Tier 4: District Administration
    if (level === 'DISTRICT' || category === 'อำเภอ' || pos.includes('นายอำเภอ') || pos.includes('ปลัดอำเภอ')) {
      let matchedDist = 'ระดับอำเภอทั่วไป';
      for (const d of Object.keys(tier4ByDistrict)) {
        if (d.includes(district) || (district && d.includes(district))) {
          matchedDist = d;
          break;
        }
        if (orgName.includes(d.replace('อำเภอ', '')) || pos.includes(d.replace('อำเภอ', ''))) {
          matchedDist = d;
          break;
        }
      }
      tier4ByDistrict[matchedDist].push(exec);
      return;
    }

    // Check Tier 5: Local Government (อปท.)
    if (
      level === 'LOCAL' ||
      category === 'อบจ.' ||
      category === 'เทศบาลนคร' ||
      category === 'เทศบาลเมือง' ||
      category === 'เทศบาลตำบล' ||
      category === 'อบต.' ||
      pos.includes('นายกเทศมนตรี') ||
      pos.includes('นายกองค์การบริหารส่วน')
    ) {
      if (category === 'อบจ.' || orgName.includes('องค์การบริหารส่วนจังหวัด')) {
        tier5ByOrgType['องค์การบริหารส่วนจังหวัดปทุมธานี (อบจ.)'].push(exec);
      } else if (category === 'เทศบาลนคร' || orgName.includes('เทศบาลนคร')) {
        tier5ByOrgType['เทศบาลนคร'].push(exec);
      } else if (category === 'เทศบาลเมือง' || orgName.includes('เทศบาลเมือง')) {
        tier5ByOrgType['เทศบาลเมือง'].push(exec);
      } else if (category === 'เทศบาลตำบล' || orgName.includes('เทศบาลตำบล')) {
        tier5ByOrgType['เทศบาลตำบล'].push(exec);
      } else {
        tier5ByOrgType['องค์การบริหารส่วนตำบล (อบต.)'].push(exec);
      }
      return;
    }

    // Check Tier 3: Provincial Departments & Agencies
    if (
      orgName.includes('ตำรวจ') ||
      orgName.includes('ยุติธรรม') ||
      orgName.includes('เรือนจำ') ||
      orgName.includes('คุมประพฤติ') ||
      orgName.includes('บังคับคดี') ||
      orgName.includes('สัสดี') ||
      orgName.includes('ปภ.') ||
      orgName.includes('ป้องกันและบรรเทา') ||
      orgName.includes('ศาล') ||
      orgName.includes('อัยการ')
    ) {
      tier3ByMinistry['กระทรวงมหาดไทย / ฝ่ายความมั่นคง / กฎหมาย'].push(exec);
    } else if (
      orgName.includes('คลัง') ||
      orgName.includes('สรรพากร') ||
      orgName.includes('สรรพสามิต') ||
      orgName.includes('ธนารักษ์') ||
      orgName.includes('พาณิชย์') ||
      orgName.includes('อุตสาหกรรม')
    ) {
      tier3ByMinistry['กระทรวงการคลัง / พาณิชย์ / อุตสาหกรรม (เศรษฐกิจ)'].push(exec);
    } else if (
      orgName.includes('เกษตร') ||
      orgName.includes('ประมง') ||
      orgName.includes('ปศุสัตว์') ||
      orgName.includes('ชลประทาน') ||
      orgName.includes('ทรัพยากรธรรมชาติ') ||
      orgName.includes('สิ่งแวดล้อม') ||
      orgName.includes('ปฏิรูปที่ดิน')
    ) {
      tier3ByMinistry['กระทรวงเกษตรและสหกรณ์ / ทรัพยากรธรรมชาติ'].push(exec);
    } else if (
      orgName.includes('สาธารณสุข') ||
      orgName.includes('โรงพยาบาล') ||
      orgName.includes('พัฒนาสังคม') ||
      orgName.includes('คนไร้ที่พึ่ง') ||
      orgName.includes('สถานสงเคราะห์') ||
      orgName.includes('คนพิการ') ||
      orgName.includes('เด็กและครอบครัว')
    ) {
      tier3ByMinistry['กระทรวงสาธารณสุข / สังคมและความมั่นคงของมนุษย์'].push(exec);
    } else if (
      orgName.includes('คมนาคม') ||
      orgName.includes('ขนส่ง') ||
      orgName.includes('สถิติ') ||
      orgName.includes('ท่องเที่ยว') ||
      orgName.includes('กีฬา')
    ) {
      tier3ByMinistry['กระทรวงคมนาคม / ดิจิทัล / การท่องเที่ยวและกีฬา'].push(exec);
    } else {
      tier3ByMinistry['กระทรวงแรงงาน / วัฒนธรรม / พระพุทธศาสนา / การศึกษา'].push(exec);
    }
  });

  // Build Sections Output
  const sections: HierarchySection[] = [];

  // 1. Provincial Leadership
  if (tier1Execs.length > 0) {
    sections.push({
      id: 'tier1-leadership',
      title: 'ลำดับที่ ๑ : คณะผู้บริหารสูงสุดประจำจังหวัด',
      subtitle: 'ผู้ว่าราชการจังหวัด รองผู้ว่าราชการจังหวัด และฝ่ายความมั่นคงสูงสุด',
      iconName: 'Crown',
      order: 1,
      subsections: [
        {
          id: 'tier1-all',
          title: 'คณะผู้บริหารระดับสูงประจำจังหวัดปทุมธานี',
          description: 'กำหนดนโยบาย บัญชาการ และกำกับดูแลราชการแผ่นดินในพื้นที่จังหวัดปทุมธานี',
          executives: sortBySeniority(tier1Execs),
        },
      ],
    });
  }

  // 2. Provincial Administration & Governor's Office
  if (tier2Execs.length > 0) {
    sections.push({
      id: 'tier2-headquarters',
      title: 'ลำดับที่ ๒ : ที่ทำการปกครองและสำนักงานจังหวัด',
      subtitle: 'ฝ่ายอำนวยการ ยุทธศาสตร์ บูรณาการพัฒนาจังหวัด และการบริหารงานปกครอง',
      iconName: 'Building2',
      order: 2,
      subsections: [
        {
          id: 'tier2-all',
          title: 'ปลัดจังหวัด หัวหน้าสำนักงานจังหวัด และหัวหน้ากลุ่มงานอำนวยการ',
          description: 'ศูนย์ประสานงานขับเคลื่อนยุทธศาสตร์และงานปกครองศาลากลางจังหวัด',
          executives: sortBySeniority(tier2Execs),
        },
      ],
    });
  }

  // 3. Provincial Departmental Agencies
  const tier3Subsections: HierarchySubsection[] = [];
  for (const [groupName, list] of Object.entries(tier3ByMinistry)) {
    if (list.length > 0) {
      tier3Subsections.push({
        id: `tier3-${groupName}`,
        title: groupName,
        executives: sortBySeniority(list),
      });
    }
  }
  if (tier3Subsections.length > 0) {
    sections.push({
      id: 'tier3-agencies',
      title: 'ลำดับที่ ๓ : หัวหน้าส่วนราชการประจำจังหวัด',
      subtitle: 'หน่วยงานสังกัดส่วนกลางและส่วนภูมิภาคประจำจังหวัด ครอบคลุมทุกกระทรวง ทบวง กรม',
      iconName: 'Shield',
      order: 3,
      subsections: tier3Subsections,
    });
  }

  // 4. District Administration
  const tier4Subsections: HierarchySubsection[] = [];
  for (const [distName, list] of Object.entries(tier4ByDistrict)) {
    if (list.length > 0) {
      tier4Subsections.push({
        id: `tier4-${distName}`,
        title: `ที่ว่าการ${distName}`,
        description: 'นายอำเภอ ปลัดอำเภอ และหัวหน้าส่วนราชการระดับอำเภอ',
        executives: sortBySeniority(list),
      });
    }
  }
  if (tier4Subsections.length > 0) {
    sections.push({
      id: 'tier4-districts',
      title: 'ลำดับที่ ๔ : ส่วนราชการระดับอำเภอ (๗ อำเภอ)',
      subtitle: 'การบริหารราชการระดับอำเภอ บำบัดทุกข์ บำรุงสุขแก่ประชาชนในพื้นที่',
      iconName: 'Landmark',
      order: 4,
      subsections: tier4Subsections,
    });
  }

  // 5. Local Government Administration (อปท.)
  const tier5Subsections: HierarchySubsection[] = [];
  for (const [orgType, list] of Object.entries(tier5ByOrgType)) {
    if (list.length > 0) {
      tier5Subsections.push({
        id: `tier5-${orgType}`,
        title: orgType,
        description: 'คณะผู้บริหารองค์กรปกครองส่วนท้องถิ่น',
        executives: sortBySeniority(list),
      });
    }
  }
  if (tier5Subsections.length > 0) {
    sections.push({
      id: 'tier5-local',
      title: 'ลำดับที่ ๕ : องค์กรปกครองส่วนท้องถิ่น (อปท.)',
      subtitle: 'องค์การบริหารส่วนจังหวัด (อบจ.) เทศบาลนคร เทศบาลเมือง เทศบาลตำบล และ อบต.',
      iconName: 'Users',
      order: 5,
      subsections: tier5Subsections,
    });
  }

  return sections;
}
