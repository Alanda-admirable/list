'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import StatSummary from '@/components/StatSummary';
import HierarchyFilter from '@/components/HierarchyFilter';
import ExecutiveCard, { Executive } from '@/components/ExecutiveCard';
import ExecutiveModal from '@/components/ExecutiveModal';
import Footer from '@/components/Footer';
import {
  LayoutGrid,
  List,
  AlertCircle,
  Loader2,
  User,
  PlusCircle,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { STATUS_LABELS } from '@/lib/thai-data';

export default function DirectoryPage() {
  const [stats, setStats] = useState<any>(null);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected Executive for Modal
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  // Fetch Executives
  const fetchExecutives = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedProvince) params.append('province', selectedProvince);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('limit', '1000');

      const res = await fetch(`/api/executives?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setExecutives(data.data);
      }
    } catch (e) {
      console.error('Failed to load executives', e);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedLevel,
    selectedProvince,
    selectedDistrict,
    selectedCategory,
    selectedStatus,
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExecutives();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchExecutives]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('ALL');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Hero Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden no-print">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm border border-white/15">
              <span>ฐานข้อมูลทำเนียบข้าราชการและผู้บริหาร</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              ทำเนียบรายชื่อผู้บริหารหน่วยงานภาครัฐ
            </h2>
            <p className="text-sm sm:text-base text-blue-200/90 leading-relaxed">
              สืบค้นและติดตามสถานะผู้บริหารระดับสูง ครอบคลุมราชการส่วนกลาง ส่วนภูมิภาค (76 จังหวัด) ระดับอำเภอ และองค์กรปกครองส่วนท้องถิ่น (อปท.) ทั่วประเทศไทย
            </p>
          </div>
        </div>

        {/* Top Statistics summary cards */}
        <StatSummary
          stats={stats}
          selectedLevel={selectedLevel}
          onSelectLevel={(lvl) => setSelectedLevel(lvl)}
        />

        {/* Cascading Filter Controls */}
        <HierarchyFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onReset={handleResetFilters}
          totalResults={executives.length}
        />

        {/* View Controls & Action Toolbar */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-800 font-heading">
              รายชื่อผู้บริหาร ({executives.length} รายการ)
            </h3>
            {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="มุมมองการ์ด (Grid View)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="มุมมองตาราง (Table View)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/report"
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              title="จัดรายงานและพิมพ์เอกสารทางการแยกตามหน่วยงาน"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน PDF</span>
            </Link>

            <Link
              href="/admin/executives"
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เพิ่ม / อัปเดตรายชื่อ</span>
            </Link>
          </div>
        </div>

        {/* Results Presentation */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">กำลังโหลดข้อมูลทำเนียบผู้บริหาร...</p>
          </div>
        ) : executives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-700 font-heading">
                ไม่พบรายชื่อผู้บริหารที่ตรงกับเงื่อนไขการค้นหา
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;ล้างตัวกรอง&quot; เพื่อแสดงรายชื่อทั้งหมด
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {executives.map((exec) => (
              <ExecutiveCard
                key={exec.id}
                executive={exec}
                onSelect={(selected) => setSelectedExecutive(selected)}
              />
            ))}
          </div>
        ) : (
          /* Table List View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">รูปถ่าย & ชื่อ-สกุล</th>
                    <th className="py-3.5 px-4">ตำแหน่งหน้าที่</th>
                    <th className="py-3.5 px-4">สังกัดหน่วยงาน</th>
                    <th className="py-3.5 px-4">ระดับ</th>
                    <th className="py-3.5 px-4">พื้นที่</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4">ติดต่อ</th>
                    <th className="py-3.5 px-4 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {executives.map((exec) => {
                    const statusInfo = STATUS_LABELS[exec.status] || STATUS_LABELS.ACTIVE;
                    const isVacant = exec.status === 'VACANT';

                    return (
                      <tr
                        key={exec.id}
                        onClick={() => setSelectedExecutive(exec)}
                        className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
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
                            <span className="font-bold text-slate-900">
                              {isVacant ? '(ตำแหน่งว่าง)' : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-blue-900">{exec.position}</span>
                          {exec.positionLevel && (
                            <span className="block text-[10px] text-slate-400">{exec.positionLevel}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {exec.organization?.name}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {exec.organization?.level === 'CENTRAL'
                              ? 'ส่วนกลาง'
                              : exec.organization?.level === 'PROVINCIAL'
                              ? 'ภูมิภาค'
                              : exec.organization?.level === 'DISTRICT'
                              ? 'อำเภอ'
                              : 'ท้องถิ่น'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {exec.organization?.province || '-'}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          {exec.phone ? (
                            <span className="font-mono text-[11px]">{exec.phone}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExecutive(exec);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                          >
                            ดูข้อมูล
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <ExecutiveModal
        executive={selectedExecutive}
        onClose={() => setSelectedExecutive(null)}
      />

      <Footer />
    </div>
  );
}
