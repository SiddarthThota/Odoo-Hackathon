"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, Plus } from "lucide-react";
import Link from "next/link";
import { useOperationsStore } from "@/store/operations";
import { useAuthStore } from "@/lib/auth-store";

type AdjustmentStatus = "Draft" | "In Progress" | "Done" | "Cancelled";

export default function AdjustmentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rawId = params?.id;
  const adjustmentId = Array.isArray(rawId) ? rawId.map(decodeURIComponent).join('/') : decodeURIComponent(rawId as string || 'new');
  const isNew = adjustmentId === "new";
  
  const initialProductId = searchParams.get('productId');
  const initialLocationId = searchParams.get('locationId');

  const operations = useOperationsStore((state) => state.operations);
  const user = useAuthStore((state) => state.user);

  // Data state
  const [status, setStatus] = useState<AdjustmentStatus>(isNew ? "Draft" : "In Progress");
  const [productLines, setProductLines] = useState([
    ...(initialProductId ? [{
      id: 1, 
      product: `[PROD-${initialProductId}] Pre-filled Product`,
      location: initialLocationId || "Main Warehouse",
      counted: 0,
      difference: 0,
      onHand: 100 // Mock onHand
    }] : [
      { id: 1, product: "[EL-001] Wireless Earbuds", location: "Main Warehouse", counted: 1240, difference: 0, onHand: 1240 },
    ])
  ]);
  const [reasonCode, setReasonCode] = useState("COUNT_CORRECTION");

  useEffect(() => {
    if (!isNew) {
      const op = operations.find(o => o.id === adjustmentId);
      if (op) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus(
          op.status === 'DONE' ? 'Done' :
          op.status === 'READY' ? 'Done' :
          op.status === 'WAITING' ? 'In Progress' :
          op.status === 'CANCELED' ? 'Cancelled' : 'Draft'
        );
        setReasonCode(op.reason || "COUNT_CORRECTION");
        
        // Mock onHand to be exactly what was there + difference (if OUT, difference is -quantity, if IN, +quantity)
        const diff = op.direction === 'OUT' ? -op.quantity : op.quantity;
        const counted = 100 + diff; // fake onHand base 100
        
        setProductLines([{
          id: parseInt(op.id) || Date.now(),
          product: op.product,
          location: op.location,
          counted: counted,
          difference: diff,
          onHand: 100
        }]);
      }
    }
  }, [isNew, adjustmentId, operations]);

  const handleStart = () => {
    setStatus("In Progress");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(adjustmentId, { status: "WAITING" });
    }
  };

  const handleValidate = () => {
    setStatus("Done");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(adjustmentId, { status: "DONE" });
    }
  };

  const handleCancel = () => {
    setStatus("Cancelled");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(adjustmentId, { status: "CANCELED" });
    }
  };

  const handleCountedChange = (id: number, val: number) => {
    setProductLines(lines => lines.map(l => l.id === id ? { ...l, counted: val, difference: val - l.onHand } : l));
  };

  const handleSave = () => {
    const newIdStr = `WH/ADJ/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // We get the first product line
    const line = productLines.length > 0 ? productLines[0] : null;
    
    // Create new operation object
    const newOperation = {
      id: newIdStr,
      reference_number: newIdStr,
      operation_type: "ADJUSTMENT" as const,
      status: "DRAFT" as const, // Draft
      source_or_party: "Inventory",
      destination_or_warehouse: "Inventory",
      scheduled_date: new Date().toISOString().split('T')[0],
      operation_date: new Date().toISOString().split('T')[0],
      product: line ? line.product : "Unknown Product",
      quantity: line ? Math.abs(line.difference) : 0,
      location: line ? line.location : "Main Warehouse",
      direction: line && line.difference < 0 ? "OUT" as const : "IN" as const,
      reason: reasonCode,
      created_by: user ? `${user.firstName} ${user.lastName}` : 'System'
    };

    useOperationsStore.getState().addOperation(newOperation);
    router.push('/adjustments');
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Top Bar */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <Link href="/adjustments" className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#1F2937] leading-tight">
          {isNew ? "New Adjustment" : adjustmentId}
        </h1>
        {!isNew && (
          <div className={`ml-[8px] px-[8px] py-[2px] rounded-full text-[11px] font-medium border
            ${status === 'In Progress' ? 'bg-[#EFF6FF] text-[#1677D2] border-[#BFDBFE]' : 
              status === 'Done' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 
              status === 'Cancelled' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 
              'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'}`}>
            {status}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-[12px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-[24px]">
        {isNew ? (
          <button onClick={handleSave} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            Save
          </button>
        ) : status === 'Draft' ? (
          <button onClick={handleStart} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            Start Inventory
          </button>
        ) : status === 'In Progress' ? (
          <button onClick={handleValidate} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            <Check className="h-[14px] w-[14px]" /> Validate
          </button>
        ) : null}
        
        {(status === 'Draft' || status === 'In Progress') && (
          <button onClick={handleCancel} className="h-[32px] px-[16px] bg-white text-[#DC2626] text-[11px] font-medium rounded-[6px] hover:bg-[#FEF2F2] transition-colors flex items-center gap-[6px] ml-auto">
            <X className="h-[14px] w-[14px]" /> Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* Left Col: Main Form & Lines */}
        <div className="lg:col-span-2 space-y-[24px]">
          
          {/* Metadata */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Reference</label>
                <div className="text-[13px] text-[#1F2937] font-medium">{isNew ? "New" : adjustmentId}</div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Date</label>
                <div className="text-[13px] text-[#1F2937]">2023-11-20 10:00:00</div>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Reason</label>
                {status === 'Done' ? (
                  <div className="text-[13px] text-[#1F2937]">{reasonCode.replace('_', ' ')}</div>
                ) : (
                  <select 
                    className="w-full text-[13px] border border-[#E5E7EB] rounded-[4px] px-[8px] py-[6px] focus:outline-none focus:border-[#1677D2]"
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                  >
                    <option value="DAMAGED">Damaged</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="LOST">Lost</option>
                    <option value="COUNT_CORRECTION">Count Correction</option>
                    <option value="SYSTEM_CORRECTION">System Correction</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Responsible</label>
                <div className="text-[13px] text-[#1F2937] font-medium flex items-center gap-2">
                  <div className="h-[16px] w-[16px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0 text-[#6B7280] text-[8px] font-bold">A</div>
                  Admin
                </div>
              </div>
            </div>
          </div>

          {/* Operations Tab */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex items-center gap-[24px] px-[20px] border-b border-[#E5E7EB] h-[44px]">
              <div className="h-full flex items-center text-[12px] font-medium text-[#1677D2] border-b-2 border-[#1677D2]">
                Products
              </div>
            </div>
            
            <div className="p-[0px]">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280]">Product</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280]">Location</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">On Hand</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">Counted Quantity</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F4]">
                  {productLines.map((line) => (
                    <tr key={line.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-[12px] px-[16px] text-[12px] text-[#1F2937] font-medium">{line.product}</td>
                      <td className="py-[12px] px-[16px] text-[12px] text-[#6B7280]">{line.location}</td>
                      <td className="py-[12px] px-[16px] text-[12px] text-[#1F2937] text-right">{line.onHand}</td>
                      <td className="py-[12px] px-[16px] text-[12px] text-right">
                        {status === 'In Progress' ? (
                          <input 
                            type="number"
                            value={line.counted}
                            onChange={(e) => handleCountedChange(line.id, parseInt(e.target.value) || 0)}
                            className="w-[80px] text-right border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]"
                          />
                        ) : (
                          <span className="text-[#1F2937]">{line.counted}</span>
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-right">
                        <span className={line.difference < 0 ? 'text-[#DC2626]' : line.difference > 0 ? 'text-[#059669]' : 'text-[#6B7280]'}>
                          {line.difference > 0 ? `+${line.difference}` : line.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(status === 'Draft' || status === 'In Progress') && (
                <div className="px-[16px] py-[12px] border-t border-[#F1F2F4]">
                  <button className="text-[12px] text-[#1677D2] hover:text-[#0B6FCB] font-medium flex items-center gap-[4px]">
                    <Plus className="h-[14px] w-[14px]" /> Add a line
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Chatter / Log */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-fit flex flex-col">
          <div className="px-[16px] py-[12px] border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#1F2937]">Log Note</h3>
          </div>
          <div className="p-[16px] flex-1">
            <div className="flex gap-[12px] mb-[20px]">
              <div className="h-[28px] w-[28px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0 text-[#6B7280] text-[10px] font-bold">AD</div>
              <div className="flex-1">
                <textarea 
                  className="w-full border border-[#E5E7EB] rounded-[6px] p-[8px] text-[11px] focus:outline-none focus:border-[#1677D2] resize-none"
                  rows={2}
                  placeholder="Log a note..."
                ></textarea>
                <button className="mt-[8px] bg-[#1F2937] text-white text-[11px] font-medium px-[12px] py-[4px] rounded-[4px] hover:bg-[#374151]">
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
