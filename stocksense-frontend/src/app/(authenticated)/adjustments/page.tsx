"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, FileText, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOperationsStore } from "@/store/operations";

export default function AdjustmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const router = useRouter();

  const operations = useOperationsStore((state) => state.operations);
  const adjustments = operations.filter(op => op.operation_type === 'ADJUSTMENT');

  const filteredAdjustments = adjustments.filter(adj => 
    adj.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    adj.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'COMPLETED': return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'APPROVED': return 'bg-[#EFF6FF] text-[#1677D2] border-[#BFDBFE]';
      case 'PENDING': return 'bg-[#FEF08A] text-[#B45309] border-[#FDE047]';
      case 'CANCELLED': return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      case 'DRAFT': return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Inventory Adjustments</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Correct stock levels and record shrinkage</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button 
            className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm"
            onClick={() => router.push('/adjustments/new')}
          >
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search adjustments..." 
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
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Warehouse/Location</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Reason/Source</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                  <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Status</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-[#1F2937]">
                {filteredAdjustments.map((adj) => (
                  <tr key={adj.id} onClick={() => router.push(`/adjustments/${adj.id}`)} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                    <td className="h-[40px] px-[16px]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded-[4px] border-[#E5E7EB] text-[#1677D2] focus:ring-[#1677D2]" />
                    </td>
                    <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{adj.reference_number}</td>
                    <td className="h-[40px] px-[16px] text-[#6B7280]">{adj.operation_date}</td>
                    <td className="h-[40px] px-[16px]">{adj.location}</td>
                    <td className="h-[40px] px-[16px] text-[#6B7280]">{adj.source_or_party}</td>
                    <td className="h-[40px] px-[16px] text-[#6B7280]">{adj.product}</td>
                    <td className="h-[40px] px-[16px]">
                      <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border ${getStatusColor(adj.status)}`}>
                        {adj.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="h-[60px] text-center text-[#6B7280]">
                      No adjustments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#F1F2F4] bg-[#FFFFFF]">
            <div className="text-[10px] text-[#6B7280]">
              Showing <span className="font-medium text-[#1F2937]">{filteredAdjustments.length > 0 ? 1 : 0}</span> to <span className="font-medium text-[#1F2937]">{filteredAdjustments.length}</span> of <span className="font-medium text-[#1F2937]">{filteredAdjustments.length}</span> results
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
          {["DRAFT", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"].map(statusCol => {
            const colAdjs = filteredAdjustments.filter(d => d.status === statusCol);
            return (
              <div key={statusCol} className="flex flex-col gap-[12px]">
                <h3 className="text-[12px] font-medium text-[#6B7280] flex items-center justify-between">
                  {statusCol} <span className="bg-[#E5E7EB] text-[#374151] px-[6px] py-[2px] rounded-full text-[10px]">{colAdjs.length}</span>
                </h3>
                {colAdjs.map(adj => (
                  <div key={adj.id} onClick={() => router.push(`/adjustments/${adj.id}`)} className="bg-white border border-[#E5E7EB] rounded-[8px] p-[12px] shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <div className="flex items-center justify-between mb-[8px]">
                      <span className="text-[11px] font-medium text-[#1F2937]">{adj.reference_number}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] mb-[4px]">{adj.location}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{adj.operation_date}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
