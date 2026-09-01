'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Building,
  Save,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  Search,
  ChevronDown,
  Check,
  Camera,
  Upload,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { Executive } from './ExecutiveCard';
import { PREFIXES } from '@/lib/thai-data';
import {
  saveExecutiveUpdateLocally,
  saveExecutiveCreateLocally,
  saveExecutiveDeleteLocally,
} from '@/lib/client-sync';
import { processAndCompressImage } from '@/lib/image-processor';
import { useModalBehavior } from '@/hooks/useModalBehavior';

interface FormModalProps {
  isOpen: boolean;
  executive: Executive | null; // If null, create mode
  organizations: Array<{ id: string; name: string; level: string; category: string; province?: string | null; district?: string | null }>;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExecutiveFormModal({
  isOpen,
  executive,
  organizations = [],
  onClose,
  onSaved,
}: FormModalProps) {
  const isEdit = !!executive;

  const [orgList, setOrgList] = useState<any[]>(organizations);
  const [orgSearch, setOrgSearch] = useState('');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  // Modal accessibility hook (ESC key, scroll lock, backdrop click)
  const { handleBackdropClick } = useModalBehavior({ isOpen, onClose });

  const [formData, setFormData] = useState({
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    position: '',
    positionLevel: 'นักบริหารระดับสูง',
    organizationId: '',
    status: 'ACTIVE',
    appointmentDate: '',
    endDate: '',
    orderReference: '',
    phone: '',
    email: '',
    avatarUrl: '',
    bio: '',
    orderIndex: 1,
    isTransfer: false,
    transferNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-fetch organizations if not provided or empty
  useEffect(() => {
    if (isOpen) {
      if (organizations && organizations.length > 0) {
        setOrgList(organizations);
      } else {
        fetch('/api/organizations?limit=1000')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setOrgList(data.data);
            }
          })
          .catch((err) => console.error('Failed to load organizations in modal', err));
      }
    }
  }, [organizations, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (executive) {
      setFormData({
        prefix: executive.prefix || 'นาย',
        firstName: executive.firstName || '',
        lastName: executive.lastName || '',
        position: executive.position || '',
        positionLevel: executive.positionLevel || 'นักบริหารระดับสูง',
        organizationId: executive.organizationId || (orgList[0]?.id || ''),
        status: executive.status || 'ACTIVE',
        appointmentDate: executive.appointmentDate
          ? new Date(executive.appointmentDate).toISOString().split('T')[0]
          : '',
        endDate: executive.endDate
          ? new Date(executive.endDate).toISOString().split('T')[0]
          : '',
        orderReference: executive.orderReference || '',
        phone: executive.phone || '',
        email: executive.email || '',
        avatarUrl: executive.avatarUrl || '',
        bio: executive.bio || '',
        orderIndex: executive.orderIndex || 1,
        isTransfer: false,
        transferNotes: '',
      });
      setOrgSearch(executive.organization?.name || '');
    } else {
      setFormData({
        prefix: 'นาย',
        firstName: '',
        lastName: '',
        position: '',
        positionLevel: 'นักบริหารระดับสูง',
        organizationId: orgList[0]?.id || '',
        status: 'ACTIVE',
        appointmentDate: new Date().toISOString().split('T')[0],
        endDate: '',
        orderReference: '',
        phone: '',
        email: '',
        avatarUrl: '',
        bio: '',
        orderIndex: 1,
        isTransfer: false,
        transferNotes: '',
      });
      if (organizations[0]) {
        setOrgSearch(organizations[0].name);
      }
    }
  }, [executive, organizations, isOpen]);

  // Click outside to close org dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Selected organization object
  const selectedOrg = orgList.find((o) => o.id === formData.organizationId);

  // Filter organizations based on search query
  const filteredOrgs = orgList.filter((org) => {
    if (!orgSearch) return true;
    const q = orgSearch.toLowerCase().trim();
    return (
      org.name.toLowerCase().includes(q) ||
      (org.category && org.category.toLowerCase().includes(q)) ||
      (org.province && org.province.toLowerCase().includes(q)) ||
      (org.district && org.district.toLowerCase().includes(q)) ||
      (org.level && org.level.toLowerCase().includes(q))
    );
  });

  const handleSelectOrg = (org: any) => {
    setFormData((prev) => ({ ...prev, organizationId: org.id }));
    setOrgSearch(org.name);
    setIsOrgDropdownOpen(false);
  };

  // Safe image processor with transparent PNG fix and direct Supabase Cloud upload
  const processImageFile = async (file: File) => {
    try {
      setError('');
      setIsUploadingImage(true);

      // 1. Generate client-side preview immediately
      const base64Preview = await processAndCompressImage(file, {
        maxWidth: 400,
        maxHeight: 500,
        quality: 0.85,
        fillColor: '#FFFFFF',
      });
      
      // 2. Upload to Supabase Public Storage via /api/upload
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      if (executive?.id) {
        uploadForm.append('executiveId', executive.id);
      }

      let uploadedUrl: string | null = null;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        });
        const text = await res.text();
        const uploadData = text.startsWith('{') ? JSON.parse(text) : null;
        if (uploadData?.success && uploadData?.url) {
          uploadedUrl = uploadData.url;
        }
      } catch (uploadErr) {
        console.warn('API upload failed, using local preview:', uploadErr);
      }

      setFormData((prev) => ({
        ...prev,
        avatarUrl: uploadedUrl || base64Preview,
        photoVerified: true,
        photoSource: uploadedUrl ? 'Supabase Public Storage' : 'Local Storage',
      }));
    } catch (err: any) {
      console.error('Failed to process image:', err);
      setError(err.message || 'ไม่สามารถประมวลผลรูปภาพได้');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/executives/${executive.id}` : '/api/executives';
      const method = isEdit ? 'PUT' : 'POST';

      let serverData: any = null;

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const text = await res.text();
        if (text.startsWith('{')) {
          serverData = JSON.parse(text);
        }
      } catch (networkErr) {
        console.warn('Network sync failed, saving locally:', networkErr);
      }

      if (serverData && !serverData.success && serverData.error) {
        throw new Error(serverData.error);
      }

      if (isEdit && executive) {
        saveExecutiveUpdateLocally(executive.id, {
          ...formData,
          organization: selectedOrg || executive.organization,
        });
      } else {
        const newId = serverData?.data?.id || ('exec_' + Date.now());
        saveExecutiveCreateLocally({
          ...formData,
          id: newId,
          organization: selectedOrg,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          histories: [],
        } as any);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!executive) return;
    setLoading(true);
    setError('');

    try {
      try {
        await fetch(`/api/executives/${executive.id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Server delete failed, applying local delete', e);
      }
      saveExecutiveDeleteLocally(executive.id);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'ลบข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              {isEdit ? <User className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">
                {isEdit ? 'แก้ไขข้อมูลผู้บริหาร / บันทึกการโยกย้าย' : 'เพิ่มรายชื่อผู้บริหารใหม่'}
              </h2>
              <p className="text-xs text-slate-300">
                {isEdit ? 'ปรับปรุงประวัติ สถานะ หรือคำสั่งแต่งตั้ง' : 'กรอกข้อมูลเพื่อนำเข้าสู่ทำเนียบ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Transfer / Promotion Toggle (Edit Mode Only) */}
          {isEdit && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTransfer}
                  onChange={(e) => setFormData({ ...formData, isTransfer: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-amber-300"
                />
                <span className="text-xs font-bold text-amber-900 flex items-center">
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-amber-700" />
                  บันทึกการโยกย้าย / เลื่อนตำแหน่ง (สร้าง Position History อัตโนมัติ)
                </span>
              </label>

              {formData.isTransfer && (
                <div className="pt-2 border-t border-amber-200/60">
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    หมายเหตุคำสั่งโยกย้าย / มติ ครม.
                  </label>
                  <input
                    type="text"
                    value={formData.transferNotes}
                    onChange={(e) => setFormData({ ...formData, transferNotes: e.target.value })}
                    placeholder="เช่น โยกย้ายตามวาระประจำปี หรือ เลื่อนขั้นตามคำสั่ง มท."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Organization & Level Selection with Search Autocomplete */}
          <div className="space-y-1.5" ref={orgDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
                สังกัดหน่วยงาน *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                (มีให้เลือก {orgList.length} หน่วยงาน)
              </span>
            </div>

            <div className="relative">
              {/* Search / Select Input */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => {
                    setOrgSearch(e.target.value);
                    setIsOrgDropdownOpen(true);
                  }}
                  onFocus={() => setIsOrgDropdownOpen(true)}
                  placeholder="พิมพ์ค้นหาชื่อหน่วยงาน (เช่น อบจ., เทศบาล, อำเภอ, ปทุมธานี)..."
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
                />
                
                <div className="absolute right-2 flex items-center space-x-1">
                  {orgSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrgSearch('');
                        setFormData((prev) => ({ ...prev, organizationId: '' }));
                        setIsOrgDropdownOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md text-[10px]"
                      title="ล้างคำค้นหา"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Hidden input for HTML form validation */}
              <input
                type="hidden"
                value={formData.organizationId}
                required
              />

              {/* Selected Organization Summary Pill */}
              {selectedOrg && (
                <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-blue-900 truncate">
                      {selectedOrg.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-blue-700 border border-blue-200 flex-shrink-0">
                      {selectedOrg.level === 'CENTRAL'
                        ? 'ส่วนกลาง'
                        : selectedOrg.level === 'PROVINCIAL'
                        ? 'ส่วนภูมิภาค'
                        : selectedOrg.level === 'DISTRICT'
                        ? 'ระดับอำเภอ'
                        : 'ท้องถิ่น (อปท.)'}
                    </span>
                    {selectedOrg.province && (
                      <span className="text-[11px] text-slate-500 flex-shrink-0">
                        จ.{selectedOrg.province}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold flex-shrink-0 ml-2">
                    ✓ เลือกแล้ว
                  </span>
                </div>
              )}

              {/* Dropdown Options Popup */}
              {isOrgDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredOrgs.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      ไม่พบหน่วยงานที่ตรงกับ &quot;{orgSearch}&quot;
                    </div>
                  ) : (
                    filteredOrgs.map((org) => {
                      const isSelected = org.id === formData.organizationId;
                      return (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => handleSelectOrg(org)}
                          className={`w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between group ${
                            isSelected ? 'bg-blue-50 font-semibold' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  org.level === 'CENTRAL'
                                    ? 'bg-purple-100 text-purple-800'
                                    : org.level === 'PROVINCIAL'
                                    ? 'bg-blue-100 text-blue-800'
                                    : org.level === 'DISTRICT'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {org.level === 'CENTRAL'
                                  ? 'ส่วนกลาง'
                                  : org.level === 'PROVINCIAL'
                                  ? 'ส่วนภูมิภาค'
                                  : org.level === 'DISTRICT'
                                  ? 'อำเภอ'
                                  : 'อปท.'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium truncate">
                                {org.category || 'หน่วยงาน'}
                              </span>
                              {org.province && (
                                <span className="text-[10px] text-slate-400">
                                  {org.district ? `อ.${org.district} ` : ''}จ.{org.province}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-800 group-hover:text-blue-900 font-medium truncate">
                              {org.name}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">คำนำหน้า *</label>
              <input
                list="prefix-list"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <datalist id="prefix-list">
                {PREFIXES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">นามสกุล *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Position Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อตำแหน่ง *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="เช่น ผู้ว่าราชการจังหวัด..., ปลัดกระทรวง..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับตำแหน่ง / ซี</label>
              <input
                type="text"
                value={formData.positionLevel}
                onChange={(e) => setFormData({ ...formData, positionLevel: e.target.value })}
                placeholder="เช่น นักบริหารระดับสูง (ซี 10), ผู้บริหารท้องถิ่น"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Status & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะการดำรงตำแหน่ง</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              >
                <option value="ACTIVE">ปฏิบัติราชการ (Active)</option>
                <option value="ACTING">รักษาราชการแทน (Acting)</option>
                <option value="VACANT">ตำแหน่งว่าง (Vacant)</option>
                <option value="RETIRED">พ้นจากตำแหน่ง (Retired)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ได้รับการแต่งตั้ง</label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ลำดับการแสดงผล</label>
              <input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Order Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่คำสั่งแต่งตั้ง / ประกาศ</label>
            <input
              type="text"
              value={formData.orderReference}
              onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
              placeholder="เช่น คำสั่งกระทรวงมหาดไทย ที่ 450/2567"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="เช่น 02-280-9000 ต่อ 101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลทางการ</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="เช่น official@agency.go.th"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Photo Avatar Upload & Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1 text-blue-600" />
                รูปถ่ายประจำตัวผู้บริหาร (Executive Portrait)
              </label>
              {formData.avatarUrl && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ มีรูปถ่ายแล้ว
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Preview Box */}
              <div className="w-20 h-24 rounded-2xl bg-white border-2 border-slate-300 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm relative group">
                {isUploadingImage ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-1" />
                    <span className="text-[8px] font-bold">กำลังอัปโหลด...</span>
                  </div>
                ) : formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 text-center p-1">
                    <User className="w-8 h-8 text-slate-300 mb-0.5" />
                    <span className="text-[9px] text-slate-400 font-medium">ไม่มีรูป</span>
                  </div>
                )}
              </div>

              {/* Upload Controls, Google Search & Paste Box */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Choose local file */}
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>เลือกรูปจากเครื่อง...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) processImageFile(f);
                      }}
                    />
                  </label>

                  {/* Google Images Search */}
                  {formData.firstName && (
                    <a
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                        `"${formData.firstName} ${formData.lastName}" ${formData.position} ปทุมธานี`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
                      title="ค้นหารูปจริงจาก Google Images"
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ค้นหารูปบน Google</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 text-indigo-500" />
                    </a>
                  )}

                  {/* Clear photo */}
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                    >
                      ล้างรูป
                    </button>
                  )}
                </div>

                {/* Paste URL or Ctrl+V box */}
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.avatarUrl.startsWith('data:') ? '(รูปภาพที่อัปโหลดจากเครื่องพร้อมใช้งาน)' : formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (!items) return;
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                          const file = items[i].getAsFile();
                          if (file) {
                            e.preventDefault();
                            processImageFile(file);
                            return;
                          }
                        }
                      }
                    }}
                    placeholder="วางลิงก์รูปภาพ หรือคลิกแล้วกด Ctrl+V เพื่อวางรูปภาพที่คัดลอกมา..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ประวัติย่อ / นโยบายหลัก</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="สรุปประวัติหรือผลงานสำคัญ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Delete confirmation section (Edit mode only) */}
          {isEdit && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {deleteConfirm ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-rose-600 font-semibold">ยืนยันการลบ?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                  >
                    ลบข้อมูลทันที
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบรายชื่อนี้ออกจากระบบ</span>
                </button>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
