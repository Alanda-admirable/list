'use client';

import React from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Download,
  Printer,
  Building,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  ALL_PROVINCES,
  ORG_LEVELS,
  CATEGORIES_BY_LEVEL,
} from '@/lib/thai-data';

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  selectedProvince: string;
  setSelectedProvince: (p: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  onReset: () => void;
  totalResults: number;
}

export default function HierarchyFilter({
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedProvince,
  setSelectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onReset,
  totalResults,
}: FilterProps) {
  const isFiltered =
    searchQuery ||
    selectedLevel !== 'ALL' ||
    selectedProvince ||
    selectedDistrict ||
    selectedCategory ||
    selectedStatus;

  // Available categories based on level
  const availableCategories =
    selectedLevel !== 'ALL' && CATEGORIES_BY_LEVEL[selectedLevel]
      ? CATEGORIES_BY_LEVEL[selectedLevel]
      : Object.values(CATEGORIES_BY_LEVEL).flat();

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
    if (selectedProvince) params.append('province', selectedProvince);
    if (selectedStatus) params.append('status', selectedStatus);

    window.open(`/api/import-export?type=export&${params.toString()}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 no-print">
      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด่วน: ชื่อ-นามสกุล, ตำแหน่ง, หน่วยงาน, สังกัด หรือจังหวัด..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded-md"
            >
              ล้าง
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="ส่งออกผลการค้นหาเป็น Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">ส่งออก Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="พิมพ์ทำเนียบรายชื่อ"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">พิมพ์ทำเนียบ</span>
          </button>

          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center justify-center space-x-1.5 px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
        {ORG_LEVELS.map((lvl) => {
          const isActive = selectedLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              onClick={() => {
                setSelectedLevel(lvl.value);
                // If level changes, reset specific category if incompatible
                setSelectedCategory('');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {/* Province Filter (Relevant for Provincial, District, Local or All) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            จังหวัด / พื้นที่
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            >
              <option value="">ทุกจังหวัด (ทั่วประเทศ)</option>
              {ALL_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            ประเภทหน่วยงาน
          </label>
          <div className="relative">
            <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            >
              <option value="">ทุกประเภทหน่วยงาน</option>
              {availableCategories.map((cat, idx) => (
                <option key={`${cat}-${idx}`} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            สถานะการดำรงตำแหน่ง
          </label>
          <div className="relative">
            <CheckCircle2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            >
              <option value="">ทุกสถานะ</option>
              <option value="ACTIVE">ปฏิบัติราชการ (Active)</option>
              <option value="ACTING">รักษาราชการแทน (Acting)</option>
              <option value="VACANT">ตำแหน่งว่าง (Vacant)</option>
              <option value="RETIRED">พ้นจากตำแหน่ง (Retired)</option>
            </select>
          </div>
        </div>

        {/* District or Keyword specifier */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            ระบุอำเภอ / กอง / สังกัด
          </label>
          <input
            type="text"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            placeholder="เช่น เมือง, ปากช่อง, กรมปกครอง"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Result Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>
            พบข้อมูลผู้บริหารทั้งหมด: <strong className="text-slate-800 font-semibold">{totalResults}</strong> รายชื่อ
          </span>
          {isFiltered && <span className="text-amber-600 font-medium">(มีตัวกรองทำงานอยู่)</span>}
        </div>
        <div className="text-[11px] text-slate-400">
          คลิกที่การ์ดเพื่อดูประวัติและช่องทางการติดต่อฉบับเต็ม
        </div>
      </div>
    </div>
  );
}
