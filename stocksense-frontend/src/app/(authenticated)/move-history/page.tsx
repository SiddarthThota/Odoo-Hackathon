"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileText, ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";

const mockHistory = [
  { id: "1", date: "2026-09-01 10:00", ref: "WH/IN/001", product: "Paracetamol 500mg", operation: "Receipt", qty: "+100", source: "Medico Distributors", dest: "Hyderabad Pharmacy", user: "admin", status: "Done" },
  { id: "2", date: "2026-09-04 14:30", ref: "WH/OUT/001", product: "Paracetamol 500mg", operation: "Delivery", qty: "-30", source: "Hyderabad Pharmacy", dest: "ABC Clinic", user: "staff", status: "Done" },
  { id: "3", date: "2026-09-10 09:15", ref: "WH/TRANS/001", product: "Paracetamol 500mg", operation: "Internal Transfer", qty: "-20", source: "Hyderabad Pharmacy", dest: "Secunderabad Pharmacy", user: "manager", status: "Done" },
  { id: "4", date: "2026-09-11 11:20", ref: "WH/ADJ/001", product: "Paracetamol 500mg", operation: "Inventory Adjustment", qty: "-5", source: "Hyderabad Pharmacy", dest: "Inventory Loss", user: "manager", status: "Done" },
  { id: "5", date: "2026-09-23 16:45", ref: "WH/ADJ/007", product: "Ibuprofen 400mg", operation: "Inventory Adjustment", qty: "-5", source: "Secunderabad Pharmacy", dest: "Inventory Loss", user: "staff", status: "Cancelled" },
];

export default function MoveHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Done': return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Cancelled': return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

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
          <div className="flex bg-[#F3F4F6] p-[2px] rounded-[6px] mr-2">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-[4px] rounded-[4px] transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-[#1677D2]" : "text-[#6B7280] hover:text-[#374151]"}`}
            >
              <List className="h-[14px] w-[14px]" />
            </button>
            <button 
              onClick={() => setViewMode("kanban")}
              className={`p-[4px] rounded-[4px] transition-colors ${viewMode === "kanban" ? "bg-white shadow-sm text-[#1677D2]" : "text-[#6B7280] hover:text-[#374151]"}`}
            >
              <LayoutGrid className="h-[14px] w-[14px]" />
            </button>
          </div>
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

      {/* Content */}
      {viewMode === "list" ? (
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
                      <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border ${getStatusColor(item.status)}`}>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mt-[16px]">
          {mockHistory.map(item => (
            <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-[8px] p-[12px] shadow-sm hover:shadow-md cursor-pointer transition-shadow">
              <div className="flex items-center justify-between mb-[8px]">
                <span className="text-[11px] font-medium text-[#1F2937]">{item.ref}</span>
                <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#1F2937] mb-[4px]">{item.product}</div>
              <div className="text-[11px] text-[#6B7280] mb-[4px]">{item.source} ➔ {item.dest}</div>
              <div className="flex items-center justify-between mt-[8px]">
                <span className="text-[10px] text-[#9CA3AF]">{item.date}</span>
                <span className={`text-[11px] font-medium ${item.qty.startsWith('+') ? 'text-[#059669]' : 'text-[#E5484D]'}`}>{item.qty}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
