'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExecutiveFormModal from '@/components/ExecutiveFormModal';
import ExecutiveModal from '@/components/ExecutiveModal';
import { Executive } from '@/components/ExecutiveCard';
import { STATUS_LABELS, ALL_PROVINCES, ORG_LEVELS } from '@/lib/thai-data';
import { mergeWithLocalData, fetchCloudOverridesClient } from '@/lib/client-sync';
import {
  Users,
  PlusCircle,
  Search,
  Edit3,
  Eye,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminExecutivesPage() {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [province, setProvince] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState<Executive | null>(null);
  const [viewingExecutive, setViewingExecutive] = useState<Executive | null>(null);

  // Fetch Organizations
  const fetchOrgs = async () => {
    try {
      const res = await fetch(`/api/organizations?_t=${Date.now()}`, { cache: 'no-store' });
      const text = await res.text();
      const data = text.startsWith('{') ? JSON.parse(text) : null;
      if (data?.success) {
        setOrganizations(data.data);
      }
    } catch (e) {
      console.error('Failed to load orgs', e);
    }
  };

  // Fetch Executives
  const fetchExecutives = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (level !== 'ALL') params.append('level', level);
      if (province) params.append('province', province);
      if (status) params.append('status', status);
      params.append('limit', '1000');
      params.append('_t', Date.now().toString());

      const [dataRes, cloudOverrides] = await Promise.all([
        fetch(`/api/executives?${params.toString()}`, { cache: 'no-store' })
          .then((r) => r.text())
          .then((t) => (t.startsWith('{') ? JSON.parse(t) : { success: false, data: [] }))
          .catch(() => ({ success: false, data: [] })),
        fetchCloudOverridesClient(),
      ]);

      if (dataRes?.success && Array.isArray(dataRes.data)) {
        const merged = mergeWithLocalData(dataRes.data, cloudOverrides);
        setExecutives(merged);
      } else {
        const merged = mergeWithLocalData([], cloudOverrides);
        if (merged.length > 0) setExecutives(merged);
      }
    } catch (e) {
      console.error('Failed to load executives', e);
    } finally {
      setLoading(false);
    }
  }, [query, level, province, status]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    const handleDataChanged = () => {
      fetchExecutives();
    };

    window.addEventListener('thaigov_data_changed', handleDataChanged);
    return () => window.removeEventListener('thaigov_data_changed', handleDataChanged);
  }, [fetchExecutives]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExecutives();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchExecutives]);

  const handleOpenCreate = () => {
    setEditingExecutive(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exec: Executive) => {
    setEditingExecutive(exec);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                จัดการรายชื่อผู้บริหารและตำแหน่ง
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                เพิ่ม แก้ไข บันทึกการโยกย้ายตำแหน่ง และปรับปรุงสถานะผู้บริหารในระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/import-export"
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>นำเข้า/ส่งออก Excel</span>
            </Link>

            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มผู้บริหารใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, ตำแหน่ง, สังกัด หรือจังหวัด..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
            </div>

            {/* Province Filter */}
            <div>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="">ทุกจังหวัด</option>
                {ALL_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="">ทุกสถานะ</option>
                <option value="ACTIVE">ปฏิบัติราชการ</option>
                <option value="ACTING">รักษาราชการแทน</option>
                <option value="VACANT">ตำแหน่งว่าง</option>
                <option value="RETIRED">พ้นจากตำแหน่ง</option>
              </select>
            </div>
          </div>

          {/* Level Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            {ORG_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setLevel(lvl.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  level === lvl.value
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Executives Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3.5 px-4">ตำแหน่งและระดับ</th>
                  <th className="py-3.5 px-4">สังกัดหน่วยงาน</th>
                  <th className="py-3.5 px-4">ระดับ</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">แต่งตั้งเมื่อ</th>
                  <th className="py-3.5 px-4 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>กำลังโหลดข้อมูล...</span>
                    </td>
                  </tr>
                ) : executives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      ไม่พบข้อมูลผู้บริหารตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  executives.map((exec) => {
                    const statusInfo = STATUS_LABELS[exec.status] || STATUS_LABELS.ACTIVE;
                    const isVacant = exec.status === 'VACANT';

                    return (
                      <tr key={exec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {isVacant
                              ? '(ตำแหน่งว่าง)'
                              : `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`}
                          </div>
                          {exec.phone && <div className="text-[11px] text-slate-400">{exec.phone}</div>}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-blue-900">{exec.position}</div>
                          {exec.positionLevel && (
                            <div className="text-[10px] text-slate-500">{exec.positionLevel}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{exec.organization?.name}</div>
                          {exec.organization?.province && (
                            <div className="text-[11px] text-slate-400">จ.{exec.organization.province}</div>
                          )}
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

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {exec.appointmentDate
                            ? new Date(exec.appointmentDate).toLocaleDateString('th-TH')
                            : '-'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setViewingExecutive(exec)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ดูข้อมูลละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(exec)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                              title="แก้ไข / โยกย้ายตำแหน่ง"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="hidden lg:inline text-[11px] font-semibold">แก้ไข/ย้าย</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <ExecutiveFormModal
        isOpen={isFormOpen}
        executive={editingExecutive}
        organizations={organizations}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchExecutives}
      />

      {/* Detail Modal */}
      <ExecutiveModal
        executive={viewingExecutive}
        onClose={() => setViewingExecutive(null)}
      />

      <Footer />
    </div>
  );
}
