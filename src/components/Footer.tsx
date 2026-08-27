'use client';

import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 text-xs border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System Branding */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base font-heading">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>ระบบทำเนียบและแสดงผลอัพเดทรายชื่อผู้บริหารภาครัฐ</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              ศูนย์กลางข้อมูลทำเนียบข้าราชการและผู้บริหารระดับสูง 4 ระดับ: ส่วนราชการ (กระทรวง/กรม), ส่วนภูมิภาค (จังหวัด), ระดับอำเภอ และองค์กรปกครองส่วนท้องถิ่น (อบจ./เทศบาล/อบต.)
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>เชื่อมโยงข้อมูลแบบเรียลไทม์ พร้อมระบบตรวจสอบประวัติการดำรงตำแหน่ง</span>
            </div>
          </div>

          {/* Col 2: Level Classification */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 font-heading text-xs uppercase tracking-wider">
              ขอบเขตโครงสร้างการบริหาร
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• ราชการส่วนกลาง (กระทรวง/กรม)</li>
              <li>• ราชการส่วนภูมิภาค (76 จังหวัด)</li>
              <li>• ส่วนราชการระดับอำเภอ (ที่ว่าการอำเภอ)</li>
              <li>• องค์กรปกครองส่วนท้องถิ่น (อปท.)</li>
            </ul>
          </div>

          {/* Col 3: Quick Utilities */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 font-heading text-xs uppercase tracking-wider">
              เครื่องมือและบริการ
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="/api/import-export?type=template" className="hover:text-amber-400 transition-colors">
                  • ดาวน์โหลด Excel Template
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-amber-400 transition-colors">
                  • ศูนย์จัดการข้อมูล (Admin Hub)
                </a>
              </li>
              <li>
                <a href="/org-chart" className="hover:text-amber-400 transition-colors">
                  • แผนผังสายการบังคับบัญชา
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} ระบบฐานข้อมูลทำเนียบผู้บริหารภาครัฐ (Thai Government Executive Directory). สงวนลิขสิทธิ์
          </div>
          <div className="flex items-center space-x-1">
            <span>มาตรฐานความปลอดภัยและการเชื่อมโยงข้อมูลภาครัฐ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
