"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const mockRules = [
  { id: "RR-001", product: "Wireless Buds", location: "WH/Stock", min: 50, max: 200, multiple: 10, leadTime: 5 },
  { id: "RR-002", product: "Industrial Motor", location: "WH/Stock", min: 5, max: 20, multiple: 1, leadTime: 14 },
  { id: "RR-003", product: "Packaging Box", location: "WH/Stock", min: 1000, max: 5000, multiple: 500, leadTime: 2 },
];

export default function ReorderingRulesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Reordering Rules</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Define minimum stock rules to trigger automatic procurement</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search rules..." 
            className="w-full h-[32px] pl-[32px] pr-[12px] text-[11px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] focus:ring-1 focus:ring-[#1677D2] placeholder:text-[#9CA3AF] text-[#1F2937]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Location</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Min Qty</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Max Qty</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Multiple Qty</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Lead Time (Days)</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockRules.map((rule) => (
                <tr key={rule.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{rule.product}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{rule.location}</td>
                  <td className="h-[40px] px-[16px] text-right font-medium">{rule.min}</td>
                  <td className="h-[40px] px-[16px] text-right text-[#6B7280]">{rule.max}</td>
                  <td className="h-[40px] px-[16px] text-right text-[#6B7280]">{rule.multiple}</td>
                  <td className="h-[40px] px-[16px] text-right text-[#6B7280]">{rule.leadTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#F1F2F4] bg-[#FFFFFF]">
          <div className="text-[10px] text-[#6B7280]">
            Showing <span className="font-medium text-[#1F2937]">1</span> to <span className="font-medium text-[#1F2937]">3</span> of <span className="font-medium text-[#1F2937]">3</span> results
          </div>
          <div className="flex items-center gap-[4px]">
            <Button variant="outline" size="icon" className="h-[28px] w-[28px] border-[#E5E7EB] rounded-[6px]" disabled>
              <ChevronLeft className="h-[12px] w-[12px]" />
            </Button>
            <Button variant="outline" size="icon" className="h-[28px] w-[28px] border-[#E5E7EB] rounded-[6px]" disabled>
              <ChevronRight className="h-[12px] w-[12px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
