"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, LogOut, Bell } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const navItemClass = (path: string) => `
    flex items-center gap-[4px] px-[9px] py-[6px] rounded-[6px] transition-colors
    ${isActive(path) ? "bg-[#EFF6FF] text-[#1677D2]" : "text-[#1F2937] hover:bg-[#F7F8FA] hover:text-[#1677D2]"}
  `;

  return (
    <nav className="border-b border-[#E5E7EB] bg-[#FFFFFF] sticky top-0 z-50 h-[56px] flex items-center">
      <div className="flex items-center px-[24px] max-w-[1440px] mx-auto w-full justify-between">
        
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-[24px]">
          {/* Brand */}
          <Link href="/dashboard" className="text-[15px] font-semibold text-[#1F2937] tracking-tight">
            InventraX
          </Link>

          <div className="hidden md:flex items-center gap-[4px] text-[11px] font-medium ml-[12px]">
            <Link href="/dashboard" className={navItemClass("/dashboard")}>
              Dashboard
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={navItemClass("/operations")}>
                Operations <ChevronDown className="h-[12px] w-[12px]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] w-[180px]">
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/receipts" className="w-full h-full flex items-center px-2">Receipts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/deliveries" className="w-full h-full flex items-center px-2">Deliveries</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/adjustments" className="w-full h-full flex items-center px-2">Adjustments</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/transfers" className="w-full h-full flex items-center px-2">Transfers</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/stock" className={navItemClass("/stock")}>
              Stock
            </Link>

            <Link href="/move-history" className={navItemClass("/move-history")}>
              Move History
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={navItemClass("/settings")}>
                Settings <ChevronDown className="h-[12px] w-[12px]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] w-[160px]">
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/settings/warehouses" className="w-full h-full flex items-center px-2">Warehouse</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                  <Link href="/settings/locations" className="w-full h-full flex items-center px-2">Locations</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-[16px]">
          <button className="text-[#6B7280] hover:text-[#1F2937] transition-colors relative">
            <Bell className="h-[16px] w-[16px]" strokeWidth={1.75} />
            {/* Optional dot */}
            <span className="absolute top-0 right-0 w-[6px] h-[6px] bg-[#E5484D] rounded-full border border-white translate-x-1/3 -translate-y-1/3" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-[8px] outline-none">
              <div className="h-[24px] w-[24px] rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
                <User className="h-[14px] w-[14px] text-[#6B7280]" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-medium text-[#1F2937] hidden md:block">Admin</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] w-[140px]">
              <DropdownMenuItem className="h-[32px] text-[11px] hover:bg-[#F5F8FC] cursor-pointer p-0">
                <Link href="/profile" className="w-full h-full flex items-center px-2">My Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="h-[32px] text-[11px] text-[#E5484D] hover:bg-[#F5F8FC] cursor-pointer p-0">
                <Link href="/login" className="w-full h-full flex items-center px-2">
                  <LogOut className="mr-2 h-[12px] w-[12px]" strokeWidth={2} />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  );
}
