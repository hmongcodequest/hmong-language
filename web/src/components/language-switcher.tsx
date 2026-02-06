"use client";

import { useLanguage, Language } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "hmong", name: "Hmoob", flag: "🟢" },
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "lao", name: "ລາວ", flag: "🇱🇦" },
  { code: "thai", name: "ไทย", flag: "🇹🇭" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, fontFamily } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild style={{ fontFamily }}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-gray-700"
        >
          <Globe className="w-4 h-4" />
          <span>{currentLang?.flag}</span>
          <span className="hidden sm:inline">{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        style={{ fontFamily }}
        align="end"
        className="min-w-[140px]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-2 cursor-pointer ${
              language === lang.code
                ? "bg-emerald-50 dark:bg-emerald-900/30"
                : ""
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-emerald-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
