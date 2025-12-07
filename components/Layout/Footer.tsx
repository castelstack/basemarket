"use client";

import { Logo } from "@/assets/logo";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Only show footer on landing page
  if (pathname !== "/") return null;

  return (
    <footer className="border-t border-[#1F1F1F] bg-[#000000] max-md:mb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6">
              <Logo />
            </div>
            <span className="text-sm text-[#9A9A9A] font-light">
              © {currentYear} ShowStakr
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-[#9A9A9A] hover:text-[#EDEDED] transition-colors font-light"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[#9A9A9A] hover:text-[#EDEDED] transition-colors font-light"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-[#9A9A9A] hover:text-[#EDEDED] transition-colors font-light"
            >
              Contact
            </Link>
          </div>

          {/* Built on Base */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0000ff]/10 border border-[#0000ff]/20">
            <span className="text-xs font-normal text-[#0000ff]">
              Built on
            </span>
            <Image src="/base-text.svg" alt="Base" width={36} height={12} />
          </div>
        </div>
      </div>
    </footer>
  );
}
