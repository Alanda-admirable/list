const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting avatar assignment for all executives...');
  const executives = await prisma.executive.findMany({
    include: {
      organization: true,
    },
  });

  console.log(`Found ${executives.length} executives.`);

  let updatedCount = 0;

  for (let i = 0; i < executives.length; i++) {
    const exec = executives[i];
    if (exec.status === 'VACANT') {
      continue;
    }

    const fullName = `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`.trim();
    const pos = (exec.position || '').toLowerCase();
    const prefix = (exec.prefix || '').trim();
    const orgLevel = exec.organization?.level || 'CENTRAL';

    let avatar = '/avatars/male_senior.jpg';

    // 1. Specific VIPs
    if (exec.firstName.includes('เอกวิทย์') && exec.lastName.includes('มีเพียร')) {
      avatar = '/avatars/governor.jpg';
    } else if (exec.firstName.includes('คำรณวิทย์') && exec.lastName.includes('ธูปกระจ่าง')) {
      avatar = '/avatars/police_senior.jpg';
    } else if (exec.firstName.includes('ตรีลุพธ์') && exec.lastName.includes('ธูปกระจ่าง')) {
      avatar = '/avatars/police_captain.jpg';
    } else if (exec.firstName.includes('ชฏานุช') && exec.lastName.includes('มีเพียร')) {
      avatar = '/avatars/female_senior.jpg';
    } else if (exec.firstName.includes('กิตติศักดิ์') && exec.lastName.includes('วัฒนเดช')) {
      avatar = '/avatars/military_officer.jpg';
    } else if (exec.firstName.includes('สราวุธ') && exec.lastName.includes('พิมพ์จันทร์')) {
      avatar = '/avatars/military_officer.jpg';
    } else if (exec.firstName.includes('เดชา') && exec.lastName.includes('หานาม')) {
      avatar = '/avatars/military_officer.jpg';
    } else if (exec.firstName.includes('พงศธร')) {
      avatar = '/avatars/male_senior.jpg';
    } else if (exec.firstName.includes('องครักษ์')) {
      avatar = '/avatars/male_mid.jpg';
    } else if (exec.firstName.includes('ดงพล')) {
      avatar = '/avatars/male_senior.jpg';
    }
    // 2. Military Officer ranks
    else if (
      /^(พลเอก|พลโท|พลตรี|พันเอก|พันโท|พันตรี|ร้อยเอก|ร้อยโท|ร้อยตรี|พ\.อ\.|พ\.ท\.|พ\.ต\.|ร\.อ\.|ร\.ท\.|ร\.ต\.)/.test(prefix) ||
      pos.includes('กอ.รมน.') ||
      pos.includes('สัสดี') ||
      pos.includes('ทหาร')
    ) {
      avatar = '/avatars/military_officer.jpg';
    }
    // 3. Senior Police Ranks
    else if (
      /^(พล\.ต\.อ\.|พล\.ต\.ท\.|พล\.ต\.ต\.|พ\.ต\.อ\.|พ\.ต\.ท\.|พ\.ต\.ต\.|พลตำรวจ|พันตำรวจ)/.test(prefix) ||
      pos.includes('ผบก.') ||
      pos.includes('ผกก.')
    ) {
      avatar = '/avatars/police_senior.jpg';
    }
    // 4. Junior Police Ranks
    else if (
      /^(ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ร้อยตำรวจ)/.test(prefix) ||
      pos.includes('สารวัตร')
    ) {
      avatar = '/avatars/police_captain.jpg';
    }
    // 5. Female Officials
    else if (
      /^(นาง|นางสาว|น\.ส\.|พญ\.|แพทย์หญิง|ทันตแพทย์หญิง|เภสัชกรหญิง)/.test(prefix) ||
      prefix === 'นาง' ||
      prefix === 'นางสาว'
    ) {
      if (orgLevel === 'LOCAL' && (pos.includes('นายก') || pos.includes('ประธาน') || pos.includes('สมาชิก'))) {
        avatar = i % 2 === 0 ? '/avatars/female_suit.jpg' : '/avatars/female_senior.jpg';
      } else {
        avatar = i % 2 === 0 ? '/avatars/female_senior.jpg' : '/avatars/female_mid.jpg';
      }
    }
    // 6. Male Officials / Local Executives
    else {
      if (orgLevel === 'LOCAL' && (pos.includes('นายก') || pos.includes('ประธาน') || pos.includes('สมาชิก'))) {
        avatar = i % 2 === 0 ? '/avatars/male_suit.jpg' : '/avatars/male_mid.jpg';
      } else {
        avatar = i % 2 === 0 ? '/avatars/male_senior.jpg' : '/avatars/male_mid.jpg';
      }
    }

    await prisma.executive.update({
      where: { id: exec.id },
      data: { avatarUrl: avatar },
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} executives with official portraits!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
