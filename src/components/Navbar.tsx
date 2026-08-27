'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Network,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'ทำเนียบผู้บริหาร', icon: Users },
    { href: '/org-chart', label: 'แผนผังโครงสร้าง', icon: Network },
    { href: '/admin', label: 'ระบบจัดการ (Admin)', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-lg border-b border-blue-900/50 no-print">
      {/* Top Bar with emblem badge */}
      <div className="border-b border-white/10 bg-black/20 text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบฐานข้อมูลทำเนียบผู้บริหารภาครัฐแบบบูรณาการ 4 ระดับ</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-slate-400">อัปเดตข้อมูลล่าสุดแบบ Real-time</span>
            <span className="text-blue-300 font-medium">ส่วนราชการ • ภูมิภาค • อำเภอ • ท้องถิ่น</span>
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                  ทำเนียบผู้บริหารภาครัฐ
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                  4 ระดับการบริหาร
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-normal">
                ส่วนราชการ ภูมิภาค อำเภอ องค์กรปกครองส่วนท้องถิ่น
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/30 text-amber-300 border border-blue-400/30 shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-300'}`} />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Quick Export Button */}
            <a
              href="/api/import-export?type=export"
              target="_blank"
              download
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white shadow transition-all duration-150 border border-emerald-500/40"
              title="ส่งออกทำเนียบทั้งหมดเป็น Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออก Excel</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
