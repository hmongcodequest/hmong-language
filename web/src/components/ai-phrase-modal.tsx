"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface Phrase {
  hmong: string;
  meaning: {
    hmong: string;
    english: string;
    lao: string;
    thai: string;
  };
}

type AIProvider = "gemini" | "openai" | "ollama" | "openrouter";

interface AIPhraseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPhrases: (phrases: Phrase[]) => void;
}

const PROVIDER_INFO = {
  openrouter: {
    name: "OpenRouter",
    color: "text-orange-600",
    icon: "🌐",
    disabled: false,
  },
  gemini: {
    name: "Google Gemini",
    color: "text-blue-600",
    icon: "✨",
    disabled: true,
  },
  openai: {
    name: "OpenAI GPT",
    color: "text-green-600",
    icon: "🤖",
    disabled: true,
  },
  ollama: {
    name: "Ollama (Local)",
    color: "text-purple-600",
    icon: "🦙",
    disabled: true,
  },
};

export function AIPhraseModal({
  open,
  onOpenChange,
  onAddPhrases,
}: Readonly<AIPhraseModalProps>) {
  const { t, fontFamily } = useLanguage();
  const [provider, setProvider] = useState<AIProvider>("openrouter");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPhrases, setGeneratedPhrases] = useState<Phrase[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPhrases([]);

    try {
      const response = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          topic: topic || "common greetings and daily conversation",
          count: Number.parseInt(count),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate phrases");
      }

      setGeneratedPhrases(data.phrases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPhrases = () => {
    if (generatedPhrases.length > 0) {
      onAddPhrases(generatedPhrases);
      setGeneratedPhrases([]);
      setTopic("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setGeneratedPhrases([]);
    setError(null);
    setTopic("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            {t("generateWithAI")}
          </DialogTitle>
          <DialogDescription style={{ fontFamily }}>
            {t("generateWithAIDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4" style={{ fontFamily }}>
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>{t("selectAIProvider")}</Label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as AIProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key} disabled={info.disabled}>
                    <span className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className={info.color}>{info.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">{t("topic")}</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("topicPlaceholder")}
            />
          </div>

          {/* Count */}
          <div className="space-y-2">
            <Label htmlFor="count">{t("numberOfPhrases")}</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["3", "5", "10", "15", "20"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} {t("phrases")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Generated Phrases Preview */}
          {generatedPhrases.length > 0 && (
            <div className="space-y-2">
              <Label>{t("generatedPhrases")}</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                {generatedPhrases.map((phrase, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {phrase.hmong}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {phrase.meaning.english}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2" style={{ fontFamily }}>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          {generatedPhrases.length > 0 ? (
            <Button
              onClick={handleAddPhrases}
              className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {t("addAllPhrases")} ({generatedPhrases.length})
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("generate")}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
