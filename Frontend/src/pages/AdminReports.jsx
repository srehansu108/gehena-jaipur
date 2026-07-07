// src/pages/admin/AdminReports.jsx
import { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingBagIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { getReports } from '../services/api';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reports, setReports] = useState({
    monthly: [],
    quarterly: [],
    yearly: [],
    product: [],
    user: []
  });

  // ✅ FETCH REPORTS
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getReports({
        type: reportType,
        month: selectedMonth + 1,
        year: selectedYear
      });
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Use mock data
      setReports(getMockReports());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, selectedMonth, selectedYear]);

  // ✅ REPORT CARD COMPONENT
  const ReportCard = ({ title, subtitle, icon: Icon, color, onDownload, onView }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Report"
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ REPORT STATS
  const ReportStats = ({ label, value, change }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {change !== undefined && (
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">
            Generate and download detailed business reports
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Generate Reports
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReportType('monthly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            reportType === 'monthly'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📅 Monthly
        </button>
        <button
          onClick={() => setReportType('quarterly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            reportType === 'quarterly'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📊 Quarterly
        </button>
        <button
          onClick={() => setReportType('yearly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            reportType === 'yearly'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 Yearly
        </button>
        <button
          onClick={() => setReportType('product')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            reportType === 'product'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏷️ Product
        </button>
        <button
          onClick={() => setReportType('user')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            reportType === 'user'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          👥 User
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex flex-wrap gap-4 bg-white rounded-xl shadow-sm p-4 border border-slate-200">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November', 'December']
              .map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Sales Report"
          subtitle="Monthly sales summary"
          icon={CurrencyDollarIcon}
          color="bg-green-600"
          onView={() => alert('View Sales Report')}
          onDownload={() => alert('Download Sales Report')}
        />
        <ReportCard
          title="Product Report"
          subtitle="Top selling products"
          icon={ShoppingBagIcon}
          color="bg-blue-600"
          onView={() => alert('View Product Report')}
          onDownload={() => alert('Download Product Report')}
        />
        <ReportCard
          title="User Report"
          subtitle="User acquisition trends"
          icon={UsersIcon}
          color="bg-purple-600"
          onView={() => alert('View User Report')}
          onDownload={() => alert('Download User Report')}
        />
        <ReportCard
          title="Analytics Report"
          subtitle="Full business summary"
          icon={ChartBarIcon}
          color="bg-pink-600"
          onView={() => alert('View Analytics Report')}
          onDownload={() => alert('Download Analytics Report')}
        />
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Preview
          </h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
              <PrinterIcon className="h-4 w-4" />
              Print
            </button>
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
              <EnvelopeIcon className="h-4 w-4" />
              Email
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-4">
          {/* Report Header */}
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </h3>
            <p className="text-slate-500 text-sm">
              {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} {selectedYear}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportStats label="Total Revenue" value="$45,230" change={12.5} />
            <ReportStats label="Total Orders" value="1,245" change={8.2} />
            <ReportStats label="New Users" value="342" change={15.3} />
            <ReportStats label="Avg Order Value" value="$36.33" change={3.8} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Orders</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Avg Order</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 7 }, (_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-sm text-slate-900">
                      {`${i + 1} ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'short' })}`}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-slate-900">${Math.floor(Math.random() * 5000) + 1000}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-600">{Math.floor(Math.random() * 50) + 10}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-600">${Math.floor(Math.random() * 100) + 20}</td>
                    <td className={`py-2 px-3 text-sm text-right ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.random() > 0.5 ? '+' : ''}{Math.floor(Math.random() * 20) - 5}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Options */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
              Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <TableCellsIcon className="h-5 w-5" />
              Download Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
              <DocumentDuplicateIcon className="h-5 w-5" />
              Duplicate
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-xl text-center transition-colors">
          <DocumentTextIcon className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
          <p className="font-medium text-slate-900">Generate New Report</p>
          <p className="text-sm text-slate-500">Create custom report</p>
        </button>
        <button className="bg-green-50 hover:bg-green-100 p-4 rounded-xl text-center transition-colors">
          <DocumentArrowDownIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
          <p className="font-medium text-slate-900">Export All Reports</p>
          <p className="text-sm text-slate-500">Download as ZIP</p>
        </button>
        <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl text-center transition-colors">
          <EnvelopeIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
          <p className="font-medium text-slate-900">Schedule Reports</p>
          <p className="text-sm text-slate-500">Auto-send via email</p>
        </button>
      </div>
    </div>
  );
}

// ============ MOCK DATA ============
function getMockReports() {
  return {
    monthly: [],
    quarterly: [],
    yearly: [],
    product: [],
    user: []
  };
}