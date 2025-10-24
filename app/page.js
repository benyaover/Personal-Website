'use client';

import { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TOWER_DATA = [
  {company: "Portable Breast Pump", code: "UC184", market: "WOMEN'S HEALTH", status: "D", multiple: 2.89, hold: 3.30, amount: 10000000, year: 4},
  {company: "Prevent Postpartum Hemorrhage", code: "UC187", market: "WOMEN'S HEALTH", status: "C", multiple: 7.32, hold: 8.47, amount: 10000000, year: 13},
  {company: "3D Breast CT Scanner", code: "UC261", market: "WOMEN'S HEALTH", status: "C", multiple: 3.87, hold: 7.33, amount: 10000000, year: 1},
  {company: "Automated IVF Processes", code: "UC249", market: "WOMEN'S HEALTH", status: "A", multiple: 19.92, hold: 6.32, amount: 5000000, year: 2},
  {company: "Social Care Management", code: "UC216", market: "FAMILY HEALTH", status: "A", multiple: 94.95, hold: 5.54, amount: 5000000, year: 2},
  {company: "Education for Neurodivergent Children", code: "UC194", market: "FAMILY HEALTH", status: "A", multiple: 20.82, hold: 5.22, amount: 5000000, year: 2},
  {company: "Breast Milk Proteins", code: "UC230", market: "FAMILY HEALTH", status: "B", multiple: 2.53, hold: 1.33, amount: 7500000, year: 4},
  {company: "Tested & Safer Brain Implants", code: "UC283", market: "BRAIN HEALTH", status: "C", multiple: 3.25, hold: 8.29, amount: 10000000, year: 1},
  {company: "Neurological Decline Detection", code: "UC288", market: "BRAIN HEALTH", status: "B", multiple: 3.55, hold: 3.50, amount: 7500000, year: 3},
  {company: "Pediatric Diagnosis for ASD", code: "UC284", market: "BRAIN HEALTH", status: "A", multiple: 10.63, hold: 4.00, amount: 10000000, year: 3}
];

const MARKET_COLORS = {
  "WOMEN'S HEALTH": '#A855F7',
  "FAMILY HEALTH": '#3B82F6',
  "BRAIN HEALTH": '#10B981'
};

export default function PortfolioTool() {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [showCharts, setShowCharts] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  function createEmptyRow() {
    return {
      id: Date.now() + Math.random(),
      company: '',
      code: '',
      market: '',
      status: '',
      multiple: '',
      hold: '',
      amount: '',
      year: ''
    };
  }

  function addRow() {
    setRows([...rows, createEmptyRow()]);
  }

  function updateRow(id, field, value) {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  }

  function deleteRow(id) {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  }

  function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
      setRows([createEmptyRow()]);
      setShowCharts(false);
    }
  }

  function generateCharts() {
    const validRows = rows.filter(r => r.company && r.year && r.hold);
    if (validRows.length === 0) {
      alert('Please add at least one complete investment!');
      return;
    }
    setShowCharts(true);
    setTimeout(() => {
      document.getElementById('charts')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function loadTowerData() {
    const newRows = TOWER_DATA.map(inv => ({
      id: Date.now() + Math.random(),
      company: inv.company,
      code: inv.code,
      market: inv.market,
      status: inv.status,
      multiple: inv.multiple.toString(),
      hold: inv.hold.toString(),
      amount: inv.amount.toString(),
      year: inv.year.toString()
    }));
    setRows(newRows);
    setShowCharts(true);
    setTimeout(() => {
      document.getElementById('charts')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function checkPassword() {
    if (password === 'tower2024') {
      setShowPasswordModal(false);
      setPassword('');
      loadTowerData();
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  }

  // Generate timeline chart data
  function getTimelineData() {
    const validRows = rows.filter(r => r.company && r.year && r.hold);
    const maxYear = Math.ceil(Math.max(...validRows.map(r => parseFloat(r.year) + parseFloat(r.hold)))) + 2;
    
    // For each company, create two datasets: one invisible (offset) and one visible (duration)
    const datasets = [];
    
    validRows.forEach(row => {
      const startYear = parseFloat(row.year);
      const duration = parseFloat(row.hold);
      
      // Offset dataset (transparent - represents the gap before investment starts)
      datasets.push({
        label: `${row.company} offset`,
        data: validRows.map(r => r.company === row.company ? startYear : 0),
        backgroundColor: 'transparent',
        borderWidth: 0,
        barThickness: 30,
        borderRadius: 0,
        borderSkipped: false
      });
      
      // Actual investment duration dataset (visible)
      datasets.push({
        label: row.company,
        data: validRows.map(r => r.company === row.company ? duration : 0),
        backgroundColor: MARKET_COLORS[row.market] || '#999',
        borderWidth: 0,
        barThickness: 30,
        borderRadius: 8,
        borderSkipped: false
      });
    });
    
    return {
      labels: validRows.map(r => r.company),
      datasets: datasets
    };
  }

  // Generate cashflow chart data
  function getCashflowData() {
    const validRows = rows.filter(r => r.company && r.year && r.hold && r.amount && r.multiple);
    const maxYear = Math.ceil(Math.max(...validRows.map(r => parseFloat(r.year) + parseFloat(r.hold)))) + 2;
    
    const cashflowData = [];
    for (let year = 0; year <= maxYear; year++) {
      let cumulative = year === 0 ? 0 : cashflowData[year - 1];
      
      validRows.forEach(row => {
        const investYear = parseFloat(row.year);
        const exitYear = investYear + parseFloat(row.hold);
        const amount = parseFloat(row.amount);
        const multiple = parseFloat(row.multiple);
        
        if (Math.abs(year - investYear) < 0.5) {
          cumulative -= amount;
        }
        if (Math.abs(year - exitYear) < 0.5) {
          cumulative += amount * multiple;
        }
      });
      
      cashflowData.push(cumulative);
    }
    
    return {
      labels: Array.from({ length: maxYear + 1 }, (_, i) => `Year ${i}`),
      datasets: [{
        label: 'Cumulative Portfolio Value',
        data: cashflowData,
        borderColor: (context) => {
          const value = context.parsed?.y;
          return value < 0 ? '#ef4444' : '#10b981';
        },
        backgroundColor: (context) => {
          const value = context.parsed?.y;
          return value < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        },
        segment: {
          borderColor: (ctx) => {
            const curr = ctx.p1.parsed.y;
            const prev = ctx.p0.parsed.y;
            return curr < 0 || prev < 0 ? '#ef4444' : '#10b981';
          }
        },
        fill: true,
        tension: 0.4
      }]
    };
  }

  return (
    <div className="min-h-screen bg-black p-8 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 relative z-10 border border-gray-100">
        <h1 className="text-4xl font-bold text-black mb-2">
          Portfolio Analysis Tool
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Enter your investment data to generate comprehensive portfolio visualizations
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={addRow}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + Add Investment
          </button>
          <button
            onClick={generateCharts}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Generate Charts
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            🔒 Tower Portfolio
          </button>
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Clear All
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mb-12 border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left font-semibold text-black text-sm w-12"></th>
                <th className="p-4 text-left font-semibold text-black text-sm">Company Name</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Deal Code</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Market</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Status</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Target Multiple</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Target Hold (yrs)</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Investment ($)</th>
                <th className="p-4 text-left font-semibold text-black text-sm">Year</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition group">
                  <td className="p-4">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded"
                      title="Delete row"
                    >
                      <span className="text-gray-600 text-lg">×</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      value={row.company}
                      onChange={(e) => updateRow(row.id, 'company', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="Company Name"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      value={row.code}
                      onChange={(e) => updateRow(row.id, 'code', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="UC###"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      value={row.market}
                      onChange={(e) => updateRow(row.id, 'market', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black"
                    >
                      <option value="">Select...</option>
                      <option value="WOMEN'S HEALTH">WOMEN'S HEALTH</option>
                      <option value="FAMILY HEALTH">FAMILY HEALTH</option>
                      <option value="BRAIN HEALTH">BRAIN HEALTH</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black"
                    >
                      <option value="">Select...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.01"
                      value={row.multiple}
                      onChange={(e) => updateRow(row.id, 'multiple', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="2.5"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.1"
                      value={row.hold}
                      onChange={(e) => updateRow(row.id, 'hold', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="5.0"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      step="1000"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="5000000"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={row.year}
                      onChange={(e) => updateRow(row.id, 'year', e.target.value)}
                      className="w-full p-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition text-sm text-black placeholder-gray-400"
                      placeholder="1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div id="charts" className="space-y-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-6">Investment Timeline</h2>
              <Bar
                data={getTimelineData()}
                                  options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const row = rows.filter(r => r.company && r.year && r.hold)[context.dataIndex];
                          const startYear = parseFloat(row.year);
                          const endYear = startYear + parseFloat(row.hold);
                          return `Year ${startYear} - ${endYear.toFixed(1)} (${parseFloat(row.hold).toFixed(1)} years)`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      stacked: true,
                      title: { display: true, text: 'Years', color: '#000', font: { weight: 'bold' } },
                      grid: { color: '#e5e7eb' },
                      min: 0,
                      max: Math.max(...rows.filter(r => r.year && r.hold).map(r => parseFloat(r.year) + parseFloat(r.hold))) + 2
                    },
                    y: {
                      stacked: true,
                      grid: { display: false },
                      ticks: {
                        color: '#000',
                        font: { size: 13 }
                      }
                    }
                  },
                  datasets: {
                    bar: {
                      barThickness: 30,
                      borderRadius: 8,
                      borderSkipped: false
                    }
                  }
                }}
              />
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-6">Portfolio Cashflow Analysis</h2>
              <Line
                data={getCashflowData()}
                options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Value: ${(context.parsed.y / 1000000).toFixed(2)}M`
                      }
                    },
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      title: { display: true, text: 'Capital ($)', color: '#000', font: { weight: 'bold' } },
                      ticks: {
                        callback: (value) => `${(value / 1000000).toFixed(0)}M`
                      },
                      grid: { color: '#e5e7eb' }
                    },
                    x: {
                      grid: { color: '#e5e7eb' }
                    }
                  },
                  elements: {
                    line: {
                      borderWidth: 3
                    },
                    point: {
                      radius: 4,
                      hoverRadius: 6
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-black">Enter Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              placeholder="Password"
            />
            <div className="flex gap-3">
              <button
                onClick={checkPassword}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}