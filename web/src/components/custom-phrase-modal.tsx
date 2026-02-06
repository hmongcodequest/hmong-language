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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import { PenLine } from "lucide-react";

interface Phrase {
  hmong: string;
  meaning: {
    hmong: string;
    english: string;
    lao: string;
    thai: string;
  };
}

interface CustomPhraseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPhrase: (phrase: Phrase) => void;
}

export function CustomPhraseModal({
  open,
  onOpenChange,
  onAddPhrase,
}: Readonly<CustomPhraseModalProps>) {
  const { t, fontFamily } = useLanguage();
  const [hmongText, setHmongText] = useState("");
  const [englishMeaning, setEnglishMeaning] = useState("");
  const [laoMeaning, setLaoMeaning] = useState("");
  const [thaiMeaning, setThaiMeaning] = useState("");

  const handleSubmit = () => {
    if (!hmongText.trim()) return;

    const newPhrase: Phrase = {
      hmong: hmongText.trim(),
      meaning: {
        hmong: englishMeaning.trim() || hmongText.trim(),
        english: englishMeaning.trim() || hmongText.trim(),
        lao: laoMeaning.trim() || englishMeaning.trim() || hmongText.trim(),
        thai: thaiMeaning.trim() || englishMeaning.trim() || hmongText.trim(),
      },
    };

    onAddPhrase(newPhrase);
    setHmongText("");
    setEnglishMeaning("");
    setLaoMeaning("");
    setThaiMeaning("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ fontFamily }}
        className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-emerald-600" />
            {t("createCustomPhrase")}
          </DialogTitle>
          <DialogDescription>{t("createCustomPhraseDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hmong">{t("hmongPhrase")} *</Label>
            <Input
              id="hmong"
              value={hmongText}
              onChange={(e) => setHmongText(e.target.value)}
              placeholder="Nyob zoo..."
              className="font-(--font-open-sans)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="english">{t("englishMeaning")}</Label>
            <Input
              id="english"
              value={englishMeaning}
              onChange={(e) => setEnglishMeaning(e.target.value)}
              placeholder="Hello..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lao">{t("laoMeaning")}</Label>
            <Input
              id="lao"
              value={laoMeaning}
              onChange={(e) => setLaoMeaning(e.target.value)}
              placeholder="ສະບາຍດີ..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thai">{t("thaiMeaning")}</Label>
            <Input
              id="thai"
              value={thaiMeaning}
              onChange={(e) => setThaiMeaning(e.target.value)}
              placeholder="สวัสดี..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hmongText.trim()}
            className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {t("addPhrase")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
