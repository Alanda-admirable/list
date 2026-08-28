'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ALL_PROVINCES, ORG_LEVELS, STATUS_LABELS } from '@/lib/thai-data';
import { Executive } from '@/components/ExecutiveCard';
import {
  Printer,
  FileSpreadsheet,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Search,
  FileText,
  ArrowLeft,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface OrganizationWithExecs {
  id: string;
  code: string;
  name: string;
  nameEn?: string | null;
  level: string;
  category: string;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  executives: Executive[];
}

export default function ReportExportPage() {
  const [organizations, setOrganizations] = useState<OrganizationWithExecs[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('ALL');

  // Display Options
  const [layoutMode, setLayoutMode] = useState<'page-break' | 'compact' | 'table'>('page-break');
  const [showPhotos, setShowPhotos] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showOrderRef, setShowOrderRef] = useState(true);
  const [showOrgAddress, setShowOrgAddress] = useState(true);

  // Fetch Organizations with their executives
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedProvince) params.append('province', selectedProvince);

      const res = await fetch(`/api/organizations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        // For each organization, ensure we have its executives
        // If the org endpoint returns items, let's also fetch full executives for complete directory
        const orgsRes = await fetch(`/api/executives?limit=1000`);
        const execsData = await orgsRes.json();
        const execsList: Executive[] = execsData.data || [];

        // Group executives by organizationId
        const execsByOrg: Record<string, Executive[]> = {};
        execsList.forEach((ex) => {
          if (!execsByOrg[ex.organizationId]) execsByOrg[ex.organizationId] = [];
          execsByOrg[ex.organizationId].push(ex);
        });

        const fullOrgs: OrganizationWithExecs[] = data.data.map((o: any) => ({
          ...o,
          executives: execsByOrg[o.id] || o.executives || [],
        }));

        setOrganizations(fullOrgs);
      }
    } catch (e) {
      console.error('Failed to load report data', e);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedProvince]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Extract available districts
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach((o) => {
      if (o.district) set.add(o.district);
    });
    return Array.from(set).sort();
  }, [organizations]);

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      if (selectedOrgId !== 'ALL' && org.id !== selectedOrgId) return false;
      if (selectedDistrict && org.district !== selectedDistrict) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesOrg =
          org.name.toLowerCase().includes(q) ||
          (org.category && org.category.toLowerCase().includes(q)) ||
          (org.district && org.district.toLowerCase().includes(q));

        const matchesExec = org.executives.some(
          (ex) =>
            ex.firstName.toLowerCase().includes(q) ||
            ex.lastName.toLowerCase().includes(q) ||
            ex.position.toLowerCase().includes(q)
        );

        if (!matchesOrg && !matchesExec) return false;
      }

      return true;
    });
  }, [organizations, selectedOrgId, selectedDistrict, searchQuery]);

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const totalOrgs = filteredOrgs.length;
    const totalExecs = filteredOrgs.reduce((acc, o) => acc + o.executives.length, 0);
    return { totalOrgs, totalExecs };
  }, [filteredOrgs]);

  const currentDateThai = useMemo(() => {
    const now = new Date();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    return `${now.getDate()} ${months[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />

      {/* Control Panel (Hidden when printing) */}
      <div className="bg-white border-b border-slate-200 shadow-sm no-print sticky top-[72px] sm:top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Top Title & Print Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="กลับหน้าหลัก"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <span>ระบบส่งออกทำเนียบและรายงานทางการ (PDF / Print)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  จัดรายงานแยกส่วนตามหน่วยงาน พร้อมรูปถ่าย ตำแหน่ง เบอร์โทรศัพท์ และรายละเอียดราชการ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/api/import-export?type=export"
                download
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-semibold transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ส่งออก Excel</span>
              </a>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสาร / บันทึกเป็น PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหน่วยงาน หรือชื่อผู้บริหาร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="ALL">ระดับการบริหาร: ทั้งหมด (4 ระดับ)</option>
                {ORG_LEVELS.filter((l) => l.value !== 'ALL').map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="">พื้นที่อำเภอ: ทุกอำเภอ</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    อำเภอ{d}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Agency Filter */}
            <div>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
              >
                <option value="ALL">เลือกเฉพาะหน่วยงาน: ทุกหน่วยงาน ({organizations.length})</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.executives.length} ท่าน)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Layout & Content Display Checkboxes */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {/* Layout Options */}
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">รูปแบบการจัดหน้า:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => setLayoutMode('page-break')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    layoutMode === 'page-break'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ขึ้นหน้าใหม่แยกหน่วยงาน (1 Page/Org)
                </button>
                <button
                  onClick={() => setLayoutMode('compact')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    layoutMode === 'compact'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  จัดรวมแบบการ์ด (Compact)
                </button>
                <button
                  onClick={() => setLayoutMode('table')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    layoutMode === 'table'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ตารางทำเนียบมาตรฐาน (Table)
                </button>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPhotos}
                  onChange={(e) => setShowPhotos(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>แสดงรูปถ่ายผู้บริหาร</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showContact}
                  onChange={(e) => setShowContact(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>แสดงเบอร์โทรศัพท์</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOrderRef}
                  onChange={(e) => setShowOrderRef(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>แสดงเลขอ้างอิงคำสั่ง</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOrgAddress}
                  onChange={(e) => setShowOrgAddress(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>แสดงที่อยู่/ข้อมูลติดต่อหน่วยงาน</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Printable Document Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Cover / Document Header for Print */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 text-center space-y-3 avoid-break-inside">
          <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
              ทำเนียบรายชื่อผู้บริหารและหน่วยงานภาครัฐ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              จังหวัดปทุมธานี • ครอบคลุมราชการส่วนกลาง ส่วนภูมิภาค อำเภอ และองค์กรปกครองส่วนท้องถิ่น
            </p>
            <div className="inline-flex items-center space-x-3 text-[11px] text-slate-500 mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <span>ข้อมูล ณ วันที่: {currentDateThai}</span>
              <span>•</span>
              <span>รวม {summaryStats.totalOrgs} หน่วยงาน</span>
              <span>•</span>
              <span>รวม {summaryStats.totalExecs} ผู้บริหาร</span>
            </div>
          </div>
        </div>

        {/* Organizations Loop */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-600">กำลังจัดเตรียมรายงานทำเนียบ...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200 text-slate-500">
            <Info className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">ไม่พบหน่วยงานที่ตรงกับเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrgs.map((org, index) => {
              const isPageBreak = layoutMode === 'page-break';
              const levelBadge = {
                CENTRAL: 'bg-purple-100 text-purple-900 border-purple-300',
                PROVINCIAL: 'bg-blue-100 text-blue-900 border-blue-300',
                DISTRICT: 'bg-teal-100 text-teal-900 border-teal-300',
                LOCAL: 'bg-amber-100 text-amber-900 border-amber-300',
              }[org.level] || 'bg-slate-100 text-slate-800 border-slate-200';

              return (
                <section
                  key={org.id}
                  className={`bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 ${
                    isPageBreak && index > 0 ? 'page-break-before mt-8' : 'avoid-break-inside'
                  }`}
                >
                  {/* Agency Header Section */}
                  <div className="border-b-2 border-blue-900/80 pb-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${levelBadge}`}>
                            {org.category}
                          </span>
                          {org.district && (
                            <span className="text-[11px] font-semibold text-slate-600">
                              อำเภอ{org.district}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-500">
                            จังหวัด{org.province || 'ปทุมธานี'}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                          {org.name}
                        </h3>
                      </div>

                      <div className="text-right flex-shrink-0 text-xs text-slate-400 font-medium">
                        รหัสหน่วยงาน: <span className="font-mono text-slate-600">{org.code}</span>
                      </div>
                    </div>

                    {/* Agency Contact & Address */}
                    {showOrgAddress && (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        {org.address && (
                          <div className="flex items-start space-x-1.5 sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span>{org.address}</span>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>โทรศัพท์: {org.phone}</span>
                          </div>
                        )}
                        {org.email && (
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>อีเมล: {org.email}</span>
                          </div>
                        )}
                        {org.website && (
                          <div className="flex items-center space-x-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>เว็บ: {org.website}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Executives Content Section */}
                  {org.executives.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 font-medium">
                      ไม่มีข้อมูลผู้บริหารในหน่วยงานนี้
                    </div>
                  ) : layoutMode === 'table' ? (
                    /* Table Layout */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-12 text-center">ลำดับ</th>
                            {showPhotos && <th className="p-2.5 w-16 text-center">รูปถ่าย</th>}
                            <th className="p-2.5">ชื่อ - นามสกุล</th>
                            <th className="p-2.5">ตำแหน่ง</th>
                            <th className="p-2.5">ระดับตำแหน่ง</th>
                            {showContact && <th className="p-2.5">เบอร์โทรศัพท์</th>}
                            <th className="p-2.5 text-center">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {org.executives.map((exec, idx) => {
                            const statusInfo = STATUS_LABELS[exec.status] || STATUS_LABELS.ACTIVE;
                            const isVacant = exec.status === 'VACANT';

                            return (
                              <tr key={exec.id} className="hover:bg-slate-50/80">
                                <td className="p-2.5 text-center font-semibold text-slate-500">
                                  {idx + 1}
                                </td>
                                {showPhotos && (
                                  <td className="p-2 text-center">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center">
                                      {exec.avatarUrl && !isVacant ? (
                                        <img
                                          src={exec.avatarUrl}
                                          alt={exec.firstName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <User className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                  </td>
                                )}
                                <td className="p-2.5 font-bold text-slate-900">
                                  {isVacant
                                    ? '(ตำแหน่งว่าง)'
                                    : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                                </td>
                                <td className="p-2.5 font-semibold text-blue-900">
                                  {exec.position}
                                </td>
                                <td className="p-2.5 text-slate-600">
                                  {exec.positionLevel || '-'}
                                </td>
                                {showContact && (
                                  <td className="p-2.5 text-slate-700 font-mono">
                                    {exec.phone || '-'}
                                  </td>
                                )}
                                <td className="p-2.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusInfo.bg} ${statusInfo.border}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Card Grid Layout (Page Break / Compact) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {org.executives.map((exec) => {
                        const statusInfo = STATUS_LABELS[exec.status] || STATUS_LABELS.ACTIVE;
                        const isVacant = exec.status === 'VACANT';

                        return (
                          <div
                            key={exec.id}
                            className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between avoid-break-inside shadow-2xs"
                          >
                            <div className="space-y-3">
                              {/* Photo + Name Row */}
                              <div className="flex items-start space-x-3">
                                {showPhotos && (
                                  <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0 flex items-center justify-center text-slate-400 shadow-2xs">
                                    {exec.avatarUrl && !isVacant ? (
                                      <img
                                        src={exec.avatarUrl}
                                        alt={exec.firstName}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                        <User className="w-6 h-6 text-slate-300" />
                                        <span className="text-[7px] text-slate-400 font-medium">รอรูปถ่าย</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </div>

                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading mt-1 leading-snug">
                                    {isVacant
                                      ? '(ตำแหน่งว่าง - รอแต่งตั้ง)'
                                      : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                                  </h4>

                                  <p className="text-[11px] font-semibold text-blue-900 mt-0.5">
                                    {exec.position}
                                  </p>

                                  {exec.positionLevel && (
                                    <p className="text-[10px] text-slate-500">
                                      {exec.positionLevel}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Contact Details */}
                              {showContact && (
                                <div className="pt-2.5 border-t border-slate-200/70 space-y-1 text-[11px] text-slate-700">
                                  {exec.phone && (
                                    <div className="flex items-center space-x-1.5">
                                      <Phone className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                      <span className="font-mono font-medium">{exec.phone}</span>
                                    </div>
                                  )}
                                  {exec.email && (
                                    <div className="flex items-center space-x-1.5">
                                      <Mail className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                      <span className="truncate">{exec.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Appointment / Order Reference */}
                              {showOrderRef && exec.orderReference && (
                                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                                  <span className="font-semibold text-slate-600">คำสั่งแต่งตั้ง: </span>
                                  <span>{exec.orderReference}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Section Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>ทำเนียบส่วนราชการจังหวัดปทุมธานี</span>
                    <span>รวม {org.executives.length} ตำแหน่ง</span>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
