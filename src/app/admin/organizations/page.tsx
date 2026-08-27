'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Building2,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  MapPin,
  Users,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ALL_PROVINCES, ORG_LEVELS } from '@/lib/thai-data';

interface Organization {
  id: string;
  code?: string | null;
  name: string;
  nameEn?: string | null;
  level: string;
  category: string;
  ministry?: string | null;
  province?: string | null;
  district?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  orderIndex: number;
  _count?: { executives: number; children: number };
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [province, setProvince] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    code: '',
    level: 'CENTRAL',
    category: 'กระทรวง',
    ministry: '',
    province: '',
    district: '',
    parentId: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    orderIndex: 1,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrgs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (level !== 'ALL') params.append('level', level);
      if (province) params.append('province', province);

      const res = await fetch(`/api/organizations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.data);
      }
    } catch (e) {
      console.error('Failed to load orgs', e);
    } finally {
      setLoading(false);
    }
  }, [level, province]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      nameEn: '',
      code: '',
      level: 'CENTRAL',
      category: 'กรม',
      ministry: '',
      province: '',
      district: '',
      parentId: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      orderIndex: 1,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || '',
      nameEn: org.nameEn || '',
      code: org.code || '',
      level: org.level || 'CENTRAL',
      category: org.category || 'กระทรวง',
      ministry: org.ministry || '',
      province: org.province || '',
      district: org.district || '',
      parentId: org.parentId || '',
      address: org.address || '',
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || '',
      orderIndex: org.orderIndex || 1,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      const url = editingOrg ? `/api/organizations/${editingOrg.id}` : '/api/organizations';
      const method = editingOrg ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกหน่วยงาน');
      }

      fetchOrgs();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงานนี้?')) return;
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'ลบหน่วยงานไม่สำเร็จ');
        return;
      }
      fetchOrgs();
    } catch (_err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      (org.category && org.category.toLowerCase().includes(q)) ||
      (org.province && org.province.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                จัดการโครงสร้างหน่วยงานภาครัฐ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                เพิ่ม ปรับปรุง และจัดสายการบังคับบัญชาของส่วนราชการ ภูมิภาค อำเภอ และ อปท.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เพิ่มหน่วยงานใหม่</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อหน่วยงาน หรือประเภท..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="">ทุกจังหวัด</option>
                {ALL_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            {ORG_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setLevel(lvl.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  level === lvl.value
                    ? 'bg-indigo-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ชื่อหน่วยงาน</th>
                  <th className="py-3.5 px-4">ประเภท</th>
                  <th className="py-3.5 px-4">ระดับการบริหาร</th>
                  <th className="py-3.5 px-4">พื้นที่ตั้ง</th>
                  <th className="py-3.5 px-4">ผู้บริหารสังกัด</th>
                  <th className="py-3.5 px-4">ช่องทางติดต่อ</th>
                  <th className="py-3.5 px-4 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                      <span>กำลังโหลดข้อมูลหน่วยงาน...</span>
                    </td>
                  </tr>
                ) : filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      ไม่พบข้อมูลหน่วยงาน
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {org.name}
                        {org.parent && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            สังกัด: {org.parent.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {org.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {org.level === 'CENTRAL'
                          ? 'ราชการส่วนกลาง'
                          : org.level === 'PROVINCIAL'
                          ? 'ราชการส่วนภูมิภาค'
                          : org.level === 'DISTRICT'
                          ? 'ระดับอำเภอ'
                          : 'ท้องถิ่น (อปท.)'}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {org.province ? (
                          <span className="flex items-center text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                            {org.district ? `อ.${org.district} ` : ''}จ.{org.province}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {org._count?.executives || 0} ท่าน
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {org.phone || org.email || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(org)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(org.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Organization Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading">
                    {editingOrg ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    กำหนดข้อมูลและระดับสายการบังคับบัญชา
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อหน่วยงาน *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น กรมการปกครอง, จังหวัดเชียงใหม่, อบจ.ชลบุรี"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับการบริหาร *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="CENTRAL">ส่วนราชการ (ส่วนกลาง)</option>
                    <option value="PROVINCIAL">ส่วนภูมิภาค (จังหวัด)</option>
                    <option value="DISTRICT">ระดับอำเภอ</option>
                    <option value="LOCAL">ท้องถิ่น (อปท.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทหน่วยงาน *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="เช่น กระทรวง, กรม, จังหวัด, อบจ., เทศบาล"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">จังหวัดที่ตั้ง</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {ALL_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อำเภอที่ตั้ง</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="เช่น เมือง, แม่ริม"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สังกัดหน่วยงานแม่ (Parent Org)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- เป็นหน่วยงานระดับบนสุด (ไม่มีสังกัดแม่) --</option>
                  {organizations
                    .filter((o) => !editingOrg || o.id !== editingOrg.id)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.category})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เว็บไซต์</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่สถานที่ทำการ</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
                >
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกหน่วยงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
