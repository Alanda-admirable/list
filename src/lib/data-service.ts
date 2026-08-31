import { prisma } from './prisma';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_EXECUTIVES,
  BundledOrganization,
  BundledExecutive,
} from './database-store';

// In-memory runtime state for Cloudflare Serverless instances
const inMemoryOrgs: BundledOrganization[] = [...INITIAL_ORGANIZATIONS];
const inMemoryExecs: BundledExecutive[] = [...INITIAL_EXECUTIVES];

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

  try {
    const where: any = {};
    if (level && level !== 'ALL') where.organization = { ...where.organization, level };
    if (province) where.organization = { ...where.organization, province };
    if (district) where.organization = { ...where.organization, district };
    if (category) where.organization = { ...where.organization, category };
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    if (query) {
      const q = query.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { position: { contains: q } },
        { positionLevel: { contains: q } },
        { organization: { name: { contains: q } } },
        { organization: { province: { contains: q } } },
        { organization: { district: { contains: q } } },
      ];
    }

    const [total, executives] = await Promise.all([
      prisma.executive.count({ where }),
      prisma.executive.findMany({
        where,
        include: {
          organization: true,
          histories: {
            orderBy: { effectiveDate: 'desc' },
            take: 5,
          },
        },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
    ]);

    if (executives && executives.length > 0) {
      return { total, data: executives };
    }
  } catch (error) {
    console.warn('Prisma query failed, using in-memory store:', error);
  }

  // Fallback to in-memory store
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
  try {
    const exec = await prisma.executive.findUnique({
      where: { id },
      include: {
        organization: true,
        histories: { orderBy: { effectiveDate: 'desc' } },
      },
    });
    if (exec) return exec;
  } catch (err) {
    console.warn('Prisma getExecutiveById failed:', err);
  }

  return inMemoryExecs.find((e) => e.id === id) || null;
}

export async function getOrganizations(params: { level?: string; province?: string; category?: string; parentId?: string; query?: string } = {}) {
  const { level = 'ALL', province = '', category = '', parentId = '', query = '' } = params;

  try {
    const where: any = {};
    if (level && level !== 'ALL') where.level = level;
    if (province) where.province = province;
    if (category) where.category = category;
    if (parentId) where.parentId = parentId === 'ROOT' ? null : parentId;
    if (query) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { nameEn: { contains: q } },
        { category: { contains: q } },
        { province: { contains: q } },
        { district: { contains: q } },
      ];
    }

    const orgs = await prisma.organization.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: { select: { executives: true, children: true } },
      },
      orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }, { name: 'asc' }],
    });

    if (orgs && orgs.length > 0) return orgs;
  } catch (err) {
    console.warn('Prisma getOrganizations failed:', err);
  }

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

export async function getStats() {
  try {
    const [totalExecs, activeExecs, actingExecs, vacantExecs, retiredExecs, totalOrgs] = await Promise.all([
      prisma.executive.count(),
      prisma.executive.count({ where: { status: 'ACTIVE' } }),
      prisma.executive.count({ where: { status: 'ACTING' } }),
      prisma.executive.count({ where: { status: 'VACANT' } }),
      prisma.executive.count({ where: { status: 'RETIRED' } }),
      prisma.organization.count(),
    ]);

    if (totalExecs > 0) {
      return {
        executives: {
          total: totalExecs,
          active: activeExecs,
          acting: actingExecs,
          vacant: vacantExecs,
          retired: retiredExecs,
        },
        organizations: {
          total: totalOrgs,
        },
      };
    }
  } catch (err) {
    console.warn('Prisma getStats failed:', err);
  }

  return {
    executives: {
      total: inMemoryExecs.length,
      active: inMemoryExecs.filter((e) => e.status === 'ACTIVE').length,
      acting: inMemoryExecs.filter((e) => e.status === 'ACTING').length,
      vacant: inMemoryExecs.filter((e) => e.status === 'VACANT').length,
      retired: inMemoryExecs.filter((e) => e.status === 'RETIRED').length,
    },
    organizations: {
      total: inMemoryOrgs.length,
    },
  };
}
