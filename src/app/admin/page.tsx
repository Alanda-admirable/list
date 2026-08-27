'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Settings,
  Users,
  Building2,
  FileSpreadsheet,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const adminShortcuts = [
    {
      title: 'จัดการรายชื่อผู้บริหาร',
      desc: 'เพิ่ม แก้ไข ลบ โยกย้ายตำแหน่ง และปรับปรุงสถานะ',
      href: '/admin/executives',
      icon: Users,
      color: 'bg-blue-600',
      badge: `${stats?.executives.total || 0} รายชื่อ`,
    },
    {
      title: 'นำเข้า & ส่งออก Excel',
      desc: 'อัปโหลดไฟล์ Excel เพื่ออัปเดตข้อมูลจำนวนมาก พร้อมระบบตรวจจับความถูกต้อง',
      href: '/admin/import-export',
      icon: FileSpreadsheet,
      color: 'bg-emerald-600',
      badge: 'Bulk Import/Export',
    },
    {
      title: 'จัดการโครงสร้างหน่วยงาน',
      desc: 'เพิ่มหรือปรับโครงสร้างกระทรวง กรม จังหวัด ที่ว่าการอำเภอ และ อปท.',
      href: '/admin/organizations',
      icon: Building2,
      color: 'bg-indigo-600',
      badge: `${stats?.organizations.total || 0} หน่วยงาน`,
    },
    {
      title: 'ประวัติการอัปเดต & Audit Logs',
      desc: 'ตรวจสอบประวัติคำสั่งแต่งตั้ง การโยกย้าย และบันทึกการปรับปรุงข้อมูลย้อนหลัง',
      href: '/admin/history',
      icon: History,
      color: 'bg-amber-600',
      badge: 'Audit Trail',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Settings className="w-3.5 h-3.5" />
              <span>ศูนย์ควบคุมและบริหารจัดการข้อมูล (Admin Hub)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              แดชบอร์ดบริหารทำเนียบผู้บริหารภาครัฐ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              ตรวจสอบสถานะความพร้อมของข้อมูล การอัปเดต และจัดการฐานข้อมูล 4 ระดับ
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/executives"
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มผู้บริหารใหม่</span>
            </Link>
          </div>
        </div>

        {/* Status Metrics Cards */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">กำลังประมวลผลข้อมูลสถิติ...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">ผู้บริหารทั้งหมด</span>
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {stats.executives.total}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">ในระบบทั้ง 4 ระดับ</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">ปฏิบัติหน้าที่ปกติ</span>
                <span className="text-3xl font-extrabold text-emerald-600 font-heading">
                  {stats.executives.active}
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">สถานะ Active</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">รักษาราชการแทน</span>
                <span className="text-3xl font-extrabold text-amber-600 font-heading">
                  {stats.executives.acting}
                </span>
                <span className="text-[11px] text-amber-700 block mt-0.5">รักษาการในตำแหน่ง</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">ตำแหน่งว่าง (Vacant)</span>
                <span className="text-3xl font-extrabold text-rose-600 font-heading">
                  {stats.executives.vacant}
                </span>
                <span className="text-[11px] text-rose-700 block mt-0.5">รอสรรหา/แต่งตั้ง</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Shortcuts Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex items-start justify-between"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${item.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Recent Audit Updates Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                ประวัติการปรับปรุงข้อมูลล่าสุด (Recent Audit Logs)
              </h3>
            </div>
            <Link
              href="/admin/history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              ดูทั้งหมด
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">กิจกรรม</th>
                  <th className="py-3 px-4">รายละเอียด</th>
                  <th className="py-3 px-4">ผู้ดำเนินการ</th>
                  <th className="py-3 px-4 text-right">เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentUpdates && stats.recentUpdates.length > 0 ? (
                  stats.recentUpdates.map((log: any) => (
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
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.title}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {log.performedBy || 'ผู้ดูแลระบบ'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString('th-TH')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      ยังไม่มีประวัติการอัปเดต
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
