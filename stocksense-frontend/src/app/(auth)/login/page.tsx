"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center gap-[8px] mb-[24px]">
          <div className="h-[36px] w-[36px] bg-[#2F5FDB] rounded-[8px] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-[18px]">I</span>
          </div>
          <span className="text-[24px] font-bold text-[#173B7A] tracking-tight">InventraX</span>
        </div>
        <h2 className="text-[20px] font-semibold text-[#1F2937]">Sign in to your account</h2>
        <p className="mt-[8px] text-[12px] text-[#6B7280]">
          Enter your credentials to access the inventory system
        </p>
      </div>

      <div className="mt-[32px] sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white py-[32px] px-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[12px] sm:px-[32px] border border-[#E5E7EB]">
          <form className="space-y-[20px]" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                  <Mail className="h-[16px] w-[16px] text-[#9CA3AF]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-[36px] pr-[12px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB] placeholder:text-[#9CA3AF] text-[#1F2937]"
                  placeholder="admin@inventrax.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="block text-[12px] font-medium text-[#374151]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] font-medium text-[#2F5FDB] hover:text-[#173B7A] transition-colors">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                  <Lock className="h-[16px] w-[16px] text-[#9CA3AF]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-[36px] pr-[40px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB] placeholder:text-[#9CA3AF] text-[#1F2937]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-[12px] flex items-center text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showPassword ? (
                    <EyeOff className="h-[16px] w-[16px]" />
                  ) : (
                    <Eye className="h-[16px] w-[16px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-[8px]">
              <Button 
                type="submit" 
                className="w-full h-[40px] text-[13px] font-medium bg-[#2F5FDB] hover:bg-[#173B7A] text-white rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-[8px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-[16px] w-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-[14px] w-[14px]" />
                  </>
                )}
              </Button>
            </div>
            
          </form>

          <div className="mt-[24px]">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-[8px] text-[#6B7280]">Don't have an account?</span>
              </div>
            </div>
            
            <div className="mt-[16px] flex justify-center">
              <Link href="/signup" className="text-[12px] font-medium text-[#2F5FDB] hover:text-[#173B7A] transition-colors">
                Contact your administrator to create an account
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-[24px] text-center text-[11px] text-[#9CA3AF]">
          &copy; {new Date().getFullYear()} InventraX Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
