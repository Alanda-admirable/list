'use client';

import React from 'react';
import {
  X,
  Building,
  Phone,
  Mail,
  Calendar,
  FileText,
  User,
  History,
  Printer,
  Globe,
} from 'lucide-react';
import { Executive } from './ExecutiveCard';
import { STATUS_LABELS } from '@/lib/thai-data';

interface ModalProps {
  executive: Executive | null;
  onClose: () => void;
}

export default function ExecutiveModal({ executive, onClose }: ModalProps) {
  if (!executive) return null;

  const statusInfo = STATUS_LABELS[executive.status] || STATUS_LABELS.ACTIVE;
  const isVacant = executive.status === 'VACANT';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors no-print"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar Profile */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/10 border-4 border-white/20 shadow-xl flex-shrink-0">
              {executive.avatarUrl && !isVacant ? (
                <img
                  src={executive.avatarUrl}
                  alt={`${executive.firstName} ${executive.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Header Text */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {executive.organization?.category || 'หน่วยงานภาครัฐ'}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.border}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                {isVacant
                  ? 'ตำแหน่งว่าง (อยู่ระหว่างการสรรหา)'
                  : `${executive.prefix || ''} ${executive.firstName} ${executive.lastName}`}
              </h2>

              <p className="text-sm sm:text-base text-blue-200 font-medium mt-1">
                {executive.position}
              </p>

              {executive.positionLevel && (
                <p className="text-xs text-blue-300/80 mt-0.5">
                  ระดับตำแหน่ง: {executive.positionLevel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Organization & Location Info */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-blue-600" />
              ข้อมูลหน่วยงานและสถานที่ปฏิบัติราชการ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">สังกัดหน่วยงาน:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {executive.organization?.name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">ระดับการบริหาร:</span>
                <span className="font-semibold text-slate-800">
                  {executive.organization?.level === 'CENTRAL'
                    ? 'ราชการส่วนกลาง (กระทรวง/กรม)'
                    : executive.organization?.level === 'PROVINCIAL'
                    ? 'ราชการส่วนภูมิภาค (จังหวัด)'
                    : executive.organization?.level === 'DISTRICT'
                    ? 'ราชการระดับอำเภอ'
                    : 'องค์กรปกครองส่วนท้องถิ่น (อปท.)'}
                </span>
              </div>

              {(executive.organization?.province || executive.organization?.district) && (
                <div>
                  <span className="text-slate-500 block">พื้นที่รับผิดชอบ:</span>
                  <span className="font-medium text-slate-800">
                    {executive.organization.district ? `อำเภอ${executive.organization.district} ` : ''}
                    {executive.organization.province ? `จังหวัด${executive.organization.province}` : ''}
                  </span>
                </div>
              )}

              {executive.organization?.address && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">ที่อยู่สำนักงาน:</span>
                  <span className="text-slate-700">{executive.organization.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment & Order Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center text-slate-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>วันที่เริ่มดำรงตำแหน่ง</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {executive.appointmentDate
                  ? new Date(executive.appointmentDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'ไม่ระบุ'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center text-slate-500 text-xs mb-1">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                <span>คำสั่งแต่งตั้ง / ประกาศอ้างอิง</span>
              </div>
              <p className="text-xs font-medium text-slate-800 truncate" title={executive.orderReference || ''}>
                {executive.orderReference || 'คำสั่งตามระเบียบบริหารราชการแผ่นดิน'}
              </p>
            </div>
          </div>

          {/* Contact Channels */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <Phone className="w-4 h-4 mr-1.5 text-emerald-600" />
              ช่องทางการติดต่อราชการ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {executive.phone ? (
                <a
                  href={`tel:${executive.phone}`}
                  className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-800 text-xs"
                >
                  <Phone className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                  <span className="truncate">{executive.phone}</span>
                </a>
              ) : (
                <div className="flex items-center p-3 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>ไม่มีเบอร์โทรศัพท์</span>
                </div>
              )}

              {executive.email ? (
                <a
                  href={`mailto:${executive.email}`}
                  className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-slate-800 text-xs"
                >
                  <Mail className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="truncate">{executive.email}</span>
                </a>
              ) : (
                <div className="flex items-center p-3 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>ไม่มีอีเมล</span>
                </div>
              )}

              {executive.organization?.website ? (
                <a
                  href={executive.organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-slate-800 text-xs"
                >
                  <Globe className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                  <span className="truncate">เว็บไซต์หน่วยงาน</span>
                </a>
              ) : (
                <div className="flex items-center p-3 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>ไม่มีเว็บไซต์</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / Key Policies */}
          {executive.bio && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-slate-700">
              <span className="font-bold text-amber-900 block mb-1">
                วิสัยทัศน์ / ภารกิจสำคัญ:
              </span>
              <p className="leading-relaxed">{executive.bio}</p>
            </div>
          )}

          {/* Position History Timeline */}
          {executive.histories && executive.histories.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <History className="w-4 h-4 mr-1.5 text-indigo-600" />
                ประวัติการดำรงตำแหน่งและคำสั่งโยกย้าย
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 text-xs">
                {executive.histories.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                    <div className="font-semibold text-slate-800 text-sm">
                      {hist.newPosition}
                    </div>
                    <div className="text-slate-500">
                      {hist.organizationName} •{' '}
                      {new Date(hist.effectiveDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    {hist.orderReference && (
                      <div className="text-blue-700 text-[11px] mt-0.5">
                        อ้างอิง: {hist.orderReference}
                      </div>
                    )}
                    {hist.notes && (
                      <div className="text-slate-600 text-[11px] italic mt-0.5">
                        {hist.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between no-print">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>พิมพ์ข้อมูลหน้านี้</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
