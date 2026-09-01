'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisualOrgChart from '@/components/VisualOrgChart';
import OrgChartTree from '@/components/OrgChartTree';
import ExecutiveModal from '@/components/ExecutiveModal';
import { Executive } from '@/components/ExecutiveCard';
import { ALL_PROVINCES, ORG_LEVELS } from '@/lib/thai-data';
import { mergeWithLocalData, useExecutiveSync, fetchCloudOverridesClient } from '@/lib/client-sync';
import {
  Network,
  Loader2,
  Printer,
  Search,
  Layers,
  LayoutGrid,
  ListTree,
  ChevronRight,
  Home,
  RefreshCw,
  Building,
  Users,
  Filter,
} from 'lucide-react';

export default function OrgChartPage() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'visual' | 'tree' | 'drilldown'>('visual');
  const [drilldownStack, setDrilldownStack] = useState<any[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

  // Recursively apply local & cloud executive overrides to tree nodes
  const applyLocalSyncToTree = useCallback((nodes: any[], cloudOverrides: Record<string, any> = {}): any[] => {
    return nodes.map((node) => {
      const mergedExecs = node.executives && Array.isArray(node.executives)
        ? mergeWithLocalData(node.executives, cloudOverrides)
        : [];
      return {
        ...node,
        executives: mergedExecs,
        children: node.children ? applyLocalSyncToTree(node.children, cloudOverrides) : [],
      };
    });
  }, []);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('tree', 'true');
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedProvince) params.append('province', selectedProvince);

      const [dataRes, cloudOverrides] = await Promise.all([
        fetch(`/api/organizations?${params.toString()}`, { cache: 'no-store' }).then((r) => r.json()),
        fetchCloudOverridesClient(),
      ]);
      if (dataRes.success && Array.isArray(dataRes.data)) {
        const syncedTree = applyLocalSyncToTree(dataRes.data, cloudOverrides);
        setTreeData(syncedTree);
      }
    } catch (e) {
      console.error('Failed to load org chart tree', e);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedProvince, applyLocalSyncToTree]);

  // Real-time synchronization across tabs and local events
  useExecutiveSync(fetchTree);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Extract available districts from treeData
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    const extract = (node: any) => {
      if (node.district) districts.add(node.district);
      if (node.children) node.children.forEach(extract);
    };
    treeData.forEach(extract);
    return Array.from(districts).sort();
  }, [treeData]);

  // Filter treeData by district or search query
  const displayNodes = useMemo(() => {
    if (drilldownStack.length > 0) {
      const current = drilldownStack[drilldownStack.length - 1];
      return [current];
    }

    if (!selectedDistrict) return treeData;

    // Filter branches matching selected district
    const filterByDist = (node: any): any => {
      if (node.district === selectedDistrict) return node;
      if (node.children) {
        const matchingKids = node.children
          .map(filterByDist)
          .filter(Boolean);
        if (matchingKids.length > 0) {
          return { ...node, children: matchingKids };
        }
      }
      return null;
    };

    return treeData.map(filterByDist).filter(Boolean);
  }, [treeData, selectedDistrict, drilldownStack]);

  // Count total stats
  const totalStats = useMemo(() => {
    let orgs = 0;
    let execs = 0;
    const count = (node: any) => {
      orgs++;
      execs += node.executives?.length || 0;
      if (node.children) node.children.forEach(count);
    };
    displayNodes.forEach(count);
    return { orgs, execs };
  }, [displayNodes]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm">
                <Network className="w-3.5 h-3.5" />
                <span>แผนผังสายการบังคับบัญชาและโครงสร้างองค์กร (Org Chart Tree)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
                ผังโครงสร้างสายการบังคับบัญชา
              </h2>
              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                สำรวจโครงสร้างการบริหารราชการแผ่นดินไทยแบบเจาะลึก 4 ระดับ เชื่อมโยงจากผู้ว่าราชการจังหวัด/ส่วนกลาง สู่ที่ว่าการอำเภอ และองค์กรปกครองส่วนท้องถิ่น (เทศบาล/อบต.)
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchTree()}
                className="flex items-center space-x-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all"
                title="โหลดข้อมูลใหม่"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเฟรช</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์แผนผัง (Print)</span>
              </button>
            </div>
          </div>

          {/* Stats Badges in Hero */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="flex items-center space-x-2.5">
              <Building className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">หน่วยงานในผัง</span>
                <span className="text-base font-bold text-white">{totalStats.orgs} แห่ง</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">ผู้บริหารที่สังกัด</span>
                <span className="text-base font-bold text-white">{totalStats.execs} ท่าน</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Filter className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">อำเภอในพื้นที่</span>
                <span className="text-base font-bold text-white">{availableDistricts.length} อำเภอ</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">ระดับการบริหาร</span>
                <span className="text-base font-bold text-white">4 ระดับราชการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 no-print">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* View Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start">
              <button
                onClick={() => {
                  setViewMode('visual');
                  setDrilldownStack([]);
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'visual'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>ผังบนลงล่าง (Visual Flow)</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('tree');
                  setDrilldownStack([]);
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'tree'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>รายการกิ่งไม้ (Indented Tree)</span>
              </button>
            </div>

            {/* Live Search in Tree */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหน่วยงาน, ผู้บริหาร, หรือตำแหน่งในผัง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Level Tabs & Filters */}
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Level Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {ORG_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setSelectedLevel(lvl.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedLevel === lvl.value
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Select Province & District */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedDistrict('');
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="">ทุกจังหวัด</option>
                {ALL_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    จ.{p}
                  </option>
                ))}
              </select>

              {availableDistricts.length > 0 && (
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="">ทุกอำเภอในจังหวัด</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      อ.{d}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Drill-down Breadcrumbs */}
        {drilldownStack.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-2 text-xs font-medium text-blue-900 overflow-x-auto no-print">
            <button
              onClick={() => setDrilldownStack([])}
              className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-bold hover:underline"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ภาพรวมหลัก</span>
            </button>

            {drilldownStack.map((step, idx) => (
              <React.Fragment key={step.id}>
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <button
                  onClick={() => setDrilldownStack(drilldownStack.slice(0, idx + 1))}
                  className={`whitespace-nowrap ${
                    idx === drilldownStack.length - 1 ? 'font-bold text-blue-950' : 'hover:underline text-blue-700'
                  }`}
                >
                  {step.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main Chart Viewer */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">กำลังจัดเรียงสายการบังคับบัญชา...</p>
            <p className="text-xs text-slate-400">กรุณารอสักครู่</p>
          </div>
        ) : viewMode === 'visual' ? (
          <div className="bg-slate-100/60 border border-slate-200/80 rounded-3xl p-4 sm:p-8 min-h-[500px]">
            <VisualOrgChart
              nodes={displayNodes}
              onSelectExecutive={(exec) => setSelectedExecutive(exec)}
              onDrillDown={(node) => setDrilldownStack([...drilldownStack, node])}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <OrgChartTree
              nodes={displayNodes}
              onSelectExecutive={(exec) => setSelectedExecutive(exec)}
            />
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
