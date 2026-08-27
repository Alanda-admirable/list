'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building,
  Save,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { Executive } from './ExecutiveCard';
import { PREFIXES } from '@/lib/thai-data';

interface FormModalProps {
  isOpen: boolean;
  executive: Executive | null; // If null, create mode
  organizations: Array<{ id: string; name: string; level: string; category: string; province?: string | null }>;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExecutiveFormModal({
  isOpen,
  executive,
  organizations,
  onClose,
  onSaved,
}: FormModalProps) {
  const isEdit = !!executive;

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

  useEffect(() => {
    if (executive) {
      setFormData({
        prefix: executive.prefix || 'นาย',
        firstName: executive.firstName || '',
        lastName: executive.lastName || '',
        position: executive.position || '',
        positionLevel: executive.positionLevel || 'นักบริหารระดับสูง',
        organizationId: executive.organizationId || (organizations[0]?.id || ''),
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
    } else {
      setFormData({
        prefix: 'นาย',
        firstName: '',
        lastName: '',
        position: '',
        positionLevel: 'นักบริหารระดับสูง',
        organizationId: organizations[0]?.id || '',
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
    }
    setError('');
    setDeleteConfirm(false);
  }, [executive, organizations, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/executives/${executive.id}` : '/api/executives';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
      const res = await fetch(`/api/executives/${executive.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'ลบข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
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

          {/* Organization & Level Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              สังกัดหน่วยงาน *
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
            >
              <option value="">-- เลือกหน่วยงานที่สังกัด --</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  [{org.level === 'CENTRAL' ? 'ส่วนกลาง' : org.level === 'PROVINCIAL' ? 'ภูมิภาค' : org.level === 'DISTRICT' ? 'อำเภอ' : 'ท้องถิ่น'}] {org.name} {org.province ? `(${org.province})` : ''}
                </option>
              ))}
            </select>
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

          {/* Photo Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL รูปภาพประจำตัว (Portrait)</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
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
