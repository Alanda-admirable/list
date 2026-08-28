'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ORG_LEVELS } from '@/lib/thai-data';
import {
  Camera,
  Search,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Trash2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ExecutiveItem {
  id: string;
  prefix?: string | null;
  firstName: string;
  lastName: string;
  position: string;
  positionLevel?: string | null;
  avatarUrl?: string | null;
  photoVerified?: boolean;
  photoSource?: string | null;
  status: string;
  organization: {
    id: string;
    name: string;
    level: string;
    category: string;
    province?: string | null;
    district?: string | null;
  };
}

export default function PhotoMatcherPage() {
  const [executives, setExecutives] = useState<ExecutiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MISSING' | 'VERIFIED'>('MISSING');

  // Input states for each row: executiveId -> url string
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  // Bulk Upload state
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  const fetchExecutives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/executives?limit=1000');
      const data = await res.json();
      if (data.success) {
        setExecutives(data.data);
      }
    } catch (e) {
      console.error('Failed to load executives', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutives();
  }, [fetchExecutives]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = executives.length;
    const verified = executives.filter((e) => e.avatarUrl && !e.avatarUrl.includes('.svg')).length;
    const missing = total - verified;
    const percent = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, missing, percent };
  }, [executives]);

  // Extract available districts
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    executives.forEach((e) => {
      if (e.organization?.district) set.add(e.organization.district);
    });
    return Array.from(set).sort();
  }, [executives]);

  // Filtered List
  const filteredList = useMemo(() => {
    return executives.filter((exec) => {
      const hasPhoto = !!exec.avatarUrl && !exec.avatarUrl.includes('.svg');
      if (filterMode === 'MISSING' && hasPhoto) return false;
      if (filterMode === 'VERIFIED' && !hasPhoto) return false;
      if (selectedLevel !== 'ALL' && exec.organization?.level !== selectedLevel) return false;
      if (selectedDistrict && exec.organization?.district !== selectedDistrict) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const full = `${exec.prefix || ''}${exec.firstName} ${exec.lastName} ${exec.position} ${exec.organization?.name}`.toLowerCase();
        if (!full.includes(q)) return false;
      }

      return true;
    });
  }, [executives, filterMode, selectedLevel, selectedDistrict, searchQuery]);

  // Handle Save Image URL
  const handleSaveUrl = async (executiveId: string) => {
    const url = urlInputs[executiveId]?.trim();
    if (!url) return;

    setSavingId(executiveId);
    setFeedback(null);

    try {
      const res = await fetch('/api/fetch-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executiveId, imageUrl: url }),
      });
      const data = await res.json();

      if (data.success) {
        setExecutives((prev) =>
          prev.map((ex) => (ex.id === executiveId ? { ...ex, avatarUrl: data.avatarUrl } : ex))
        );
        setUrlInputs((prev) => ({ ...prev, [executiveId]: '' }));
        setFeedback({ id: executiveId, msg: 'บันทึกรูปถ่ายจริงสำเร็จ!', type: 'success' });
      } else {
        setFeedback({ id: executiveId, msg: data.error || 'บันทึกไม่สำเร็จ', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ id: executiveId, msg: err.message || 'บันทึกไม่สำเร็จ', type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  // Handle Upload File for specific executive
  const handleFileUpload = async (executiveId: string, file: File) => {
    setSavingId(executiveId);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('executiveId', executiveId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setExecutives((prev) =>
          prev.map((ex) => (ex.id === executiveId ? { ...ex, avatarUrl: data.url } : ex))
        );
        setFeedback({ id: executiveId, msg: 'อัปโหลดรูปถ่ายจริงสำเร็จ!', type: 'success' });
      } else {
        setFeedback({ id: executiveId, msg: data.error || 'อัปโหลดไม่สำเร็จ', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ id: executiveId, msg: err.message || 'อัปโหลดไม่สำเร็จ', type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async (executiveId: string) => {
    setSavingId(executiveId);
    try {
      const res = await fetch(`/api/executives/${executiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: null }),
      });
      const data = await res.json();
      if (data.success) {
        setExecutives((prev) =>
          prev.map((ex) => (ex.id === executiveId ? { ...ex, avatarUrl: null } : ex))
        );
      }
    } catch (err) {
      console.error('Failed to remove photo', err);
    } finally {
      setSavingId(null);
    }
  };

  // Bulk Upload files
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBulkUploading(true);
    setBulkResult(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setBulkResult(`สำเร็จ! จับคู่ภาพถ่ายจริงได้ ${data.matchedCount} จาก ${data.totalCount} ไฟล์`);
        fetchExecutives();
      } else {
        setBulkResult(`ข้อผิดพลาด: ${data.error}`);
      }
    } catch (err: any) {
      setBulkResult(`อัปโหลดล้มเหลว: ${err.message}`);
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <Link
                  href="/admin"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="กลับศูนย์ควบคุม"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm">
                  <Camera className="w-3.5 h-3.5" />
                  <span>ระบบค้นหาและจับคู่รูปถ่ายจริง (Real Photo Matcher Studio)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                ศูนย์จัดการและค้นหารูปถ่ายจริงของผู้บริหาร
              </h2>
              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                ค้นหารูปภาพจริงจาก Google Images / เว็บหน่วยงานราชการ และนำเข้าสู่ระบบด้วยคลิกเดียว หรือลากไฟล์ภาพหลายๆ คนมาวางพร้อมกัน
              </p>
            </div>

            {/* Bulk Upload Button */}
            <div className="flex flex-col items-start lg:items-end gap-2">
              <label className="cursor-pointer flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-bold shadow-lg transition-all border border-white/20">
                <Upload className="w-4 h-4" />
                <span>{bulkUploading ? 'กำลังประมวลผล...' : '📁 ลาก/เลือกรูปหลายคนพร้อมกัน'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkUpload}
                  disabled={bulkUploading}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-blue-200/70">
                ระบบจะตรวจจับชื่อคนจากชื่อไฟล์ภาพอัตโนมัติ
              </span>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-4">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  มีรูปถ่ายจริงแล้ว: {stats.verified} ท่าน
                </span>
                <span className="text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  ยังไม่มีรูปถ่าย: {stats.missing} ท่าน
                </span>
              </div>
              <span className="text-white">ความครอบคลุม: {stats.percent}% ({stats.verified}/{stats.total})</span>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>

        {bulkResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{bulkResult}</span>
            <button onClick={() => setBulkResult(null)} className="text-emerald-600 hover:underline">
              ปิด
            </button>
          </div>
        )}

        {/* Filters & Tabs */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setFilterMode('MISSING')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'MISSING'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ยังไม่มีรูปถ่าย ({stats.missing})
              </button>

              <button
                onClick={() => setFilterMode('VERIFIED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                มีรูปถ่ายจริงแล้ว ({stats.verified})
              </button>

              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ผู้บริหารทั้งหมด ({stats.total})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ตำแหน่ง หรือหน่วยงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Level and District dropdowns */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="ALL">ระดับการบริหาร: ทั้งหมด</option>
              {ORG_LEVELS.filter((l) => l.value !== 'ALL').map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="">พื้นที่อำเภอ: ทุกอำเภอ</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  อำเภอ{d}
                </option>
              ))}
            </select>

            <div className="ml-auto text-xs text-slate-500 font-medium">
              แสดง {filteredList.length} รายการ
            </div>
          </div>
        </div>

        {/* Executives List for Photo Matching */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">กำลังโหลดรายชื่อผู้บริหาร...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200 text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-base text-slate-800">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-400">ผู้บริหารทุกคนในเงื่อนไขนี้มีรูปภาพครบถ้วนแล้ว</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((exec) => {
              const hasPhoto = !!exec.avatarUrl && !exec.avatarUrl.includes('.svg');
              const isSaving = savingId === exec.id;
              const currentInputUrl = urlInputs[exec.id] || '';
              const fullName = `${exec.prefix || ''} ${exec.firstName} ${exec.lastName}`.trim();
              const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                `"${exec.firstName} ${exec.lastName}" ${exec.position} ปทุมธานี`
              )}`;

              return (
                <div
                  key={exec.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col justify-between ${
                    hasPhoto ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Photo Preview + Info */}
                    <div className="flex items-start space-x-3.5">
                      {/* Photo Box */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-300 flex-shrink-0 flex items-center justify-center relative shadow-xs">
                        {hasPhoto ? (
                          <img
                            src={exec.avatarUrl!}
                            alt={fullName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 text-center p-1">
                            <Camera className="w-6 h-6 mb-1 text-slate-300" />
                            <span className="text-[9px] font-semibold text-slate-400">ยังไม่มีรูป</span>
                          </div>
                        )}

                        {hasPhoto && (
                          <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded shadow">
                            จริง
                          </span>
                        )}
                      </div>

                      {/* Name & Org Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[180px]">
                            {exec.organization?.category || 'หน่วยงาน'}
                          </span>
                          {exec.organization?.district && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              อ.{exec.organization.district}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 font-heading truncate leading-snug">
                          {fullName}
                        </h4>

                        <p className="text-xs font-semibold text-blue-900 line-clamp-1 mt-0.5">
                          {exec.position}
                        </p>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          🏢 {exec.organization?.name}
                        </p>
                      </div>
                    </div>

                    {/* Search & Upload Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={googleSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                          title="เปิด Google Images เพื่อค้นหารูปจริงของท่านนี้"
                        >
                          <Search className="w-3.5 h-3.5 text-blue-600" />
                          <span>ค้นหาบน Google Images</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 text-blue-500" />
                        </a>
                      </div>

                      {/* Upload local file button */}
                      <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>เลือกรูปจากเครื่อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(exec.id, f);
                          }}
                        />
                      </label>
                    </div>

                    {/* Paste Image URL Box / Ctrl+V */}
                    <div className="flex items-center space-x-2 pt-1">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="วางลิงก์รูปภาพ หรือคลิกที่นี่แล้วกด Ctrl+V เพื่อวางรูป..."
                          value={currentInputUrl}
                          onChange={(e) =>
                            setUrlInputs((prev) => ({ ...prev, [exec.id]: e.target.value }))
                          }
                          onPaste={async (e) => {
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            for (let i = 0; i < items.length; i++) {
                              if (items[i].type.indexOf('image') !== -1) {
                                const file = items[i].getAsFile();
                                if (file) {
                                  e.preventDefault();
                                  handleFileUpload(exec.id, file);
                                  return;
                                }
                              }
                            }
                          }}
                          className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                        />
                      </div>

                      <button
                        onClick={() => handleSaveUrl(exec.id)}
                        disabled={!currentInputUrl || isSaving}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex-shrink-0"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'ผูกรูป'}
                      </button>

                      {hasPhoto && (
                        <button
                          onClick={() => handleRemovePhoto(exec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบรูปภาพ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Verification Status & Source */}
                    {hasPhoto && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <button
                          onClick={async () => {
                            const newStatus = !exec.photoVerified;
                            try {
                              const res = await fetch(`/api/executives/${exec.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ photoVerified: newStatus }),
                              });
                              if (res.ok) {
                                setExecutives((prev) =>
                                  prev.map((e) =>
                                    e.id === exec.id ? { ...e, photoVerified: newStatus } : e
                                  )
                                );
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            exec.photoVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{exec.photoVerified ? '✓ ตรวจเช็คความถูกต้องแล้ว' : 'รอการตรวจเช็ค (คลิกเพื่อยืนยัน)'}</span>
                        </button>

                        {exec.photoSource && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={exec.photoSource}>
                            📌 {exec.photoSource}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feedback message */}
                    {feedback?.id === exec.id && (
                      <div
                        className={`text-[11px] font-semibold ${
                          feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {feedback.msg}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
