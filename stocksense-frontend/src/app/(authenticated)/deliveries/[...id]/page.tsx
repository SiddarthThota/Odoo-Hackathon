"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Check, X, Box, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useOperationsStore } from "@/store/operations";
import { useAuthStore } from "@/lib/auth-store";

type DeliveryStatus = "Draft" | "Waiting" | "Ready" | "Done" | "Cancelled";

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const deliveryId = Array.isArray(rawId) ? rawId.map(decodeURIComponent).join('/') : decodeURIComponent(rawId as string || 'new');
  const isNew = deliveryId === 'new';

  const operations = useOperationsStore((state) => state.operations);
  const user = useAuthStore((state) => state.user);

  // Data state
  const [status, setStatus] = useState<DeliveryStatus>(isNew ? "Draft" : "Ready");
  const [partner, setPartner] = useState(isNew ? "" : "Acme Corp");
  const [scheduledDate, setScheduledDate] = useState(isNew ? "" : "2023-11-21 14:00:00");
  const [sourceDoc, setSourceDoc] = useState(isNew ? "" : "SO00891");
  
  const [productLines, setProductLines] = useState(isNew ? [] : [
    { id: 1, product: "[EL-001] Wireless Earbuds", demand: 25, reserved: 25, done: 0 },
    { id: 2, product: "[EL-002] Power Bank 10k", demand: 10, reserved: 5, done: 0 }, // Partial reserve example
  ]);

  useEffect(() => {
    if (!isNew) {
      const op = operations.find(o => o.id === deliveryId);
      if (op) {
        setStatus(
          op.status === 'DONE' ? 'Done' :
          op.status === 'READY' ? 'Ready' :
          op.status === 'WAITING' ? 'Waiting' :
          op.status === 'CANCELED' ? 'Cancelled' : 'Draft'
        );
        setPartner(op.source_or_party);
        setScheduledDate(op.operation_date + " 14:00:00");
        setSourceDoc("SO" + op.id.padStart(5, '0'));
        setProductLines([{
          id: parseInt(op.id) || Date.now(),
          product: op.product,
          demand: op.quantity,
          reserved: op.status === 'DONE' || op.status === 'READY' ? op.quantity : 0,
          done: op.status === 'DONE' ? op.quantity : 0
        }]);
      }
    }
  }, [isNew, deliveryId, operations]);

  const handleValidate = () => {
    setProductLines(lines => lines.map(l => ({ ...l, done: l.done === 0 ? l.reserved : l.done })));
    setStatus("Done");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(deliveryId, { status: "DONE" });
    }
  };

  const handleCancel = () => {
    setStatus("Cancelled");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(deliveryId, { status: "CANCELED" });
    }
  };

  const handleDoneChange = (id: number, val: number) => {
    setProductLines(lines => lines.map(l => l.id === id ? { ...l, done: val } : l));
  };

  const handleSave = () => {
    if (productLines.length === 0 || !productLines[0].product || !partner) {
       alert("Please fill required fields");
       return;
    }
    useOperationsStore.getState().addOperation({
       operation_type: 'DELIVERY',
       status: 'DRAFT',
       source_or_party: partner,
       destination_or_warehouse: "Hyderabad Pharmacy",
       location: "Rack-A-01",
       product: productLines[0].product,
       quantity: productLines[0].demand,
       direction: 'OUT',
       reason: 'SALE',
       operation_date: new Date().toISOString().split('T')[0],
       created_by: user ? `${user.firstName} ${user.lastName}` : 'System'
    });
    router.push('/deliveries');
  };

  const checkAvailability = () => {
    // Mock: auto-reserve the stock so the user can proceed
    setProductLines(lines => lines.map(l => ({ ...l, reserved: l.demand })));
    setStatus("Ready");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(deliveryId, { status: "READY" });
    }
  };

  const handleMarkToDo = () => {
    setStatus("Waiting");
    if (!isNew) {
      useOperationsStore.getState().updateOperation(deliveryId, { status: "WAITING" });
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Top Bar */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <Link href="/deliveries" className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#1F2937] leading-tight">
          {isNew ? 'New Delivery' : deliveryId}
        </h1>
        <div className={`ml-[8px] px-[8px] py-[2px] rounded-full text-[11px] font-medium border
          ${status === 'Ready' ? 'bg-[#EFF6FF] text-[#1677D2] border-[#BFDBFE]' : 
            status === 'Waiting' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 
            status === 'Done' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 
            status === 'Cancelled' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 
            'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'}`}>
          {status}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-[12px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-[24px]">
        {isNew ? (
          <button onClick={handleSave} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            Save
          </button>
        ) : status === 'Draft' ? (
          <button onClick={handleMarkToDo} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            To Do
          </button>
        ) : status === 'Waiting' ? (
          <button onClick={checkAvailability} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            <Check className="h-[14px] w-[14px]" /> Check Availability
          </button>
        ) : status === 'Ready' ? (
          <button onClick={handleValidate} className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
            <Check className="h-[14px] w-[14px]" /> Validate
          </button>
        ) : null}

        {!isNew && status === 'Done' && (
          <button className="h-[32px] px-[16px] bg-white border border-[#E5E7EB] text-[#374151] text-[11px] font-medium rounded-[6px] hover:bg-[#F9FAFB] transition-colors flex items-center gap-[6px]">
            <Printer className="h-[14px] w-[14px]" /> Print
          </button>
        )}
        {(status === 'Draft' || status === 'Ready' || status === 'Waiting') && (
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
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Delivery Address</label>
                {isNew ? (
                  <input type="text" value={partner} onChange={e => setPartner(e.target.value)} className="w-full border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]" placeholder="e.g. Acme Corp" />
                ) : (
                  <>
                    <div className="text-[13px] text-[#1F2937] font-medium">{partner}</div>
                    <div className="text-[12px] text-[#6B7280]">123 Business Rd, Tech City</div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Operation Type</label>
                <div className="text-[13px] text-[#1F2937] font-medium">WH: Delivery Orders</div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Scheduled Date</label>
                {isNew ? (
                  <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]" />
                ) : (
                  <div className="text-[13px] text-[#1F2937]">{scheduledDate}</div>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Responsible</label>
                <div className="text-[13px] text-[#1F2937] font-medium flex items-center gap-2">
                  <div className="h-[16px] w-[16px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0 text-[#6B7280] text-[8px] font-bold">A</div>
                  Admin
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Source Document</label>
                {isNew ? (
                  <input type="text" value={sourceDoc} onChange={e => setSourceDoc(e.target.value)} className="w-full border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]" placeholder="e.g. SO00891" />
                ) : (
                  <div className="text-[13px] text-[#1677D2] hover:underline cursor-pointer font-medium">{sourceDoc}</div>
                )}
              </div>
            </div>
          </div>

          {/* Operations Tab */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex items-center gap-[24px] px-[20px] border-b border-[#E5E7EB] h-[44px]">
              <div className="h-full flex items-center text-[12px] font-medium text-[#1677D2] border-b-2 border-[#1677D2]">
                Operations
              </div>
              <div className="h-full flex items-center text-[12px] font-medium text-[#6B7280] hover:text-[#374151] cursor-pointer">
                Additional Info
              </div>
            </div>
            
            <div className="p-[0px]">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] w-[40%]">Product</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">Demand</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">Reserved</th>
                    <th className="py-[10px] px-[16px] text-[11px] font-medium text-[#6B7280] text-right">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F4]">
                  {productLines.map((line) => (
                    <tr key={line.id} className={line.reserved < line.demand ? "bg-[#FEF2F2] hover:bg-[#FEE2E2]" : "hover:bg-[#F8FAFC]"}>
                      <td className={`py-[12px] px-[16px] text-[12px] font-medium ${line.reserved < line.demand ? 'text-[#DC2626]' : 'text-[#1F2937]'}`}>
                        {isNew ? (
                          <input type="text" value={line.product} onChange={e => setProductLines(lines => lines.map(l => l.id === line.id ? { ...l, product: e.target.value } : l))} className="w-full border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]" placeholder="Product name" />
                        ) : (
                          line.product
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-[#1F2937] text-right">
                        {isNew ? (
                          <input type="number" value={line.demand} onChange={e => setProductLines(lines => lines.map(l => l.id === line.id ? { ...l, demand: parseInt(e.target.value) || 0, reserved: parseInt(e.target.value) || 0 } : l))} className="w-[60px] text-right border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]" placeholder="1" />
                        ) : (
                          line.demand
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-right">
                        <span className={line.reserved < line.demand ? 'text-[#DC2626] font-bold' : 'text-[#16A34A] font-medium'}>
                          {line.reserved}
                        </span>
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-right">
                        {status === 'Ready' || status === 'Waiting' ? (
                          <input 
                            type="number"
                            value={line.done || ''}
                            onChange={(e) => handleDoneChange(line.id, parseInt(e.target.value) || 0)}
                            className="w-[60px] text-right border border-[#E5E7EB] rounded-[4px] px-[8px] py-[4px] text-[12px] focus:outline-none focus:border-[#1677D2]"
                            placeholder="0"
                          />
                        ) : (
                          <span className={line.done < line.demand ? 'text-[#DC2626] font-medium' : 'text-[#1F2937]'}>{line.done}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(status === 'Ready' || status === 'Waiting' || isNew) && (
                <div className="px-[16px] py-[12px] border-t border-[#F1F2F4]">
                  <button onClick={() => setProductLines([...productLines, { id: Date.now(), product: "New Product", demand: 1, reserved: 0, done: 0 }])} className="text-[12px] text-[#1677D2] hover:text-[#0B6FCB] font-medium flex items-center gap-[4px]">
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
            
            <div className="space-y-[16px]">
              <div className="flex gap-[12px]">
                <div className="h-[28px] w-[28px] rounded-full bg-[#1677D2] flex items-center justify-center shrink-0 text-white text-[10px] font-bold">S</div>
                <div>
                  <div className="text-[11px] font-medium text-[#1F2937]">System <span className="text-[#6B7280] font-normal text-[10px] ml-[4px]">3 hours ago</span></div>
                  <div className="text-[11px] text-[#374151] mt-[2px]">Status changed from Waiting to Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
