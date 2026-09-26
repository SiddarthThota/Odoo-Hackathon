"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const mockWarehouses = [
  { id: "WH-01", name: "Main Warehouse", shortCode: "MAIN", address: "123 Logistics Way, CA", status: "Active" },
  { id: "WH-02", name: "Distribution Center", shortCode: "DC-1", address: "456 Shipping Blvd, NY", status: "Active" },
  { id: "WH-03", name: "Raw Materials", shortCode: "RAW", address: "789 Factory Rd, TX", status: "Active" },
];

export default function WarehousesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Warehouses</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Manage your storage facilities</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search warehouses..." 
            className="w-full h-[32px] pl-[32px] pr-[12px] text-[11px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] focus:ring-1 focus:ring-[#1677D2] placeholder:text-[#9CA3AF] text-[#1F2937]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Warehouse Name</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Short Code</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Address</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Status</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockWarehouses.map((wh) => (
                <tr key={wh.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{wh.name}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280] font-mono text-[10px]">{wh.shortCode}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{wh.address}</td>
                  <td className="h-[40px] px-[16px]">
                    <span className="inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
                      {wh.status}
                    </span>
                  </td>
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
