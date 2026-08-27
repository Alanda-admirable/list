'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Handle File Selection & Parse Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setPreviewRows(json.slice(0, 10)); // preview first 10 rows
      } catch (_err: any) {
        setError('ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Submit Import
  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import-export', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'การนำเข้าข้อมูลล้มเหลว');
      }

      setResult(data);
      setFile(null);
      setPreviewRows([]);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ระบบนำเข้าและส่งออกข้อมูลแบบกลุ่ม (Bulk Data Sync)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              นำเข้าและส่งออกข้อมูลทำเนียบ (Excel)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              อัปเดตข้อมูลผู้บริหารจำนวนมากผ่านไฟล์ Excel (.xlsx) พร้อมระบบตรวจสอบความถูกต้องอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/api/import-export?type=template"
              download
              className="flex items-center space-x-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow transition-all"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>ดาวน์โหลด Template Excel</span>
            </a>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Import Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  1. อัปโหลดไฟล์ Excel (.xlsx)
                </h3>
                <p className="text-xs text-slate-500">
                  เลือกไฟล์ Excel ที่จัดเตรียมตามรูปแบบแม่แบบ
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์ .xlsx และ .xls
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewRows([]);
                  }}
                  className="text-rose-600 hover:underline font-semibold ml-2"
                >
                  ลบ
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {file && (
              <button
                onClick={handleImport}
                disabled={uploading}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังนำเข้าข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>เริ่มกระบวนการนำเข้า (Import Data)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Card 2: Export Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    2. ส่งออกทำเนียบผู้บริหาร (Export)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ดาวน์โหลดฐานข้อมูลผู้บริหารทั้งหมดออกเป็นไฟล์ Excel เพื่อนำไปใช้งานต่อ
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="font-semibold text-slate-800">
                  คุณสมบัติการส่งออก:
                </div>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-500">
                  <li>รวมข้อมูล 4 ระดับ (ส่วนกลาง ภูมิภาค อำเภอ ท้องถิ่น)</li>
                  <li>ประกอบด้วยชื่อ-สกุล, ตำแหน่ง, เลขที่คำสั่ง, เบอร์โทร, อีเมล</li>
                  <li>บันทึกวันที่อัปเดตล่าสุดของแต่ละรายชื่อ</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <a
                href="/api/import-export?type=export"
                target="_blank"
                download
                className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออกข้อมูลทั้งหมด (Full Export)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/api/import-export?type=export&level=CENTRAL"
                  className="text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  เฉพาะส่วนกลาง
                </a>
                <a
                  href="/api/import-export?type=export&level=PROVINCIAL"
                  className="text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  เฉพาะส่วนภูมิภาค
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Result Notification Card */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 font-heading">
                  {result.message}
                </h3>
                <p className="text-xs text-emerald-700">
                  ประมวลผลทั้งหมด {result.totalProcessed} รายการ • สำเร็จ {result.successCount} รายการ
                </p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-700 space-y-1">
                <span className="font-bold block">รายการที่พบข้อผิดพลาด:</span>
                {result.errors.map((err: any, idx: number) => (
                  <div key={idx} className="text-[11px]">
                    แถวที่ {err.row}: {err.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Data Table */}
        {previewRows.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                ตัวอย่างข้อมูลที่จะนำเข้า (10 แถวแรก)
              </h3>
              <span className="text-xs text-slate-500">
                พบข้อมูลทั้งหมด {previewRows.length} แถว
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">ชื่อหน่วยงาน</th>
                    <th className="py-2.5 px-3">ระดับ</th>
                    <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
                    <th className="py-2.5 px-3">ตำแหน่ง</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3">เบอร์โทร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {row['ชื่อหน่วยงาน/สังกัด'] || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {row['ระดับการบริหาร (CENTRAL/PROVINCIAL/DISTRICT/LOCAL)'] || '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {row['คำนำหน้านาม'] || ''} {row['ชื่อ'] || ''} {row['นามสกุล'] || ''}
                      </td>
                      <td className="py-2 px-3 text-blue-900 font-medium">
                        {row['ตำแหน่ง'] || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {row['สถานะ (ACTIVE/ACTING/VACANT/RETIRED)'] || 'ACTIVE'}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {row['เบอร์โทรศัพท์'] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
