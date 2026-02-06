"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  Volume2,
  Users,
  Heart,
  LogIn,
  PenLine,
  Sparkles,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LoginModal } from "@/components/login-modal";
import { UserMenu } from "@/components/user-menu";
import { CustomPhraseModal } from "@/components/custom-phrase-modal";
import { AIPhraseModal } from "@/components/ai-phrase-modal";

interface Phrase {
  hmong: string;
  meaning: {
    hmong: string;
    english: string;
    lao: string;
    thai: string;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const { t, fontFamily, language } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCustomPhraseModal, setShowCustomPhraseModal] = useState(false);
  const [showAIPhraseModal, setShowAIPhraseModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ປະໂຫຍກຕົວຢ່າງສຳລັບບັນທຶກສຽງ (Hmong phrases with translations)
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  // Stats from database
  const [stats, setStats] = useState({
    contributors: 0,
    totalRecordings: 0,
    progress: 0,
  });

  // Check if user is authenticated
  const isAuthenticated = status === "authenticated" && session?.user;
  const isLoading = status === "loading";

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleRecordClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (phrases.length === 0) {
      setShowCustomPhraseModal(true);
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setUploadSuccess(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(t("micPermissionError"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const uploadRecording = async () => {
    if (!audioBlob || !isAuthenticated) return;

    setIsUploading(true);

    // Simulate upload - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsUploading(false);
    setUploadSuccess(true);

    // Check if we reached 100% progress (finished last phrase)
    const isFinished = currentPhrase + 1 >= phrases.length;

    setTimeout(() => {
      if (isFinished) {
        // Auto clear phrases if 100% done
        clearPhrases();
      } else {
        setCurrentPhrase((prev) => prev + 1);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setUploadSuccess(false);
      }
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const nextPhrase = () => {
    setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setUploadSuccess(false);
  };

  const addCustomPhrase = (phrase: Phrase) => {
    setPhrases((prev) => [...prev, phrase]);
    // Jump to the new phrase
    setCurrentPhrase(phrases.length);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const addAIPhrases = (newPhrases: Phrase[]) => {
    setPhrases((prev) => [...prev, ...newPhrases]);
    // Jump to first new phrase
    setCurrentPhrase(phrases.length);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const clearPhrases = () => {
    setPhrases([]);
    setCurrentPhrase(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  return (
    <div
      className={`min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}
      style={{ fontFamily }}
    >
      {/* Modals */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <CustomPhraseModal
        open={showCustomPhraseModal}
        onOpenChange={setShowCustomPhraseModal}
        onAddPhrase={addCustomPhrase}
      />
      <AIPhraseModal
        open={showAIPhraseModal}
        onOpenChange={setShowAIPhraseModal}
        onAddPhrases={addAIPhrases}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-linear-to-b from-emerald-400/30 to-transparent rounded-full blur-3xl" />

        {/* Top Bar - Language Switcher & User Menu */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-gray-700"
              onClick={() => setShowLoginModal(true)}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t("loginTitle")}</span>
            </Button>
          )}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              <span>{t("preserveLanguage")}</span>
            </div>
            <h1 className="text-4xl pb-2 sm:text-5xl font-bold bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              {t("appTitle")}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("appDescription")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
              <Users className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.contributors.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("contributors")}
              </div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
              <Volume2 className="w-6 h-6 mx-auto mb-2 text-teal-600" />
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.totalRecordings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("totalRecordings")}
              </div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.progress}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("progress")}
              </div>
            </div>
          </div>

          {/* Recording Card */}
          <Card className="max-w-xl mx-auto py-10 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{t("recordYourVoice")}</CardTitle>
              <CardDescription>{t("readPhraseBelowAndRecord")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phrase Display */}
              <div
                hidden={phrases.length === 0}
                className="text-center p-6 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800"
              >
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                  {phrases[currentPhrase]?.hmong}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {phrases[currentPhrase]?.meaning[language]}
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {t("phraseOf")} {currentPhrase + 1} {t("of")} {phrases.length}
                </div>
              </div>

              {/* Add Phrase Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                  onClick={() => setShowCustomPhraseModal(true)}
                >
                  <PenLine className="w-4 h-4" />
                  {t("createCustomPhrase")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => setShowAIPhraseModal(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  {t("generateWithAI")}
                </Button>
                {phrases.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={clearPhrases}
                  >
                    <span className="text-xl">×</span>
                    {t("clearPhrases")}
                  </Button>
                )}
              </div>

              {/* Progress */}
              <div hidden={phrases.length === 0} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t("progress")}</span>
                  <span>
                    {Math.round((currentPhrase / phrases.length) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(currentPhrase / phrases.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Recording Controls */}
              <div className="flex flex-col items-center gap-4">
                {/* Login Required Message */}
                {!isAuthenticated && !isLoading && (
                  <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
                    {t("loginRequired")}
                  </div>
                )}

                {/* Recording Timer */}
                {(isRecording || audioBlob) && (
                  <div className="text-2xl font-mono font-bold text-gray-800 dark:text-white">
                    {formatTime(recordingTime)}
                  </div>
                )}

                {/* Recording Button */}
                <div className="flex items-center gap-4">
                  {!audioBlob ? (
                    <Button
                      size="lg"
                      className={`w-20 h-20 rounded-full transition-all duration-300 ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50"
                          : isAuthenticated
                            ? "bg-linear-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30"
                            : "bg-gray-400 hover:bg-gray-500 shadow-lg"
                      }`}
                      onClick={handleRecordClick}
                      disabled={isLoading}
                    >
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Play Button */}
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-14 h-14 rounded-full"
                        onClick={playAudio}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>

                      {/* Upload Button */}
                      <Button
                        size="lg"
                        className={`w-14 h-14 rounded-full ${
                          uploadSuccess
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-linear-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        }`}
                        onClick={uploadRecording}
                        disabled={isUploading || uploadSuccess}
                      >
                        {uploadSuccess ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : isUploading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-white" />
                        )}
                      </Button>

                      {/* Re-record Button */}
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-14 h-14 rounded-full"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl(null);
                          setRecordingTime(0);
                        }}
                        disabled={isUploading}
                      >
                        <Mic className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {isRecording
                    ? t("recording")
                    : audioBlob
                      ? t("listenSendOrReRecord")
                      : t("pressMicToStart")}
                </p>

                {/* Skip Button */}
                {!isRecording && !audioBlob && phrases.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={nextPhrase}>
                    {t("skipPhrase")}
                  </Button>
                )}
              </div>

              {/* Hidden Audio Element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              )}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{t("footerMessage")}</p>
            <p className="mt-1">{t("thankYou")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
