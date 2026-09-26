"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type AdjustmentStatus = "Draft" | "Done" | "Cancelled";

export default function AdjustmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [status, setStatus] = useState<AdjustmentStatus>("Draft");

  // Mock data for a single adjustment
  const [adjustment, setAdjustment] = useState({
    id: isNew ? "New Adjustment" : params.id,
    warehouse: "Main Warehouse",
    reason: "Annual Count",
    date: "2023-10-24",
    lines: [
      { id: 1, product: "MacBook Pro M3", theoreticalQty: 45, countedQty: 42, difference: -3, uom: "Units" },
      { id: 2, product: "AirPods Pro", theoreticalQty: 120, countedQty: 121, difference: 1, uom: "Units" },
    ]
  });

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Done': return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Cancelled': return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'; // Draft
    }
  };

  const handleStatusChange = (newStatus: AdjustmentStatus) => {
    setStatus(newStatus);
  };

  const handleCountedQtyChange = (id: number, val: string) => {
    const parsed = parseInt(val) || 0;
    setAdjustment(prev => ({
      ...prev,
      lines: prev.lines.map(line => {
        if (line.id === id) {
          return { ...line, countedQty: parsed, difference: parsed - line.theoreticalQty };
        }
        return line;
      })
    }));
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-[8px] mb-[20px]">
        <button onClick={() => router.push("/adjustments")} className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ChevronLeft className="h-[16px] w-[16px]" />
        </button>
        <div className="text-[12px]">
          <span className="text-[#6B7280] cursor-pointer hover:underline" onClick={() => router.push("/adjustments")}>Inventory Adjustments</span>
          <span className="mx-[8px] text-[#D1D5DB]">/</span>
          <span className="font-medium text-[#1F2937]">{adjustment.id}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="flex items-center gap-[8px]">
          {status === "Draft" && (
            <Button onClick={() => handleStatusChange("Done")} className="h-[32px] px-[16px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
              Validate Inventory
            </Button>
          )}
          
          {status === "Draft" && (
            <Button onClick={() => handleStatusChange("Cancelled")} variant="outline" className="h-[32px] px-[16px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
              Cancel
            </Button>
          )}
          
          <Button variant="outline" className="h-[32px] px-[12px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
            <Save className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Save
          </Button>
        </div>
        
        <div className="flex items-center gap-[8px]">
          {["Draft", "Done"].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`px-[12px] py-[4px] text-[10px] font-medium rounded-full border ${
                status === s 
                  ? getStatusColor(s) 
                  : 'bg-transparent text-[#9CA3AF] border-transparent'
              }`}>
                {s}
              </div>
            </div>
          ))}
          {status === "Cancelled" && (
            <div className={`ml-2 px-[12px] py-[4px] text-[10px] font-medium rounded-full border ${getStatusColor("Cancelled")}`}>
              Cancelled
            </div>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <h1 className="text-[20px] font-semibold text-[#1F2937] mb-[20px]">{adjustment.id}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[40px] gap-y-[16px] max-w-[800px]">
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Inventory Reference / Reason</label>
            <input type="text" value={adjustment.reason} onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>
          
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Location</label>
            <input type="text" value={adjustment.warehouse} onChange={(e) => setAdjustment({...adjustment, warehouse: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>

          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Date</label>
            <input type="date" value={adjustment.date} onChange={(e) => setAdjustment({...adjustment, date: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>
        </div>
      </div>

      {/* Lines Tab */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[300px]">
        <div className="border-b border-[#E5E7EB] px-[16px] py-[12px]">
          <h2 className="text-[13px] font-semibold text-[#1F2937]">Counted Quantities</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[100px]">Theoretical</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[100px]">Counted</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[100px]">Difference</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[80px]">UoM</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {adjustment.lines.map((line) => (
                <tr key={line.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] transition-colors">
                  <td className="h-[40px] px-[16px] font-medium">{line.product}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{line.theoreticalQty}</td>
                  <td className="h-[40px] px-[16px]">
                    {status === 'Done' ? (
                      <span className="font-medium text-[#1F2937]">{line.countedQty}</span>
                    ) : (
                      <input 
                        type="number" 
                        value={line.countedQty} 
                        onChange={(e) => handleCountedQtyChange(line.id, e.target.value)}
                        className="w-[60px] h-[24px] px-[4px] border border-[#E5E7EB] rounded-[4px] text-center"
                        disabled={status === 'Cancelled'}
                      />
                    )}
                  </td>
                  <td className="h-[40px] px-[16px]">
                    <span className={`font-medium ${line.difference > 0 ? 'text-[#059669]' : line.difference < 0 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
                      {line.difference > 0 ? '+' : ''}{line.difference}
                    </span>
                  </td>
                  <td className="h-[40px] px-[16px] text-[#6B7280]">{line.uom}</td>
                  <td className="h-[40px] px-[16px]">
                    <button className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors" disabled={status !== 'Draft'}>
                      <Trash2 className="h-[14px] w-[14px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {status === 'Draft' && (
            <div className="p-[12px]">
              <Button variant="ghost" className="text-[11px] text-[#1677D2] hover:text-[#1677D2] hover:bg-[#EFF6FF] h-[28px] px-[8px]">
                <Plus className="h-[14px] w-[14px] mr-[4px]" />
                Add a product
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
