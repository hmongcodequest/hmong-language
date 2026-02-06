"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function NotFound() {
  const { t, fontFamily } = useLanguage();

  return (
    <div
      className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative"
      style={{ fontFamily }}
    >
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center space-y-8 max-w-lg">
        {/* 404 Illustration */}
        <div className="relative mx-auto w-64 h-64">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full w-full h-full flex items-center justify-center shadow-2xl border border-white/20">
            <span className="text-8xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
          {/* Decorative icons */}
          <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg animate-bounce delay-100">
            <HelpCircle className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("pageNotFound")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t("pageNotFoundDesc")}
          </p>
          <div className="text-sm text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 py-1 px-3 rounded-full inline-block">
            Error Code: 404
          </div>
        </div>

        {/* Action Button */}
        <Link href="/">
          <Button
            size="lg"
            className="gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
          >
            <Home className="w-5 h-5" />
            {t("backToHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
