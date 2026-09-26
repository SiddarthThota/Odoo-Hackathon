"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;
  const isNew = warehouseId === "new";

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Top Bar */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <Link href="/settings/warehouses" className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#1F2937] leading-tight">
          {isNew ? "New Warehouse" : `${warehouseId}`}
        </h1>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-[12px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-[24px]">
        <button className="h-[32px] px-[16px] bg-[#1677D2] text-white text-[11px] font-medium rounded-[6px] hover:bg-[#0B6FCB] transition-colors flex items-center gap-[6px]">
          Save
        </button>
        <Link href="/settings/warehouses" className="h-[32px] px-[16px] bg-white text-[#374151] border border-[#E5E7EB] text-[11px] font-medium rounded-[6px] hover:bg-[#F9FAFB] transition-colors flex items-center gap-[6px]">
          Discard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* Left Col: Main Form & Lines */}
        <div className="lg:col-span-2 space-y-[24px]">
          
          {/* Metadata */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-2 gap-x-[32px] gap-y-[16px]">
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Name</label>
                <input type="text" placeholder="e.g. Main Warehouse" className="w-full text-[13px] border border-[#E5E7EB] rounded-[4px] px-[8px] py-[6px] focus:outline-none focus:border-[#1677D2]" defaultValue={isNew ? "" : "Main Warehouse"} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Short Code</label>
                <input type="text" placeholder="e.g. MAIN" className="w-full text-[13px] border border-[#E5E7EB] rounded-[4px] px-[8px] py-[6px] focus:outline-none focus:border-[#1677D2]" defaultValue={isNew ? "" : "MAIN"} />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-[#6B7280] mb-[4px]">Address</label>
                <input type="text" placeholder="e.g. 123 Logistics Way, CA" className="w-full text-[13px] border border-[#E5E7EB] rounded-[4px] px-[8px] py-[6px] focus:outline-none focus:border-[#1677D2]" defaultValue={isNew ? "" : "123 Logistics Way, CA"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
