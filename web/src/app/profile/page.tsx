"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Calendar, Volume2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { t, fontFamily } = useLanguage();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    recordings: 0,
    contributionDate: new Date().toISOString(),
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || !session?.user) {
    return null;
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div
      className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      style={{ fontFamily }}
    >
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Profile Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-emerald-500/20">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-4xl bg-linear-to-br from-emerald-500 to-teal-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                {session.user.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div className="overflow-hidden">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("email")}
                  </div>
                  <div className="truncate font-medium">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("joinDate")}
                  </div>
                  <div className="font-medium">
                    {format(new Date(), "MMMM yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                {t("myStats")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
                  <Volume2 className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                    0
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("totalRecordings")}
                  </div>
                </div>
                {/* Placeholder for future stats */}
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center text-gray-400">
                  <span className="text-sm">More stats coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
