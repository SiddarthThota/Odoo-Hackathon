"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react";

const mockProducts = [
  { id: "1", name: "Wireless Buds", sku: "EL-WB-001", category: "Electronics", price: "$49.99", cost: "$15.00", status: "Active" },
  { id: "2", name: "Industrial Motor", sku: "MA-IM-055", category: "Machinery", price: "$450.00", cost: "$200.00", status: "Active" },
  { id: "3", name: "Packaging Box", sku: "PK-BX-100", category: "Packaging", price: "$0.50", cost: "$0.10", status: "Active" },
  { id: "4", name: "Lithium Battery", sku: "EL-BT-099", category: "Electronics", price: "$12.00", cost: "$4.00", status: "Inactive" },
  { id: "5", name: "Steel Rod 2m", sku: "RM-SR-200", category: "Raw Materials", price: "$15.00", cost: "$8.50", status: "Active" },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] w-full px-[24px] pt-[22px] pb-[32px]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[20px] gap-[12px]">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">Products</h1>
          <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-[3px]">Manage product catalog and variants</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button className="h-[32px] px-[12px] text-[11px] font-medium bg-[#1677D2] hover:bg-[#1677D2]/90 text-white rounded-[6px] shadow-sm">
            <Plus className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-t-[8px] p-[12px] flex flex-col md:flex-row gap-[12px] items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b-0">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full h-[32px] pl-[32px] pr-[12px] text-[11px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#1677D2] focus:ring-1 focus:ring-[#1677D2] placeholder:text-[#9CA3AF] text-[#1F2937]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-[8px] w-full md:w-auto">
          <Button variant="outline" className="h-[32px] px-[12px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
            <Filter className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Category
          </Button>
          <Button variant="outline" className="h-[32px] px-[12px] text-[11px] font-medium text-[#374151] border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB]">
            <FileText className="h-[14px] w-[14px] mr-[4px]" strokeWidth={2} />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-b-[8px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] w-[40px]">
                  <input type="checkbox" className="rounded-[4px] border-[#E5E7EB] text-[#1677D2] focus:ring-[#1677D2]" />
                </th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Product Name</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">SKU</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Category</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Price</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA] text-right">Cost</th>
                <th className="h-[36px] px-[16px] text-[10px] font-medium text-[#6B7280] border-b border-[#E5E7EB] bg-[#F7F8FA]">Status</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-[#1F2937]">
              {mockProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#F1F2F4] hover:bg-[#F9FAFB] cursor-pointer transition-colors group">
                  <td className="h-[40px] px-[16px]">
                    <input type="checkbox" className="rounded-[4px] border-[#E5E7EB] text-[#1677D2] focus:ring-[#1677D2]" />
                  </td>
                  <td className="h-[40px] px-[16px] font-medium group-hover:text-[#1677D2] transition-colors">{product.name}</td>
                  <td className="h-[40px] px-[16px] text-[#6B7280] font-mono text-[10px]">{product.sku}</td>
                  <td className="h-[40px] px-[16px]">{product.category}</td>
                  <td className="h-[40px] px-[16px] text-right">{product.price}</td>
                  <td className="h-[40px] px-[16px] text-right text-[#6B7280]">{product.cost}</td>
                  <td className="h-[40px] px-[16px]">
                    <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[999px] text-[9px] font-medium border ${product.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'}`}>
                      {product.status}
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
            Showing <span className="font-medium text-[#1F2937]">1</span> to <span className="font-medium text-[#1F2937]">5</span> of <span className="font-medium text-[#1F2937]">5</span> results
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
