"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Plus, Trash2, ArrowRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type TransferStatus = "Draft" | "Waiting" | "Ready" | "Done" | "Cancelled";

export default function TransferDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [status, setStatus] = useState<TransferStatus>("Draft");

  // Mock data for a single transfer
  const [transfer, setTransfer] = useState({
    id: isNew ? "New Transfer" : params.id,
    source: "Main Warehouse",
    destination: "Store A",
    date: "2023-10-26",
    lines: [
      { id: 1, product: "MacBook Pro M3", qty: 2, uom: "Units", doneQty: 0 },
      { id: 2, product: "AirPods Pro", qty: 5, uom: "Units", doneQty: 0 },
    ]
  });

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Done': return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Ready': return 'bg-[#EFF6FF] text-[#1677D2] border-[#BFDBFE]';
      case 'Waiting': return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'Cancelled': return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'; // Draft
    }
  };

  const handleStatusChange = (newStatus: TransferStatus) => {
    setStatus(newStatus);
    if (newStatus === "Done") {
      // Auto-fill done quantities if setting to Done
      setTransfer(prev => ({
        ...prev,
        lines: prev.lines.map(line => ({ ...line, doneQty: line.qty }))
      }));
    }
  };

  const handleDoneQtyChange = (id: number, val: string) => {
    const parsed = parseInt(val) || 0;
    setTransfer(prev => ({
      ...prev,
      lines: prev.lines.map(line => line.id === id ? { ...line, doneQty: parsed } : line)
    }));
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-[8px] mb-[20px]">
        <button onClick={() => router.push("/transfers")} className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ChevronLeft className="h-[16px] w-[16px]" />
        </button>
        <div className="text-[12px]">
          <span className="text-[#6B7280] cursor-pointer hover:underline" onClick={() => router.push("/transfers")}>Internal Transfers</span>
          <span className="mx-[8px] text-[#D1D5DB]">/</span>
          <span className="font-medium text-[#1F2937]">{transfer.id}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="flex items-center gap-[8px]">
          {status === "Draft" && (
            <Button onClick={() => handleStatusChange("Waiting")} className="h-[32px] px-[16px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
              Mark as Waiting
            </Button>
          )}
          {status === "Waiting" && (
            <Button onClick={() => handleStatusChange("Ready")} className="h-[32px] px-[16px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
              Check Availability
            </Button>
          )}
          {status === "Ready" && (
            <Button onClick={() => handleStatusChange("Done")} className="h-[32px] px-[16px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
              Validate Transfer
            </Button>
          )}
          
          {(status === "Draft" || status === "Waiting" || status === "Ready") && (
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
          {["Draft", "Waiting", "Ready", "Done"].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`px-[12px] py-[4px] text-[10px] font-medium rounded-full border ${
                status === s 
                  ? getStatusColor(s) 
                  : 'bg-transparent text-[#9CA3AF] border-transparent'
              }`}>
                {s}
              </div>
              {s !== "Done" && <ChevronRight className="h-[12px] w-[12px] text-[#D1D5DB] mx-[2px]" />}
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
        <h1 className="text-[20px] font-semibold text-[#1F2937] mb-[20px]">{transfer.id}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[40px] gap-y-[16px] max-w-[800px]">
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Source Location</label>
            <input type="text" value={transfer.source} onChange={(e) => setTransfer({...transfer, source: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>
          
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Destination Location</label>
            <input type="text" value={transfer.destination} onChange={(e) => setTransfer({...transfer, destination: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>

          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#374151]">Scheduled Date</label>
            <input type="date" value={transfer.date} onChange={(e) => setTransfer({...transfer, date: e.target.value})} className="h-[32px] px-[12px] text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] text-[#1F2937]" disabled={status !== "Draft"} />
          </div>
        </div>
      </div>

      {/* Lines Tab */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-h-[300px]">
        <div className="border-b border-[#E5E7EB] px-[16px] py-[12px]">
          <h2 className="text-[13px] font-semibold text-[#1F2937]">Operations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[100px]">Demand</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[100px]">Done</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[80px]">UoM</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {transfer.lines.map((line) => (
                <tr key={line.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] transition-colors">
                  <td className="h-[40px] px-[16px] font-medium">{line.product}</td>
                  <td className="h-[40px] px-[16px]">{line.qty}</td>
                  <td className="h-[40px] px-[16px]">
                    {status === 'Done' ? (
                      <span className="font-medium text-[#059669]">{line.doneQty}</span>
                    ) : (
                      <input 
                        type="number" 
                        value={line.doneQty} 
                        onChange={(e) => handleDoneQtyChange(line.id, e.target.value)}
                        className="w-[60px] h-[24px] px-[4px] border border-[#E5E7EB] rounded-[4px] text-center"
                        disabled={status === 'Cancelled'}
                      />
                    )}
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
                Add a line
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
