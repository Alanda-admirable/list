'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  History,
  ArrowRightLeft,
  ShieldCheck,
  Search,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';

export default function HistoryPage() {
  const [tab, setTab] = useState<'audit' | 'transfers'>('audit');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'audit') {
        const res = await fetch('/api/history?type=audit&limit=100');
        const data = await res.json();
        if (data.success) setAuditLogs(data.data);
      } else {
        const res = await fetch('/api/history?type=transfers&limit=100');
        const data = await res.json();
        if (data.success) setTransfers(data.data);
      }
    } catch (e) {
      console.error('Error loading history', e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLogs = auditLogs.filter((log) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      log.title.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(q))
    );
  });

  const filteredTransfers = transfers.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (t.executive && `${t.executive.firstName} ${t.executive.lastName}`.toLowerCase().includes(q)) ||
      (t.newPosition && t.newPosition.toLowerCase().includes(q)) ||
      (t.orderReference && t.orderReference.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                ประวัติการอัปเดตและบันทึกการโยกย้าย (Audit Trail)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                ตรวจสอบความถูกต้อง ความโปร่งใส และติดตามคำสั่งแต่งตั้งโยกย้ายย้อนหลัง
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setTab('audit')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === 'audit'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>บันทึกการแก้ไขระบบ (System Logs)</span>
            </button>

            <button
              onClick={() => setTab('transfers')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === 'transfers'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>ประวัติการดำรงตำแหน่ง (Position History)</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาข้อความ, คำสั่ง หรือชื่อ..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">กำลังโหลดข้อมูลประวัติ...</p>
          </div>
        ) : tab === 'audit' ? (
          /* Audit Logs Table */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">กิจกรรม</th>
                    <th className="py-3 px-4">ประเภทข้อมูล</th>
                    <th className="py-3 px-4">รายละเอียด</th>
                    <th className="py-3 px-4">ผู้บันทึก</th>
                    <th className="py-3 px-4 text-right">วัน-เวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        ไม่พบบันทึกกิจกรรม
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.action === 'CREATE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'UPDATE'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'TRANSFER'
                                ? 'bg-amber-100 text-amber-800'
                                : log.action === 'IMPORT'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {log.entityType}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {log.title}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.performedBy}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Position History List */
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {filteredTransfers.length === 0 ? (
                <div className="text-slate-400 text-xs py-6">
                  ไม่พบประวัติการดำรงตำแหน่ง
                </div>
              ) : (
                filteredTransfers.map((item) => (
                  <div key={item.id} className="relative text-xs space-y-1">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" />

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.executive?.prefix || ''} {item.executive?.firstName || ''} {item.executive?.lastName || ''}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-blue-900 font-semibold">{item.newPosition}</span>
                    </div>

                    <div className="text-slate-600">
                      สังกัด: <strong className="text-slate-800">{item.organizationName}</strong>
                    </div>

                    {item.previousPosition && item.previousPosition !== 'ตำแหน่งก่อนหน้า' && (
                      <div className="text-slate-500 text-[11px]">
                        ตำแหน่งเดิม: {item.previousPosition}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        มีผลวันที่: {new Date(item.effectiveDate).toLocaleDateString('th-TH')}
                      </span>

                      {item.orderReference && (
                        <span className="flex items-center text-blue-700 font-medium">
                          <FileText className="w-3 h-3 mr-1 text-blue-600" />
                          {item.orderReference}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
