'use client';

import React from 'react';
import {
  Users,
  Building,
  Landmark,
  MapPin,
  Compass,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface StatsProps {
  stats: {
    executives: {
      total: number;
      active: number;
      acting: number;
      vacant: number;
      retired: number;
    };
    byLevel: {
      central: number;
      provincial: number;
      district: number;
      local: number;
    };
    organizations: {
      total: number;
    };
  } | null;
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
}

export default function StatSummary({ stats, selectedLevel, onSelectLevel }: StatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-sm animate-pulse space-y-2.5 ${
              i === 5 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded-full" />
              <div className="w-7 h-7 rounded-lg bg-slate-200" />
            </div>
            <div className="h-7 w-14 bg-slate-300 rounded" />
            <div className="h-2.5 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const levelCards = [
    {
      key: 'ALL',
      label: 'ผู้บริหารทั้งหมด',
      sub: 'ครอบคลุม 4 ระดับ',
      count: stats.executives.total,
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      activeBorder: 'border-blue-500 ring-2 ring-blue-400/50',
    },
    {
      key: 'CENTRAL',
      label: 'ส่วนราชการ',
      sub: 'กระทรวง / กรม / ส่วนกลาง',
      count: stats.byLevel.central,
      icon: Landmark,
      color: 'from-purple-600 to-indigo-800',
      activeBorder: 'border-purple-500 ring-2 ring-purple-400/50',
    },
    {
      key: 'PROVINCIAL',
      label: 'ส่วนภูมิภาค',
      sub: 'จังหวัด / ผู้ว่าฯ / หัวหน้าส่วนฯ',
      count: stats.byLevel.provincial,
      icon: MapPin,
      color: 'from-sky-600 to-blue-700',
      activeBorder: 'border-sky-500 ring-2 ring-sky-400/50',
    },
    {
      key: 'DISTRICT',
      label: 'ระดับอำเภอ',
      sub: 'นายอำเภอ / ปลัดอำเภอ',
      count: stats.byLevel.district,
      icon: Compass,
      color: 'from-teal-600 to-emerald-700',
      activeBorder: 'border-teal-500 ring-2 ring-teal-400/50',
    },
    {
      key: 'LOCAL',
      label: 'ท้องถิ่น (อปท.)',
      sub: 'อบจ. / เทศบาล / อบต.',
      count: stats.byLevel.local,
      icon: Building,
      color: 'from-amber-600 to-orange-700',
      activeBorder: 'border-amber-500 ring-2 ring-amber-400/50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Levels Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {levelCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedLevel === card.key;

          return (
            <button
              key={card.key}
              onClick={() => onSelectLevel(card.key)}
              className={`text-left relative overflow-hidden rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md bg-white border ${
                isSelected
                  ? `${card.activeBorder} bg-gradient-to-br from-white to-slate-50 shadow-md`
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-heading">
                  {card.count.toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 truncate font-heading">
                {card.label}
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{card.sub}</p>

              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-status Indicator Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200/80 text-xs shadow-sm">
        <div className="flex items-center space-x-2 text-slate-600">
          <span className="font-semibold text-slate-700">สถานะตำแหน่งปัจจุบัน:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ปฏิบัติหน้าที่:</span>
            <span className="font-bold">{stats.executives.active}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>รักษาราชการแทน:</span>
            <span className="font-bold">{stats.executives.acting}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ตำแหน่งว่าง:</span>
            <span className="font-bold">{stats.executives.vacant}</span>
          </div>

          <div className="text-slate-500 pl-2 border-l border-slate-200 hidden md:inline-block">
            <span>รวมหน่วยงานในฐานข้อมูล: </span>
            <span className="font-bold text-slate-800">{stats.organizations.total}</span> หน่วยงาน
          </div>
        </div>
      </div>
    </div>
  );
}
