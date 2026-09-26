"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";

const mockHistory = [
  { id: "1", date: "2023-10-24 14:30", ref: "RCP-2023-001", product: "Wireless Buds", operation: "Receipt", qty: "+500", source: "Vendor", dest: "Main Warehouse", user: "Admin", status: "Done" },
  { id: "2", date: "2023-10-24 15:45", ref: "DEL-2023-001", product: "Industrial Motor", operation: "Delivery", qty: "-12", source: "Main Warehouse", dest: "Customer", user: "Admin", status: "Done" },
  { id: "3", date: "2023-10-25 09:15", ref: "INT-2023-001", product: "Packaging Box", operation: "Internal Transfer", qty: "-500", source: "Main Warehouse", dest: "Distribution Center", user: "Admin", status: "Done" },
  { id: "4", date: "2023-10-25 11:20", ref: "ADJ-2023-001", product: "Lithium Battery", operation: "Inventory Adjustment", qty: "-5", source: "Main Warehouse", dest: "Inventory Loss", user: "Admin", status: "Done" },
];

export default function MoveHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Move History</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Audit ledger of all inventory operations</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search operation, reference, or product..." 
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Date</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Reference</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Operation</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Qty</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Source</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Destination</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">User</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Status</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockHistory.map((item) => (
                <tr key={item.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                  <td className="h-[40px] px-[16px] text-[#6B7280] whitespace-nowrap">{item.date}</td>
                  <td className="h-[40px] px-[16px] font-medium hover:text-[#1677D2] transition-colors">{item.ref}</td>
                  <td className="h-[40px] px-[16px]">{item.product}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.operation}</td>
                  <td className={`h-[40px] px-[16px] text-right font-medium ${item.qty.startsWith('+') ? 'text-[#059669]' : 'text-[#E5484D]'}`}>{item.qty}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.source}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.dest}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{item.user}</td>
                  <td className="h-[40px] px-[16px]">
                    <span className="inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#F1F2F4] bg-[#FFFFFF]">
          <div className="text-[10px] text-[#6B7280]">
            Showing <span className="font-medium text-[#1F2937]">1</span> to <span className="font-medium text-[#1F2937]">4</span> of <span className="font-medium text-[#1F2937]">4</span> results
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
