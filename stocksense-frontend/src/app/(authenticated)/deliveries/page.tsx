"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, FileText, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";

const mockDeliveries = [
  { id: "WH/OUT/001", date: "2026-09-04", partner: "ABC Clinic", location: "Rack-A-01", status: "Done" },
  { id: "WH/OUT/002", date: "2026-09-06", partner: "CityCare Hospital", location: "Rack-A-02", status: "Done" },
  { id: "WH/OUT/003", date: "2026-09-08", partner: "GreenCross Clinic", location: "Rack-B-01", status: "Ready" },
  { id: "WH/OUT/004", date: "2026-09-12", partner: "Sunrise Medicals", location: "Rack-C-01", status: "Waiting" },
  { id: "WH/OUT/005", date: "2026-09-13", partner: "WellCare Hospital", location: "Rack-C-02", status: "Done" },
  { id: "WH/OUT/006", date: "2026-09-14", partner: "Prime Clinic", location: "Rack-B-02", status: "Cancelled" },
  { id: "WH/OUT/007", date: "2026-09-15", partner: "Apollo Care Center", location: "Rack-A-03", status: "Done" },
];

export default function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Done': return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Ready': return 'bg-[#EFF6FF] text-[#1677D2] border-[#BFDBFE]';
      case 'Waiting': return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'Cancelled': return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Deliveries</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Manage outgoing orders to customers</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button 
            className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm"
            onClick={() => router.push('/deliveries/new')}
          >
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            New Delivery
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search deliveries..." 
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
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[40px]">
                    <input type="checkbox" className="rounded-[4px] border-[#E5E7EB] text-[#1677D2] focus:ring-[#1677D2]" />
                  </th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Reference</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Date</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Partner</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Location</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Status</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-[#1F2937]">
                {mockDeliveries.map((delivery) => (
                  <tr key={delivery.id} onClick={() => router.push(`/deliveries/${delivery.id}`)} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                    <td className="h-[40px] px-[16px]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded-[4px] border-[#E5E7EB] text-[#1677D2] focus:ring-[#1677D2]" />
                    </td>
                    <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{delivery.id}</td>
                    <td className="h-[40px] px-[16px] text-[#6B7280]">{delivery.date}</td>
                    <td className="h-[40px] px-[16px]">{delivery.partner}</td>
                    <td className="h-[40px] px-[16px] text-[#6B7280]">{delivery.location}</td>
                    <td className="h-[40px] px-[16px]">
                      <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[16px] mt-[16px]">
          {["Draft", "Waiting", "Ready", "Done", "Cancelled"].map(statusCol => (
            <div key={statusCol} className="flex flex-col gap-[12px]">
              <h3 className="text-[12px] font-medium text-[#6B7280] flex items-center justify-between">
                {statusCol} <span className="bg-[#E5E7EB] text-[#374151] px-[6px] py-[2px] rounded-full text-[10px]">{mockDeliveries.filter(d => d.status === statusCol).length}</span>
              </h3>
              {mockDeliveries.filter(d => d.status === statusCol).map(delivery => (
                <div key={delivery.id} onClick={() => router.push(`/deliveries/${delivery.id}`)} className="bg-white border border-[#E5E7EB] rounded-[8px] p-[12px] shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="text-[11px] font-medium text-[#1F2937]">{delivery.id}</span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] mb-[4px]">{delivery.partner}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{delivery.date}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
