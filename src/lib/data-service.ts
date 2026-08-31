import {
  INITIAL_ORGANIZATIONS,
  INITIAL_EXECUTIVES,
  INITIAL_HISTORIES,
  INITIAL_AUDIT_LOGS,
  BundledOrganization,
  BundledExecutive,
} from './database-store';

// In-memory runtime state for Cloudflare Serverless instances
const inMemoryOrgs: BundledOrganization[] = [...INITIAL_ORGANIZATIONS];
const inMemoryExecs: BundledExecutive[] = [...INITIAL_EXECUTIVES];
const inMemoryHistories: any[] = [...INITIAL_HISTORIES];
const inMemoryLogs: any[] = [...INITIAL_AUDIT_LOGS];

export interface ExecutiveQueryParams {
  query?: string;
  level?: string;
  province?: string;
  district?: string;
  category?: string;
  organizationId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function getExecutives(params: ExecutiveQueryParams = {}) {
  const {
    query = '',
    level = 'ALL',
    province = '',
    district = '',
    category = '',
    organizationId = '',
    status = '',
    limit = 1000,
    offset = 0,
  } = params;

  let filtered = [...inMemoryExecs];

  if (level && level !== 'ALL') {
    filtered = filtered.filter((e) => e.organization?.level === level);
  }
  if (province) {
    filtered = filtered.filter((e) => e.organization?.province === province);
  }
  if (district) {
    filtered = filtered.filter((e) => e.organization?.district === district);
  }
  if (category) {
    filtered = filtered.filter((e) => e.organization?.category === category);
  }
  if (organizationId) {
    filtered = filtered.filter((e) => e.organizationId === organizationId);
  }
  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (query) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter((e) => {
      const full = `${e.prefix || ''} ${e.firstName} ${e.lastName} ${e.position} ${e.positionLevel || ''} ${e.organization?.name || ''} ${e.organization?.province || ''} ${e.organization?.district || ''}`.toLowerCase();
      return full.includes(q);
    });
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return { total, data: paginated };
}

export async function getExecutiveById(id: string) {
  const exec = inMemoryExecs.find((e) => e.id === id);
  if (!exec) return null;
  const histories = inMemoryHistories.filter((h) => h.executiveId === id);
  return {
    ...exec,
    histories,
  };
}

export async function createExecutiveRecord(data: any) {
  const newId = 'exec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const org = inMemoryOrgs.find((o) => o.id === data.organizationId);

  const newExec: BundledExecutive = {
    id: newId,
    prefix: data.prefix,
    firstName: data.firstName,
    lastName: data.lastName,
    position: data.position,
    positionLevel: data.positionLevel || 'นักบริหารระดับสูง',
    organizationId: data.organizationId,
    organization: org || null,
    status: data.status || 'ACTIVE',
    appointmentDate: data.appointmentDate || null,
    endDate: data.endDate || null,
    orderReference: data.orderReference || null,
    phone: data.phone || null,
    email: data.email || null,
    avatarUrl: data.avatarUrl || null,
    photoVerified: Boolean(data.photoVerified),
    photoSource: data.photoSource || null,
    bio: data.bio || null,
    orderIndex: Number(data.orderIndex) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    histories: [],
  };

  inMemoryExecs.unshift(newExec);

  // Position history
  const history = {
    id: 'hist_' + Date.now(),
    executiveId: newId,
    previousPosition: null,
    newPosition: data.position,
    organizationName: org?.name || 'หน่วยงาน',
    effectiveDate: data.appointmentDate || new Date().toISOString(),
    orderReference: data.orderReference || 'คำสั่งแต่งตั้งเริ่มต้น',
    notes: 'บันทึกเข้าสู่ระบบครั้งแรก',
    createdAt: new Date().toISOString(),
  };
  inMemoryHistories.unshift(history);

  // Audit log
  inMemoryLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'CREATE',
    entityType: 'EXECUTIVE',
    entityId: newId,
    title: `เพิ่มรายชื่อผู้บริหาร: ${data.prefix}${data.firstName} ${data.lastName} (${data.position})`,
    details: JSON.stringify(newExec),
    performedBy: data.adminName || 'ผู้ดูแลระบบ',
    timestamp: new Date().toISOString(),
  });

  return newExec;
}

export async function updateExecutiveRecord(id: string, data: any) {
  const index = inMemoryExecs.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const existing = inMemoryExecs[index];
  const org = data.organizationId ? inMemoryOrgs.find((o) => o.id === data.organizationId) || existing.organization : existing.organization;

  const isPositionChanged =
    data.isTransfer ||
    (data.position && data.position !== existing.position) ||
    (data.organizationId && data.organizationId !== existing.organizationId);

  const updated: BundledExecutive = {
    ...existing,
    prefix: data.prefix ?? existing.prefix,
    firstName: data.firstName ?? existing.firstName,
    lastName: data.lastName ?? existing.lastName,
    position: data.position ?? existing.position,
    positionLevel: data.positionLevel ?? existing.positionLevel,
    organizationId: data.organizationId ?? existing.organizationId,
    organization: org,
    status: data.status ?? existing.status,
    appointmentDate: data.appointmentDate ?? existing.appointmentDate,
    endDate: data.endDate ?? existing.endDate,
    orderReference: data.orderReference ?? existing.orderReference,
    phone: data.phone ?? existing.phone,
    email: data.email ?? existing.email,
    avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl,
    photoVerified: data.photoVerified !== undefined ? Boolean(data.photoVerified) : existing.photoVerified,
    photoSource: data.photoSource !== undefined ? data.photoSource : existing.photoSource,
    bio: data.bio ?? existing.bio,
    orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : existing.orderIndex,
    updatedAt: new Date().toISOString(),
  };

  inMemoryExecs[index] = updated;

  if (isPositionChanged) {
    inMemoryHistories.unshift({
      id: 'hist_' + Date.now(),
      executiveId: id,
      previousPosition: existing.position,
      newPosition: updated.position,
      organizationName: org?.name || 'หน่วยงาน',
      effectiveDate: data.appointmentDate || new Date().toISOString(),
      orderReference: data.orderReference || 'คำสั่งโยกย้าย/ปรับปรุงตำแหน่ง',
      notes: data.transferNotes || `ปรับปรุงตำแหน่งจาก "${existing.position}" เป็น "${updated.position}"`,
      createdAt: new Date().toISOString(),
    });
  }

  inMemoryLogs.unshift({
    id: 'log_' + Date.now(),
    action: isPositionChanged ? 'TRANSFER' : 'UPDATE',
    entityType: 'EXECUTIVE',
    entityId: id,
    title: isPositionChanged
      ? `โยกย้าย/ปรับตำแหน่ง: ${updated.prefix}${updated.firstName} ${updated.lastName} สู่ ${updated.position}`
      : `แก้ไขข้อมูลผู้บริหาร: ${updated.prefix}${updated.firstName} ${updated.lastName}`,
    details: JSON.stringify({ before: existing, after: updated }),
    performedBy: data.adminName || 'ผู้ดูแลระบบ',
    timestamp: new Date().toISOString(),
  });

  return updated;
}

export async function deleteExecutiveRecord(id: string) {
  const index = inMemoryExecs.findIndex((e) => e.id === id);
  if (index === -1) return false;

  const existing = inMemoryExecs[index];
  inMemoryExecs.splice(index, 1);

  inMemoryLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'DELETE',
    entityType: 'EXECUTIVE',
    entityId: id,
    title: `ลบข้อมูลผู้บริหาร: ${existing.prefix}${existing.firstName} ${existing.lastName} (${existing.position})`,
    details: JSON.stringify(existing),
    performedBy: 'ผู้ดูแลระบบ',
    timestamp: new Date().toISOString(),
  });

  return true;
}

export async function getOrganizations(params: { level?: string; province?: string; category?: string; parentId?: string; query?: string } = {}) {
  const { level = 'ALL', province = '', category = '', parentId = '', query = '' } = params;

  let filtered = [...inMemoryOrgs];
  if (level && level !== 'ALL') filtered = filtered.filter((o) => o.level === level);
  if (province) filtered = filtered.filter((o) => o.province === province);
  if (category) filtered = filtered.filter((o) => o.category === category);
  if (parentId) filtered = filtered.filter((o) => (parentId === 'ROOT' ? !o.parentId : o.parentId === parentId));
  if (query) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter((o) =>
      o.name.toLowerCase().includes(q) ||
      (o.category && o.category.toLowerCase().includes(q)) ||
      (o.province && o.province.toLowerCase().includes(q))
    );
  }

  return filtered.map((o) => ({
    ...o,
    _count: {
      executives: inMemoryExecs.filter((e) => e.organizationId === o.id).length,
      children: inMemoryOrgs.filter((c) => c.parentId === o.id).length,
    },
  }));
}

export async function getOrganizationById(id: string) {
  const org = inMemoryOrgs.find((o) => o.id === id);
  if (!org) return null;
  const parent = org.parentId ? inMemoryOrgs.find((p) => p.id === org.parentId) : null;
  const children = inMemoryOrgs.filter((c) => c.parentId === id);
  const executives = inMemoryExecs.filter((e) => e.organizationId === id);
  return {
    ...org,
    parent,
    children,
    executives,
  };
}

export async function createOrganizationRecord(data: any) {
  const newId = 'org_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newOrg: BundledOrganization = {
    id: newId,
    code: data.code || null,
    name: data.name,
    nameEn: data.nameEn || null,
    level: data.level,
    category: data.category,
    ministry: data.ministry || null,
    province: data.province || null,
    district: data.district || null,
    parentId: data.parentId || null,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    orderIndex: Number(data.orderIndex) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryOrgs.push(newOrg);
  return newOrg;
}

export async function updateOrganizationRecord(id: string, data: any) {
  const index = inMemoryOrgs.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const existing = inMemoryOrgs[index];
  const updated: BundledOrganization = {
    ...existing,
    code: data.code ?? existing.code,
    name: data.name ?? existing.name,
    nameEn: data.nameEn ?? existing.nameEn,
    level: data.level ?? existing.level,
    category: data.category ?? existing.category,
    ministry: data.ministry ?? existing.ministry,
    province: data.province ?? existing.province,
    district: data.district ?? existing.district,
    parentId: data.parentId !== undefined ? data.parentId : existing.parentId,
    address: data.address ?? existing.address,
    phone: data.phone ?? existing.phone,
    email: data.email ?? existing.email,
    website: data.website ?? existing.website,
    orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : existing.orderIndex,
    updatedAt: new Date().toISOString(),
  };

  inMemoryOrgs[index] = updated;
  return updated;
}

export async function deleteOrganizationRecord(id: string) {
  const index = inMemoryOrgs.findIndex((o) => o.id === id);
  if (index === -1) return false;
  inMemoryOrgs.splice(index, 1);
  return true;
}

export async function getStats() {
  const totalExecutives = inMemoryExecs.length;
  const activeCount = inMemoryExecs.filter((e) => e.status === 'ACTIVE').length;
  const actingCount = inMemoryExecs.filter((e) => e.status === 'ACTING').length;
  const vacantCount = inMemoryExecs.filter((e) => e.status === 'VACANT').length;
  const retiredCount = inMemoryExecs.filter((e) => e.status === 'RETIRED').length;
  const totalOrganizations = inMemoryOrgs.length;
  const centralCount = inMemoryExecs.filter((e) => e.organization?.level === 'CENTRAL').length;
  const provincialCount = inMemoryExecs.filter((e) => e.organization?.level === 'PROVINCIAL').length;
  const districtCount = inMemoryExecs.filter((e) => e.organization?.level === 'DISTRICT').length;
  const localCount = inMemoryExecs.filter((e) => e.organization?.level === 'LOCAL').length;

  const categoryCounts: Record<string, number> = {};
  inMemoryOrgs.forEach((o) => {
    categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
  });
  const orgsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    _count: { id: count },
  }));

  return {
    executives: {
      total: totalExecutives,
      active: activeCount,
      acting: actingCount,
      vacant: vacantCount,
      retired: retiredCount,
    },
    byLevel: {
      central: centralCount,
      provincial: provincialCount,
      district: districtCount,
      local: localCount,
    },
    organizations: {
      total: totalOrganizations,
      byCategory: orgsByCategory,
    },
    recentUpdates: inMemoryLogs.slice(0, 10),
  };
}
