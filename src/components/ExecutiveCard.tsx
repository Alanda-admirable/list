'use client';

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  ExternalLink,
  Edit3,
  FileText,
  Calendar,
} from 'lucide-react';
import { STATUS_LABELS } from '@/lib/thai-data';

export interface Executive {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  positionLevel?: string | null;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    level: string;
    category: string;
    province?: string | null;
    district?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
  status: 'ACTIVE' | 'ACTING' | 'VACANT' | 'RETIRED' | string;
  appointmentDate?: string | null;
  endDate?: string | null;
  orderReference?: string | null;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  orderIndex: number;
  updatedAt?: string;
  histories?: Array<{
    id: string;
    previousPosition?: string | null;
    newPosition: string;
    organizationName: string;
    effectiveDate: string;
    orderReference?: string | null;
    notes?: string | null;
  }>;
}

interface CardProps {
  executive: Executive;
  onSelect: (executive: Executive) => void;
  onEdit?: (executive: Executive) => void;
  isAdmin?: boolean;
}

export default function ExecutiveCard({
  executive,
  onSelect,
  onEdit,
  isAdmin = false,
}: CardProps) {
  const statusInfo = STATUS_LABELS[executive.status] || STATUS_LABELS.ACTIVE;

  const levelBadge = {
    CENTRAL: { label: 'ส่วนราชการ (ส่วนกลาง)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    PROVINCIAL: { label: 'ส่วนภูมิภาค (จังหวัด)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    DISTRICT: { label: 'ระดับอำเภอ', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    LOCAL: { label: 'ท้องถิ่น (อปท.)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  }[executive.organization?.level || 'CENTRAL'] || {
    label: 'ทั่วไป',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const isVacant = executive.status === 'VACANT';

  return (
    <div
      onClick={() => onSelect(executive)}
      className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-200/90 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${levelBadge.color}`}>
            {levelBadge.label}
          </span>

          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.label}</span>
          </span>
        </div>

        {/* Profile Header */}
        <div className="flex items-start space-x-3.5 mb-3.5">
          {/* Avatar Portrait */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-inner group-hover:border-blue-500 transition-colors">
              {executive.avatarUrl && !isVacant ? (
                <img
                  src={executive.avatarUrl}
                  alt={`${executive.firstName} ${executive.lastName}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                          <svg class="w-8 h-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span class="text-[8px] text-slate-400 font-medium">รอรูปถ่าย</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <User className="w-8 h-8 text-slate-300" />
                  <span className="text-[8px] text-slate-400 font-medium">รอรูปถ่าย</span>
                </div>
              )}
            </div>
          </div>

          {/* Titles & Name */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate font-heading group-hover:text-blue-600 transition-colors">
              {isVacant ? (
                <span className="text-rose-600 font-semibold">(ตำแหน่งว่าง)</span>
              ) : (
                `${executive.prefix || ''} ${executive.firstName} ${executive.lastName}`
              )}
            </h4>

            <p className="text-xs font-semibold text-blue-900 line-clamp-2 mt-0.5">
              {executive.position}
            </p>

            {executive.positionLevel && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                ระดับ: {executive.positionLevel}
              </p>
            )}
          </div>
        </div>

        {/* Organization / Agency details */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 mb-3 border border-slate-100 text-xs space-y-1">
          <div className="flex items-center text-slate-700 font-medium truncate">
            <Building className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
            <span className="truncate">{executive.organization?.name}</span>
          </div>

          {(executive.organization?.province || executive.organization?.district) && (
            <div className="flex items-center text-slate-500 text-[11px] truncate">
              <MapPin className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
              <span>
                {executive.organization.district ? `อ.${executive.organization.district} ` : ''}
                {executive.organization.province ? `จ.${executive.organization.province}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Appointment date / Order reference if available */}
        {executive.appointmentDate && (
          <div className="flex items-center text-[11px] text-slate-500 mb-2">
            <Calendar className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
            <span>
              ดำรงตำแหน่งเมื่อ:{' '}
              {new Date(executive.appointmentDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer Contact & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          {executive.phone && (
            <a
              href={`tel:${executive.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              title={`โทร: ${executive.phone}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {executive.email && (
            <a
              href={`mailto:${executive.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              title={`อีเมล: ${executive.email}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
          {executive.orderReference && (
            <span
              className="p-1.5 text-slate-400 hover:text-slate-600"
              title={`คำสั่งแต่งตั้ง: ${executive.orderReference}`}
            >
              <FileText className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {isAdmin && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(executive);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
              title="แก้ไขข้อมูล"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </button>
          )}

          <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-700 flex items-center">
            รายละเอียด
            <ExternalLink className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
}
