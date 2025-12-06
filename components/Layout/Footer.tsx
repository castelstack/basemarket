"use client";

import { Logo } from "@/assets/logo";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/50 max-md:mb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6">
              <Logo />
            </div>
            <span className="text-sm text-gray-400">
              © {currentYear} ShowStakr
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-gray-400 hover:text-violet-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-violet-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-violet-400 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Built on Base */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Image src="/base.jpeg" alt="Base" width={16} height={16} className="rounded" />
            <span className="text-xs font-medium text-blue-300">
              Built on Base
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
