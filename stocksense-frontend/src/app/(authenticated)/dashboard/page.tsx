"use client";

import { ArrowUpRight, ArrowDownRight, ChevronDown, Package, Activity, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const revenueData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
  { name: "Aug", value: 4500 },
  { name: "Sep", value: 6000 },
  { name: "Oct", value: 5000 },
  { name: "Nov", value: 5500 },
  { name: "Dec", value: 6500 },
];

const stockStatusData = [
  { name: "Normal", value: 3120, color: "#8FB4F0" },
  { name: "Warning", value: 720, color: "#2F5FDB" },
  { name: "Critical", value: 288, color: "#173B7A" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-[16px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Dashboard</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Realtime Inventory & Operations Overview</p>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="text-[10px] md:text-[11px] text-[#6B7280]">Last Updated: Just now</span>
          <button className="h-[30px] px-[10px] text-[10px] md:text-[11px] font-medium text-[#374151] border border-[#E5E7EB] bg-[#FFFFFF] rounded-[6px] hover:bg-[#F9FAFB] transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Action Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[16px]">
        {/* Receipt Widget */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#D9E6FB] p-2 rounded-lg">
                <Package className="h-5 w-5 text-[#2F5FDB]" />
              </div>
              <h2 className="text-[14px] font-semibold text-[#1F2937]">Receipts</h2>
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280]">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="text-[24px] font-semibold text-[#111827] leading-[1.1] mb-[8px]">12 <span className="text-[14px] font-normal text-[#6B7280]">to receive</span></div>
            <div className="flex items-center gap-4 text-[12px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
                <span className="text-[#6B7280]">2 Late</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-[#6B7280]">10 Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Widget */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#FEE2E2] p-2 rounded-lg">
                <Activity className="h-5 w-5 text-[#E5484D]" />
              </div>
              <h2 className="text-[14px] font-semibold text-[#1F2937]">Deliveries</h2>
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280]">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="text-[24px] font-semibold text-[#111827] leading-[1.1] mb-[8px]">8 <span className="text-[14px] font-normal text-[#6B7280]">to deliver</span></div>
            <div className="flex items-center gap-4 text-[12px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
                <span className="text-[#6B7280]">1 Late</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F5A623]"></span>
                <span className="text-[#6B7280]">3 Waiting</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-[#6B7280]">4 Operations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[16px]">
        {/* KPI 1: Total Inventory Value */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[110px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] md:text-[12px] font-medium text-[#6B7280]">Total Inventory Value</h2>
            <button className="text-[#9CA3AF] hover:text-[#6B7280]">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="text-[24px] font-semibold text-[#111827] leading-[1.1] mb-[4px]">$18.5m</div>
            <div className="flex items-center text-[9px] md:text-[10px]">
              <ArrowUpRight className="h-[12px] w-[12px] text-[#1677D2] mr-[2px]" strokeWidth={2} />
              <span className="text-[#1677D2] font-medium">+12.4%</span>
              <span className="text-[#9CA3AF] ml-[4px]">vs last week</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Inventory Volume */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[110px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] md:text-[12px] font-medium text-[#6B7280]">Inventory Volume</h2>
            <button className="text-[#9CA3AF] hover:text-[#6B7280]">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="text-[24px] font-semibold text-[#111827] leading-[1.1] mb-[4px]">12,869</div>
            <div className="flex items-center text-[9px] md:text-[10px]">
              <ArrowUpRight className="h-[12px] w-[12px] text-[#1677D2] mr-[2px]" strokeWidth={2} />
              <span className="text-[#1677D2] font-medium">+8.1%</span>
              <span className="text-[#9CA3AF] ml-[4px]">vs last week</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active SKUs */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[110px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] md:text-[12px] font-medium text-[#6B7280]">Active SKUs</h2>
            <button className="text-[#9CA3AF] hover:text-[#6B7280]">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="text-[24px] font-semibold text-[#111827] leading-[1.1] mb-[4px]">4,128</div>
            <div className="flex items-center text-[9px] md:text-[10px]">
              <ArrowUpRight className="h-[12px] w-[12px] text-[#1677D2] mr-[2px]" strokeWidth={2} />
              <span className="text-[#1677D2] font-medium">+5.2%</span>
              <span className="text-[#9CA3AF] ml-[4px]">vs last week</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Warehouse Capacity */}
        <div className="bg-gradient-to-r from-[#173B7A] to-[#2F5FDB] border border-[#173B7A] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[110px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] md:text-[12px] font-medium text-white/90">Warehouse Capacity</h2>
            <button className="text-white/70 hover:text-white">
              <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="flex items-end justify-between mb-[8px]">
              <div className="text-[24px] font-semibold text-white leading-[1.1]">70%</div>
              <div className="text-[9px] md:text-[10px] text-white/80">
                14,967 / 20,000 Slots
              </div>
            </div>
            <div className="w-full bg-white/20 h-[5px] rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Analytics (2fr 1fr ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px] mb-[12px]">
        
        {/* Revenue Trend - Col Span 2 */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[280px] flex flex-col">
          <div className="flex items-center justify-between h-[30px] mb-[16px]">
            <h2 className="text-[11px] md:text-[12px] font-semibold text-[#1F2937]">Revenue Trend</h2>
            <div className="flex items-center gap-[8px]">
              <button className="flex items-center h-[30px] px-[9px] text-[10px] md:text-[11px] text-[#374151] border border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB] transition-colors">
                Value <ChevronDown className="ml-[4px] h-[12px] w-[12px]" />
              </button>
              <button className="flex items-center h-[30px] px-[9px] text-[10px] md:text-[11px] text-[#374151] border border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB] transition-colors">
                This Year <ChevronDown className="ml-[4px] h-[12px] w-[12px]" />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F1F3" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '11px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 8 ? '#2F5FDB' : '#D9E6FB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="w-full mt-[12px] h-[32px] bg-[#D9E6FB] text-[#2F5FDB] hover:bg-[#C2D6F9] rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1">
            ✨ AI Analyze
          </button>
        </div>

        {/* Stock Status Overview - Col Span 1 */}
        <div className="lg:col-span-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[280px] flex flex-col">
          <div className="h-[30px] mb-[8px]">
            <h2 className="text-[11px] md:text-[12px] font-semibold text-[#1F2937]">Stock Status Overview</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Donut Chart (Max 160px diameter) */}
            <div className="relative w-[160px] h-[160px] mb-[16px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] md:text-[22px] font-semibold text-[#1F2937] leading-[1.1]">4,128</span>
                <span className="text-[9px] md:text-[10px] text-[#6B7280] mt-[2px]">Total SKUs</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="w-full flex justify-center gap-[16px]">
              {stockStatusData.map((item) => (
                <div key={item.name} className="flex flex-col items-start text-[10px] md:text-[11px]">
                  <div className="flex items-center gap-[6px] text-[#6B7280] mb-[2px]">
                    <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <div className="font-medium text-[#1F2937] pl-[14px]">
                    {item.value.toLocaleString()} <span className="font-normal text-[#9CA3AF]">SKUs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-[12px] h-[32px] bg-[#D9E6FB] text-[#2F5FDB] hover:bg-[#C2D6F9] rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1">
            ✨ AI Analyze
          </button>
        </div>

      </div>

      {/* Row 3: Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        
        {/* Top Inventory Items */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[240px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-[12px] h-[24px]">
            <h2 className="text-[11px] md:text-[12px] font-semibold text-[#1F2937]">Top Inventory Items</h2>
            <button className="text-[10px] md:text-[11px] font-medium text-[#1677D2] hover:text-[#0B6FCB]">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-[8px] px-[8px] text-[9px] md:text-[10px] font-medium text-[#9CA3AF] border-b border-[#F1F2F4]">Item</th>
                  <th className="pb-[8px] px-[8px] text-[9px] md:text-[10px] font-medium text-[#9CA3AF] border-b border-[#F1F2F4]">Category</th>
                  <th className="pb-[8px] px-[8px] text-[9px] md:text-[10px] font-medium text-[#9CA3AF] border-b border-[#F1F2F4] text-right">On Hand</th>
                </tr>
              </thead>
              <tbody className="text-[10px] md:text-[11px] text-[#1F2937]">
                <tr className="border-b border-[#F1F2F4] hover:bg-[#F8FAFC]">
                  <td className="h-[32px] md:h-[36px] px-[8px] font-medium">Wireless Bud Pro</td>
                  <td className="h-[32px] md:h-[36px] px-[8px]"><span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[9px] font-medium bg-[#D9E6FB] text-[#2F5FDB]">Electronics</span></td>
                  <td className="h-[32px] md:h-[36px] px-[8px] text-right font-medium">1240 Pcs</td>
                </tr>
                <tr className="border-b border-[#F1F2F4] hover:bg-[#F8FAFC]">
                  <td className="h-[32px] md:h-[36px] px-[8px] font-medium">Industrial Motor</td>
                  <td className="h-[32px] md:h-[36px] px-[8px]"><span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[9px] font-medium bg-[#F3F4F6] text-[#4B5563]">Machinery</span></td>
                  <td className="h-[32px] md:h-[36px] px-[8px] text-right font-medium">680 Pcs</td>
                </tr>
                <tr className="border-b border-[#F1F2F4] hover:bg-[#F8FAFC]">
                  <td className="h-[32px] md:h-[36px] px-[8px] font-medium">Packaging Box</td>
                  <td className="h-[32px] md:h-[36px] px-[8px]"><span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[9px] font-medium bg-[#F3F4F6] text-[#4B5563]">Packaging</span></td>
                  <td className="h-[32px] md:h-[36px] px-[8px] text-right font-medium">4500 Pcs</td>
                </tr>
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="h-[32px] md:h-[36px] px-[8px] font-medium">Lithium Battery</td>
                  <td className="h-[32px] md:h-[36px] px-[8px]"><span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[9px] font-medium bg-[#D9E6FB] text-[#2F5FDB]">Electronics</span></td>
                  <td className="h-[32px] md:h-[36px] px-[8px] text-right font-medium">850 Pcs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Movement */}
        <div className="lg:col-span-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-[240px] flex flex-col justify-between">
          <h2 className="text-[11px] md:text-[12px] font-semibold text-[#1F2937] h-[24px]">Inventory Movement</h2>
          
          <div className="flex-1 flex flex-col justify-center gap-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="h-[32px] w-[32px] rounded-full bg-[#D9E6FB] flex items-center justify-center shrink-0">
                <ArrowDownRight className="h-[14px] w-[14px] text-[#2F5FDB]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#6B7280] mb-[2px]">Inbound</div>
                <div className="flex items-end justify-between">
                  <div className="text-[18px] font-semibold text-[#1F2937] leading-[1.1] flex items-center gap-1">
                    <span className="text-[#16A34A] text-[14px]">⬇</span> 1,600
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-medium">Units Received</div>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#F1F2F4] w-full" />

            <div className="flex items-center gap-[12px]">
              <div className="h-[32px] w-[32px] rounded-full bg-[#173B7A] flex items-center justify-center shrink-0">
                 <ArrowUpRight className="h-[14px] w-[14px] text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#6B7280] mb-[2px]">Outbound</div>
                <div className="flex items-end justify-between">
                  <div className="text-[18px] font-semibold text-[#1F2937] leading-[1.1] flex items-center gap-1">
                    <span className="text-[#E5484D] text-[14px]">⬆</span> 1,595
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-medium">Units Shipped</div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-[6px] h-[30px] mt-[12px] text-[10px] md:text-[11px] border border-[#E5E7EB] text-[#374151] font-medium rounded-[6px] hover:bg-[#F9FAFB] transition-colors">
            <Activity className="h-[12px] w-[12px] text-[#1677D2]" strokeWidth={2} />
            AI Analyze Movement
          </button>
        </div>
        
      </div>
    </div>
  );
}
