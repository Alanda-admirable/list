'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrgChartTree from '@/components/OrgChartTree';
import ExecutiveModal from '@/components/ExecutiveModal';
import { Executive } from '@/components/ExecutiveCard';
import { ALL_PROVINCES, ORG_LEVELS } from '@/lib/thai-data';
import {
  Network,
  Loader2,
  Printer,
} from 'lucide-react';

export default function OrgChartPage() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

  const fetchTree = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('tree', 'true');
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedProvince) params.append('province', selectedProvince);

      const res = await fetch(`/api/organizations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTreeData(data.data);
      }
    } catch (e) {
      console.error('Failed to load org tree', e);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedProvince]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden no-print">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm">
                <Network className="w-3.5 h-3.5" />
                <span>แผนผังสายการบังคับบัญชาและโครงสร้างองค์กร</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                แผนผังโครงสร้างหน่วยงานและผู้บริหาร
              </h2>
              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                สำรวจโครงสร้างการบริหารราชการแผ่นดินตามลำดับชั้น ราชการส่วนกลาง สู่ส่วนภูมิภาค อำเภอ และองค์กรปกครองส่วนท้องถิ่น
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์แผนผัง</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          {/* Level Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {ORG_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setSelectedLevel(lvl.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedLevel === lvl.value
                    ? 'bg-blue-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Province Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="">ทุกจังหวัด (ทั่วประเทศ)</option>
              {ALL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tree Display */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">กำลังประมวลผลแผนผังองค์กร...</p>
          </div>
        ) : (
          <div className="bg-white/50 rounded-2xl p-2 sm:p-4">
            <OrgChartTree
              nodes={treeData}
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
