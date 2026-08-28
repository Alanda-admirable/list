'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Building2,
  Crown,
  Shield,
  Landmark,
  Users,
  Phone,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Eye,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Executive } from '@/components/ExecutiveCard';
import { groupExecutivesByOfficialHierarchy, HierarchySection } from '@/lib/hierarchy-sorter';

interface PrintDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  executives: Executive[];
}

export default function PrintDirectoryModal({
  isOpen,
  onClose,
  executives,
}: PrintDirectoryModalProps) {
  // Print Customization Options
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [showPhotos, setShowPhotos] = useState<boolean>(true);
  const [showContacts, setShowContacts] = useState<boolean>(true);
  const [showCoverPage, setShowCoverPage] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>('cards');

  // Compute hierarchical structure
  const allSections: HierarchySection[] = useMemo(() => {
    return groupExecutivesByOfficialHierarchy(executives);
  }, [executives]);

  const filteredSections = useMemo(() => {
    if (selectedSectionId === 'ALL') return allSections;
    return allSections.filter((s) => s.id === selectedSectionId);
  }, [allSections, selectedSectionId]);

  const totalCount = useMemo(() => {
    return filteredSections.reduce(
      (sum, s) => sum + s.subsections.reduce((subSum, sub) => subSum + sub.executives.length, 0),
      0
    );
  }, [filteredSections]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getSectionIcon = (name: string) => {
    switch (name) {
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-teal-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Control Bar (Hidden when printing) */}
      <div className="sticky top-2 z-50 w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 mb-4 no-print">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                Official Print System
              </span>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                ระบบจัดพิมพ์ทำเนียบตามโครงสร้างลำดับชั้นและตำแหน่ง/ยศ
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              จัดเรียงข้าราชการตามลำดับเกียรติ ยศ และสายการบังคับบัญชา ๕ ระดับ ({totalCount} รายการ)
            </p>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / บันทึก PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-1 text-xs">
          {/* Section Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">เลือกระดับโครงสร้าง</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">พิมพ์ทั้งเล่ม (ทุก ๕ ระดับ)</option>
              {allSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">รูปแบบการแสดงผล</label>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setLayoutMode('cards')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  layoutMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                การ์ดทำเนียบทางการ
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('table')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  layoutMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                ตารางสรุปรายนาม
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-4 pt-4">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPhotos}
                onChange={(e) => setShowPhotos(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">แสดงรูปถ่าย</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showContacts}
                onChange={(e) => setShowContacts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">แสดงเบอร์ติดต่อ</span>
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCoverPage}
                onChange={(e) => setShowCoverPage(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">พิมพ์หน้าปกทางการ</span>
            </label>
          </div>
        </div>
      </div>

      {/* Printable Document Container (A4 Printable Width) */}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none text-slate-900">
        
        {/* ===================== COVER PAGE ===================== */}
        {showCoverPage && (
          <div className="page-break p-10 sm:p-16 flex flex-col items-center justify-between min-h-[950px] border-b-8 border-double border-blue-900/40 text-center relative bg-gradient-to-b from-slate-50 via-white to-slate-50 print:bg-white print:border-none">
            {/* Top Thai Decorative Line */}
            <div className="w-full flex items-center justify-center space-x-3 mb-6">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1" />
              <div className="w-3 h-3 rotate-45 border-2 border-amber-600 bg-amber-100" />
              <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1" />
            </div>

            {/* Garuda / Official Emblem */}
            <div className="space-y-4 my-auto">
              <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-amber-500/10 border-2 border-amber-500/30 p-2 shadow-inner">
                <Crown className="w-14 h-14 text-amber-600" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-900 text-white shadow">
                  ทำเนียบข้าราชการและผู้บริหารภาครัฐ
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-heading tracking-tight leading-tight">
                  ทำเนียบผู้บริหารหน่วยงานภาครัฐ
                  <br />
                  <span className="text-blue-700">จังหวัดปทุมธานี</span>
                </h1>
                <p className="text-sm font-semibold text-slate-600 max-w-lg mx-auto leading-relaxed">
                  ฉบับจัดโครงสร้างสายการบังคับบัญชา ลำดับชั้นตำแหน่ง และยศข้าราชการ
                </p>
              </div>

              {/* Scope Summary Box */}
              <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-left mt-6">
                <div className="border-l-2 border-blue-600 pl-2.5">
                  <div className="text-[11px] text-slate-400 font-medium">ระดับบริหาร</div>
                  <div className="text-xs font-bold text-slate-800">๕ ระดับการปกครอง</div>
                </div>
                <div className="border-l-2 border-indigo-600 pl-2.5">
                  <div className="text-[11px] text-slate-400 font-medium">ผู้บริหารในทำเนียบ</div>
                  <div className="text-xs font-bold text-slate-800">{executives.length} รายนาม</div>
                </div>
                <div className="border-l-2 border-teal-600 pl-2.5">
                  <div className="text-[11px] text-slate-400 font-medium">หน่วยงานราชการ</div>
                  <div className="text-xs font-bold text-slate-800">๗ อำเภอ / อปท.</div>
                </div>
                <div className="border-l-2 border-amber-600 pl-2.5">
                  <div className="text-[11px] text-slate-400 font-medium">ปีงบประมาณ</div>
                  <div className="text-xs font-bold text-slate-800">๒๕๖๙ (ปัจจุบัน)</div>
                </div>
              </div>
            </div>

            {/* Bottom Metadata & Print Time */}
            <div className="w-full space-y-2 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <p className="font-medium">
                จัดทำและประมวลผลโดย : ระบบสารสนเทศทำเนียบผู้บริหารภาครัฐ (ThaiGov Directory System)
              </p>
              <p className="text-[11px] text-slate-400">
                ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* ===================== TABLE OF CONTENTS / HIERARCHY OVERVIEW ===================== */}
        <div className="p-8 sm:p-12 border-b border-slate-200 bg-slate-50/50 print:bg-white avoid-break">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-blue-900 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950 font-heading">
              โครงสร้างลำดับชั้นการบริหารราชการแผ่นดินในทำเนียบ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSections.map((sec, idx) => {
              const execCount = sec.subsections.reduce((acc, sub) => acc + sub.executives.length, 0);
              return (
                <div
                  key={sec.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3"
                >
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 flex-shrink-0 mt-0.5">
                    {getSectionIcon(sec.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading">{sec.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sec.subtitle}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {execCount} รายนาม
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================== SECTIONS CONTENT ===================== */}
        <div className="p-6 sm:p-10 space-y-12">
          {filteredSections.map((section, sIndex) => (
            <div key={section.id} className="space-y-6 page-break">
              {/* Section Header */}
              <div className="border-b-2 border-blue-950 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-950 text-white shadow">
                    {getSectionIcon(section.iconName)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-blue-950 font-heading">
                      {section.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full print:border print:border-slate-300">
                  {section.subsections.reduce((sum, s) => sum + s.executives.length, 0)} รายนาม
                </span>
              </div>

              {/* Subsections */}
              {section.subsections.map((sub) => (
                <div key={sub.id} className="space-y-3">
                  {/* Subsection Title if multiple or descriptive */}
                  <div className="bg-slate-100/80 px-3.5 py-1.5 rounded-lg border-l-4 border-blue-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 font-heading">{sub.title}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({sub.executives.length} รายนาม)
                    </span>
                  </div>

                  {/* Layout Mode: Cards */}
                  {layoutMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {sub.executives.map((exec, eIdx) => {
                        const isTopGovernor =
                          exec.position.includes('ผู้ว่าราชการจังหวัด') &&
                          !exec.position.startsWith('รอง');

                        return (
                          <div
                            key={exec.id}
                            className={`avoid-break bg-white rounded-xl p-3.5 border transition-all flex space-x-3.5 ${
                              isTopGovernor
                                ? 'md:col-span-2 border-2 border-amber-500/80 bg-amber-50/20 shadow-md'
                                : 'border-slate-200 shadow-sm'
                            }`}
                          >
                            {/* Photo Portrait */}
                            {showPhotos && (
                              <div className="flex-shrink-0">
                                <div
                                  className={`rounded-lg overflow-hidden border-2 bg-slate-100 shadow-inner flex items-center justify-center ${
                                    isTopGovernor
                                      ? 'w-20 h-24 sm:w-24 sm:h-28 border-amber-500'
                                      : 'w-16 h-20 sm:w-18 sm:h-22 border-slate-200'
                                  }`}
                                >
                                  {exec.avatarUrl && exec.status !== 'VACANT' ? (
                                    <img
                                      src={exec.avatarUrl}
                                      alt={exec.firstName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-400 font-semibold text-center p-1">
                                      {exec.status === 'VACANT' ? 'ตำแหน่งว่าง' : 'ไม่มีรูป'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-1">
                                <h4
                                  className={`font-bold text-slate-900 leading-snug font-heading ${
                                    isTopGovernor ? 'text-base sm:text-lg text-blue-950' : 'text-sm'
                                  }`}
                                >
                                  {exec.status === 'VACANT'
                                    ? '(ตำแหน่งว่าง)'
                                    : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                                </h4>

                                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  ลำดับ {eIdx + 1}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-blue-900 leading-tight">
                                {exec.position}
                              </p>

                              <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                                <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{exec.organization?.name}</span>
                              </div>

                              {/* District / Province location */}
                              {(exec.organization?.district || exec.organization?.province) && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                                  <span>
                                    {exec.organization?.district ? `อ.${exec.organization.district} ` : ''}
                                    {exec.organization?.province ? `จ.${exec.organization.province}` : ''}
                                  </span>
                                </div>
                              )}

                              {/* Contacts */}
                              {showContacts && (exec.phone || exec.organization?.phone) && (
                                <div className="text-[11px] font-mono text-slate-700 bg-slate-50 rounded px-2 py-0.5 inline-flex items-center gap-1.5 mt-1 border border-slate-100">
                                  <Phone className="w-3 h-3 text-blue-600" />
                                  <span>{exec.phone || exec.organization?.phone}</span>
                                </div>
                              )}

                              {/* Order reference if available */}
                              {exec.orderReference && (
                                <p className="text-[10px] text-slate-400 italic truncate">
                                  อ้างอิง: {exec.orderReference}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Layout Mode: Table */
                    <div className="avoid-break bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                            {showPhotos && <th className="py-2.5 px-3 w-16 text-center">รูปถ่าย</th>}
                            <th className="py-2.5 px-3">ยศ / คำนำหน้า / ชื่อ-สกุล</th>
                            <th className="py-2.5 px-3">ตำแหน่งหน้าที่</th>
                            <th className="py-2.5 px-3">สังกัดหน่วยงาน</th>
                            {showContacts && <th className="py-2.5 px-3 w-32">เบอร์ติดต่อ</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sub.executives.map((exec, idx) => (
                            <tr key={exec.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              {showPhotos && (
                                <td className="py-2 px-3 text-center">
                                  <div className="w-9 h-11 mx-auto rounded overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    {exec.avatarUrl && exec.status !== 'VACANT' ? (
                                      <img
                                        src={exec.avatarUrl}
                                        alt={exec.firstName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[9px] text-slate-400">-</span>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {exec.status === 'VACANT'
                                  ? '(ตำแหน่งว่าง)'
                                  : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                              </td>
                              <td className="py-2 px-3 font-semibold text-blue-900">{exec.position}</td>
                              <td className="py-2 px-3 text-slate-700">{exec.organization?.name}</td>
                              {showContacts && (
                                <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                                  {exec.phone || exec.organization?.phone || '-'}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ===================== OFFICIAL FOOTER ===================== */}
        <div className="p-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1 bg-slate-50 print:bg-white avoid-break">
          <p className="font-semibold text-slate-700">
            เอกสารทำเนียบผู้บริหารหน่วยงานภาครัฐ จังหวัดปทุมธานี (ฉบับประมวลผลทางการ)
          </p>
          <p className="text-[11px] text-slate-400">
            ข้อมูลจากฐานข้อมูลสารสนเทศส่วนราชการ จังหวัดปทุมธานี จัดพิมพ์เมื่อ{' '}
            {new Date().toLocaleString('th-TH')}
          </p>
        </div>
      </div>
    </div>
  );
}
