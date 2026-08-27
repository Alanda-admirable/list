'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building,
  User,
  MapPin,
} from 'lucide-react';
import { Executive } from './ExecutiveCard';
import { STATUS_LABELS } from '@/lib/thai-data';

interface OrgNode {
  id: string;
  name: string;
  nameEn?: string | null;
  level: string;
  category: string;
  province?: string | null;
  district?: string | null;
  phone?: string | null;
  executives: Executive[];
  children?: OrgNode[];
}

interface TreeProps {
  nodes: OrgNode[];
  onSelectExecutive: (executive: Executive) => void;
}

function TreeNode({
  node,
  onSelectExecutive,
  level = 0,
}: {
  node: OrgNode;
  onSelectExecutive: (executive: Executive) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const levelColor = {
    CENTRAL: 'border-l-purple-500 bg-purple-50/40 text-purple-900',
    PROVINCIAL: 'border-l-blue-500 bg-blue-50/40 text-blue-900',
    DISTRICT: 'border-l-teal-500 bg-teal-50/40 text-teal-900',
    LOCAL: 'border-l-amber-500 bg-amber-50/40 text-amber-900',
  }[node.level] || 'border-l-slate-400 bg-slate-50 text-slate-800';

  const badgeColor = {
    CENTRAL: 'bg-purple-100 text-purple-800 border-purple-200',
    PROVINCIAL: 'bg-blue-100 text-blue-800 border-blue-200',
    DISTRICT: 'bg-teal-100 text-teal-800 border-teal-200',
    LOCAL: 'bg-amber-100 text-amber-800 border-amber-200',
  }[node.level] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div className="relative my-2">
      {/* Node Card */}
      <div
        className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all border-l-4 ${levelColor}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Org Header */}
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded-lg hover:bg-slate-200/70 text-slate-600 transition-colors"
                title={expanded ? 'ย่อกิ่งสาขา' : 'ขยายกิ่งสาขา'}
              >
                {expanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}

            {!hasChildren && (
              <div className="p-1 text-slate-400">
                <Building className="w-4 h-4" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {node.category}
                </span>
                {node.province && (
                  <span className="text-[10px] text-slate-500 flex items-center">
                    <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                    {node.district ? `อ.${node.district} ` : ''}จ.{node.province}
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 font-heading mt-0.5">
                {node.name}
              </h4>
            </div>
          </div>

          {/* Child Count Indicator */}
          {hasChildren && (
            <div className="text-xs text-slate-500 font-medium sm:text-right">
              {node.children?.length} หน่วยงานย่อย
            </div>
          )}
        </div>

        {/* Executives under this organization */}
        {node.executives && node.executives.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2">
            {node.executives.map((exec) => {
              const statusInfo = STATUS_LABELS[exec.status] || STATUS_LABELS.ACTIVE;
              const isVacant = exec.status === 'VACANT';

              return (
                <div
                  key={exec.id}
                  onClick={() => onSelectExecutive({ ...exec, organization: node })}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500">
                      {exec.avatarUrl && !isVacant ? (
                        <img
                          src={exec.avatarUrl}
                          alt={exec.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                        {isVacant
                          ? '(ตำแหน่งว่าง)'
                          : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                      </div>
                      <div className="text-[11px] text-blue-900 truncate font-medium">
                        {exec.position}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusInfo.bg} ${statusInfo.border}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Children Sub-trees */}
      {hasChildren && expanded && (
        <div className="pl-4 sm:pl-8 border-l-2 border-dashed border-slate-300 ml-4 mt-2 space-y-2">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onSelectExecutive={onSelectExecutive}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartTree({ nodes, onSelectExecutive }: TreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
        <Building className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="font-semibold text-sm">ไม่พบโครงสร้างองค์กรที่ตรงกับเงื่อนไข</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nodes.map((rootNode) => (
        <TreeNode
          key={rootNode.id}
          node={rootNode}
          onSelectExecutive={onSelectExecutive}
        />
      ))}
    </div>
  );
}
