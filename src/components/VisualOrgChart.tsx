'use client';

import React, { useState } from 'react';
import {
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Executive } from './ExecutiveCard';

export interface OrgNode {
  id: string;
  name: string;
  nameEn?: string | null;
  level: string;
  category: string;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  executives: Executive[];
  children?: OrgNode[];
}

interface VisualOrgChartProps {
  nodes: OrgNode[];
  onSelectExecutive: (executive: Executive) => void;
  onDrillDown?: (node: OrgNode) => void;
  searchQuery?: string;
}

// Node Card in Top-Down Visual Chart
function VisualNodeCard({
  node,
  onSelectExecutive,
  onDrillDown,
}: {
  node: OrgNode;
  onSelectExecutive: (executive: Executive) => void;
  onDrillDown?: (node: OrgNode) => void;
  isRoot?: boolean;
}) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const hasChildren = node.children && node.children.length > 0;
  const primaryExec = node.executives && node.executives.length > 0 ? node.executives[0] : null;
  const otherExecs = node.executives && node.executives.length > 1 ? node.executives.slice(1) : [];

  const levelStyles = {
    CENTRAL: {
      card: 'border-purple-300 bg-gradient-to-b from-purple-50/90 to-white hover:border-purple-500 shadow-purple-100/60',
      header: 'bg-purple-900 text-white',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      tag: 'ส่วนราชการ (ส่วนกลาง)',
    },
    PROVINCIAL: {
      card: 'border-blue-300 bg-gradient-to-b from-blue-50/90 to-white hover:border-blue-500 shadow-blue-100/60',
      header: 'bg-blue-900 text-white',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      tag: 'ราชการส่วนภูมิภาค',
    },
    DISTRICT: {
      card: 'border-teal-300 bg-gradient-to-b from-teal-50/90 to-white hover:border-teal-500 shadow-teal-100/60',
      header: 'bg-teal-800 text-white',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      tag: 'ส่วนราชการระดับอำเภอ',
    },
    LOCAL: {
      card: 'border-amber-300 bg-gradient-to-b from-amber-50/90 to-white hover:border-amber-500 shadow-amber-100/60',
      header: 'bg-amber-800 text-white',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      tag: 'องค์กรปกครองส่วนท้องถิ่น',
    },
  }[node.level] || {
    card: 'border-slate-300 bg-white hover:border-slate-400',
    header: 'bg-slate-800 text-white',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    tag: 'หน่วยงาน',
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Box */}
      <div
        className={`w-72 sm:w-80 rounded-2xl border-2 ${levelStyles.card} shadow-md transition-all duration-200 relative group overflow-hidden z-10`}
      >
        {/* Top Mini Banner */}
        <div className={`${levelStyles.header} px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold`}>
          <div className="flex items-center space-x-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{node.category}</span>
          </div>
          {node.district && (
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium flex-shrink-0">
              อ.{node.district}
            </span>
          )}
        </div>

        <div className="p-3.5 space-y-3">
          {/* Org Title */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading leading-snug line-clamp-2">
              {node.name}
            </h4>
            {node.province && (
              <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                <span>จ.{node.province} {node.district ? `(${node.district})` : ''}</span>
              </p>
            )}
          </div>

          {/* Primary Executive */}
          {primaryExec ? (
            <div
              onClick={() => onSelectExecutive({ ...primaryExec, organization: node })}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer shadow-xs group/exec"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 relative">
                  {primaryExec.avatarUrl && primaryExec.status !== 'VACANT' ? (
                    <img
                      src={primaryExec.avatarUrl}
                      alt={primaryExec.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                  {primaryExec.status === 'ACTIVE' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover/exec:text-blue-700">
                    {primaryExec.status === 'VACANT'
                      ? '(ตำแหน่งว่าง)'
                      : `${primaryExec.prefix || ''} ${primaryExec.firstName} ${primaryExec.lastName}`}
                  </div>
                  <div className="text-[11px] text-blue-900 font-semibold truncate mt-0.5">
                    {primaryExec.position}
                  </div>
                  {primaryExec.phone && (
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      📞 {primaryExec.phone.split(/[\,\s]/)[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-slate-100/70 text-center text-[11px] text-slate-500 font-medium">
              ไม่มีข้อมูลผู้บริหารระบุไว้
            </div>
          )}

          {/* Other Deputies / Executives if any */}
          {otherExecs.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-medium text-slate-500">
                รอง/คณะผู้บริหาร ({otherExecs.length})
              </span>
              <div className="flex -space-x-1.5 overflow-hidden">
                {otherExecs.slice(0, 3).map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    onClick={() => onSelectExecutive({ ...ex, organization: node })}
                    title={`${ex.prefix || ''} ${ex.firstName} ${ex.lastName} (${ex.position})`}
                    className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                  >
                    {ex.firstName.substring(0, 1)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Child Toggle Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>ยุบสายงาน ({node.children?.length})</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>ขยายสายงาน ({node.children?.length})</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">หน่วยงานปลายสาย</span>
            )}

            {onDrillDown && hasChildren && (
              <button
                onClick={() => onDrillDown(node)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                title="เจาะลึกดูเฉพาะสายงานนี้"
              >
                <span>เจาะลึก</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Downward Tree Branching Connectors */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical Connector Line from Parent to Child Bar */}
          <div className="w-0.5 h-8 bg-slate-300 relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
          </div>

          {/* Horizontal Children Grid / Flow Container */}
          <div className="relative pt-2">
            <div className="flex flex-wrap justify-center gap-8 relative items-start">
              {node.children?.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Small top stub line */}
                  <div className="w-0.5 h-4 bg-slate-300 mb-2" />
                  <VisualNodeCard
                    node={child}
                    onSelectExecutive={onSelectExecutive}
                    onDrillDown={onDrillDown}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisualOrgChart({
  nodes,
  onSelectExecutive,
  onDrillDown,
  searchQuery = '',
}: VisualOrgChartProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-sm space-y-2">
        <Building2 className="w-12 h-12 mx-auto text-slate-300" />
        <p className="font-bold text-base text-slate-700">ไม่พบโครงสร้างองค์กรตามเงื่อนไขที่ระบุ</p>
        <p className="text-xs text-slate-400">กรุณาเลือกระดับหรือจังหวัดอื่นเพื่อแสดงผล</p>
      </div>
    );
  }

  // Filter root nodes if searchQuery is provided
  const filterNode = (node: OrgNode, q: string): boolean => {
    if (!q) return true;
    const lower = q.toLowerCase();
    const matchesOrg = node.name.toLowerCase().includes(lower) || (node.district && node.district.toLowerCase().includes(lower));
    const matchesExec = node.executives.some(
      (e) =>
        e.firstName.toLowerCase().includes(lower) ||
        e.lastName.toLowerCase().includes(lower) ||
        e.position.toLowerCase().includes(lower)
    );
    const matchesChild = node.children ? node.children.some((c) => filterNode(c, q)) : false;
    return matchesOrg || matchesExec || matchesChild;
  };

  const filteredNodes = searchQuery
    ? nodes.filter((n) => filterNode(n, searchQuery))
    : nodes;

  return (
    <div className="w-full overflow-x-auto pb-12 pt-4 px-2 select-none">
      <div className="min-w-fit flex flex-col items-center space-y-12 mx-auto">
        {filteredNodes.map((rootNode) => (
          <div key={rootNode.id} className="flex flex-col items-center w-full">
            <VisualNodeCard
              node={rootNode}
              onSelectExecutive={onSelectExecutive}
              onDrillDown={onDrillDown}
              isRoot={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
