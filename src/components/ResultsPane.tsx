'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { Download, Filter, BarChart3, ChevronDown, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Document, Packer, Table as DocxTable, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } from 'docx';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#5b21b6', '#ddd6fe', '#ede9fe'];

type ResultsPaneProps = {
  data: any[];
  metadata: {
    description?: string;
    graph_type?: string;
    filters?: string[];
  } | null;
};

export default function ResultsPane({ data, metadata }: ResultsPaneProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [exportOpen, setExportOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Extract unique values for filters from data
  const departments = useMemo(() => {
    if (!data || data.length === 0) return [];
    const key = Object.keys(data[0]).find(k => k.toLowerCase().includes('department') || k.toLowerCase().includes('dept'));
    if (!key) return [];
    const vals = [...new Set(data.map(r => r[key]).filter(Boolean))] as string[];
    return vals.sort();
  }, [data]);

  const years = useMemo(() => {
    if (!data || data.length === 0) return [];
    const key = Object.keys(data[0]).find(k => k.toLowerCase() === 'year');
    if (!key) return [];
    const vals = [...new Set(data.map(r => r[key]).filter(Boolean))] as string[];
    return vals.sort();
  }, [data]);

  const statuses = useMemo(() => {
    if (!data || data.length === 0) return [];
    const key = Object.keys(data[0]).find(k => k.toLowerCase() === 'status');
    if (!key) return [];
    const vals = [...new Set(data.map(r => r[key]).filter(Boolean))] as string[];
    return vals.sort();
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    if (selectedDept !== 'All') {
      const key = Object.keys(data[0]).find(k => k.toLowerCase().includes('department') || k.toLowerCase().includes('dept'));
      if (key) result = result.filter(r => r[key] === selectedDept);
    }
    if (selectedYear !== 'All') {
      const key = Object.keys(data[0]).find(k => k.toLowerCase() === 'year');
      if (key) result = result.filter(r => String(r[key]) === selectedYear);
    }
    if (selectedStatus !== 'All') {
      const key = Object.keys(data[0]).find(k => k.toLowerCase() === 'status');
      if (key) result = result.filter(r => r[key] === selectedStatus);
    }

    return result;
  }, [data, selectedDept, selectedYear, selectedStatus]);

  // Chart helpers
  const chartKeys = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { nameKey: '', valueKey: '' };
    const keys = Object.keys(filteredData[0]);
    const nameKey = keys.find(k => typeof filteredData[0][k] === 'string') || keys[0];
    const valueKey = keys.find(k => typeof filteredData[0][k] === 'number') || keys[1];
    return { nameKey, valueKey };
  }, [filteredData]);

  // Export handlers
  const exportPDF = useCallback(async () => {
    if (!resultsRef.current) return;
    setExportOpen(false);
    const canvas = await html2canvas(resultsRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('skillrag_results.pdf');
  }, []);

  const exportExcel = useCallback(async () => {
    if (!filteredData || filteredData.length === 0) return;
    setExportOpen(false);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Results');
    const headers = Object.keys(filteredData[0]);

    sheet.addRow(headers.map(h => h.replace(/_/g, ' ').toUpperCase()));
    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };

    filteredData.forEach(row => {
      sheet.addRow(headers.map(h => row[h]));
    });

    // Auto-width columns
    headers.forEach((_, i) => {
      const col = sheet.getColumn(i + 1);
      col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'skillrag_results.xlsx');
  }, [filteredData]);

  const exportWord = useCallback(async () => {
    if (!filteredData || filteredData.length === 0) return;
    setExportOpen(false);
    const headers = Object.keys(filteredData[0]);

    const tableRows = [
      new TableRow({
        children: headers.map(h => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h.replace(/_/g, ' ').toUpperCase(), bold: true, size: 20 })] })],
          width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
        })),
      }),
      ...filteredData.map(row =>
        new TableRow({
          children: headers.map(h => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: String(row[h] ?? ''), size: 18 })] })],
            width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
          })),
        })
      )
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: metadata?.description || 'SkillRAG Results', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new DocxTable({ rows: tableRows }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'skillrag_results.docx');
  }, [filteredData, metadata]);

  const hasFilters = departments.length > 0 || years.length > 0 || statuses.length > 0;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mb-6">
          <BarChart3 className="text-purple-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SkillRAG Dashboard</h2>
        <p className="text-gray-500 max-w-md">
          Ask a question in the chat panel to see student statistics, charts, and filterable data here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar: description + filters + export */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">{metadata?.description || 'Results'}</h3>
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download size={14} /> Save <ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[140px]">
                <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                  Export as PDF
                </button>
                <button onClick={exportExcel} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                  Export as Excel
                </button>
                <button onClick={exportWord} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                  Export as Word
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {hasFilters && (
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={14} className="text-gray-400" />
            {departments.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            {years.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              >
                <option value="All">All Years</option>
                {years.map(y => <option key={y} value={String(y)}>Year {y}</option>)}
              </select>
            )}
            {statuses.length > 0 && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {(selectedDept !== 'All' || selectedYear !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => { setSelectedDept('All'); setSelectedYear('All'); setSelectedStatus('All'); }}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <X size={12} /> Clear
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{filteredData.length} rows</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={resultsRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {/* Chart */}
        {metadata?.graph_type && metadata.graph_type !== 'none' && chartKeys.nameKey && chartKeys.valueKey && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Visualization</h4>
            <div className="w-full" style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                {metadata.graph_type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={filteredData.slice(0, 10)}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8b5cf6"
                      dataKey={chartKeys.valueKey}
                      nameKey={chartKeys.nameKey}
                      label={({ name, percent }: { name?: string; percent?: number }) => (name || '') + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}
                    >
                      {filteredData.slice(0, 10).map((_, index) => (
                        <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={filteredData.slice(0, 20)} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey={chartKeys.nameKey}
                      stroke="#9ca3af"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey={chartKeys.valueKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {filteredData.length > 0 && Object.keys(filteredData[0]).map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-purple-50/50 transition-colors">
                    {Object.keys(row).map((header) => (
                      <td key={header} className="px-4 py-3 whitespace-nowrap text-xs text-gray-800">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">No data matches the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
