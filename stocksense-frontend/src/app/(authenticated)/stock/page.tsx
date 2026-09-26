"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";

const mockStock = [
  { id: "1", product: "Wireless Buds", sku: "EL-WB-001", warehouse: "Main Warehouse", location: "A1-R2-S3", onHand: 1240, available: 1200, uom: "Units" },
  { id: "2", product: "Industrial Motor", sku: "MA-IM-055", warehouse: "Main Warehouse", location: "C4-R1-S1", onHand: 680, available: 680, uom: "Units" },
  { id: "3", product: "Packaging Box", sku: "PK-BX-100", warehouse: "Distribution Center", location: "Bulk-Zone-1", onHand: 4500, available: 4000, uom: "Units" },
  { id: "4", product: "Lithium Battery", sku: "EL-BT-099", warehouse: "Main Warehouse", location: "B2-R5-S2", onHand: 850, available: 850, uom: "Units" },
  { id: "5", product: "Steel Rod 2m", sku: "RM-SR-200", warehouse: "Raw Materials", location: "Yard-A", onHand: 320, available: 320, uom: "kg" },
];

export default function StockOverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Stock Overview</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Real-time view of inventory across all locations</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search stock by product or SKU..." 
            className="w-full h-[32px] pl-[32px] pr-[12px] text-[11px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] focus:ring-1 focus:ring-[#1677D2] placeholder:text-[#9CA3AF] text-[#1F2937]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-[8px] w-full md:w-auto">
          <Button variant="outline" className="h-[32px] px-[12px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
            <Filter className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Filter
          </Button>
          <Button variant="outline" className="h-[32px] px-[12px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
            <FileText className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">SKU</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Warehouse</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Location</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">On Hand</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Available</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">UoM</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockStock.map((item) => (
                <tr key={item.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{item.product}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280] font-mono text-[10px]">{item.sku}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.warehouse}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.location}</td>
                  <td className="h-[40px] px-[16px] text-right font-medium">{item.onHand.toLocaleString()}</td>
                  <td className="h-[40px] px-[16px] text-right font-medium text-[#059669]">{item.available.toLocaleString()}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#F1F2F4] bg-[#FFFFFF]">
          <div className="text-[10px] text-[#6B7280]">
            Showing <span className="font-medium text-[#1F2937]">1</span> to <span className="font-medium text-[#1F2937]">5</span> of <span className="font-medium text-[#1F2937]">5</span> results
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
