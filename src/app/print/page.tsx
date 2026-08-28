import React from 'react';
import { prisma } from '@/lib/prisma';
import PrintClientView from '@/components/PrintClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrintPage() {
  const executives = await prisma.executive.findMany({
    include: {
      organization: true,
      histories: {
        orderBy: { effectiveDate: 'desc' },
        take: 3,
      },
    },
    orderBy: [
      { orderIndex: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Serialize dates for client components
  const serializedExecutives = JSON.parse(JSON.stringify(executives));

  return <PrintClientView initialExecutives={serializedExecutives} />;
}
