"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await register(firstName, lastName, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      setIsLoading(false);
    }
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
        <h2 className="text-[20px] font-semibold text-[#1F2937]">Create an account</h2>
        <p className="mt-[8px] text-[12px] text-[#6B7280]">
          Get started with our inventory system
        </p>
      </div>

      <div className="mt-[32px] sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white py-[32px] px-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-[12px] sm:px-[32px] border border-[#E5E7EB]">
          <form className="space-y-[20px]" onSubmit={handleRegister}>
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                    <User className="h-[16px] w-[16px] text-[#9CA3AF]" />
                  </div>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-[36px] pr-[12px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB]"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                    <User className="h-[16px] w-[16px] text-[#9CA3AF]" />
                  </div>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full pl-[36px] pr-[12px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB]"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                  <Mail className="h-[16px] w-[16px] text-[#9CA3AF]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-[36px] pr-[12px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB]"
                  placeholder="admin@inventrax.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                  <Lock className="h-[16px] w-[16px] text-[#9CA3AF]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-[36px] pr-[40px] h-[40px] text-[13px] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#2F5FDB] focus:ring-1 focus:ring-[#2F5FDB]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-[12px] flex items-center text-[#9CA3AF]"
                >
                  {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
                </button>
              </div>
            </div>

            <div className="pt-[8px]">
              <Button 
                type="submit" 
                className="w-full h-[40px] text-[13px] font-medium bg-[#2F5FDB] hover:bg-[#173B7A] text-white rounded-[8px]"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </div>
            
          </form>

          <div className="mt-[24px]">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-[8px] text-[#6B7280]">Already have an account?</span>
              </div>
            </div>
            
            <div className="mt-[16px] flex justify-center">
              <Link href="/login" className="text-[12px] font-medium text-[#2F5FDB] hover:text-[#173B7A]">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
