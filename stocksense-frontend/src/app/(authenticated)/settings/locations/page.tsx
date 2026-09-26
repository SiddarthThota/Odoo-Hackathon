"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight, Layers } from "lucide-react";

const mockLocations = [
  { id: "LOC-001", name: "Stock", barcode: "WH/Stock", type: "Internal Location", warehouse: "Main Warehouse" },
  { id: "LOC-002", name: "Shelf 1", barcode: "WH/Stock/Shelf 1", type: "Internal Location", warehouse: "Main Warehouse" },
  { id: "LOC-003", name: "Shelf 2", barcode: "WH/Stock/Shelf 2", type: "Internal Location", warehouse: "Main Warehouse" },
  { id: "LOC-004", name: "Receiving", barcode: "WH/Input", type: "Internal Location", warehouse: "Main Warehouse" },
  { id: "LOC-005", name: "Shipping", barcode: "WH/Output", type: "Internal Location", warehouse: "Main Warehouse" },
  { id: "LOC-006", name: "Scrap", barcode: "Virtual/Scrap", type: "Inventory Loss", warehouse: "-" },
];

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Locations</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Manage specific locations and shelves within your warehouses</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Add Location
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search locations..." 
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
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Location Name</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Location Barcode (Path)</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Type</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Warehouse</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockLocations.map((loc) => (
                <tr key={loc.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors flex items-center gap-[8px]">
                    <Layers className="h-[14px] w-[14px] text-[#9CA3AF]" />
                    {loc.name}
                  </td>
                  <td className="h-[40px] px-[16px] text-[#6B7280] font-mono text-[10px]">{loc.barcode}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{loc.type}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{loc.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#F1F2F4] bg-[#FFFFFF]">
          <div className="text-[10px] text-[#6B7280]">
            Showing <span className="font-medium text-[#1F2937]">1</span> to <span className="font-medium text-[#1F2937]">6</span> of <span className="font-medium text-[#1F2937]">6</span> results
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
