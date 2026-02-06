"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "hmong" | "english" | "lao" | "thai";

interface Translations {
  [key: string]: {
    hmong: string;
    english: string;
    lao: string;
    thai: string;
  };
}

// Translations for the app
export const translations: Translations = {
  // Header
  preserveLanguage: {
    hmong: "Pab txuag lus Hmoob",
    english: "Help preserve Hmong language",
    lao: "ຮ່ວມອະນຸລັກພາສາມົ້ງ",
    thai: "ร่วมอนุรักษ์ภาษาม้ง",
  },
  appTitle: {
    hmong: "Hmong Lus Suab",
    english: "Hmong Voice",
    lao: "Hmong Lus Suab",
    thai: "Hmong Lus Suab",
  },
  appDescription: {
    hmong: "Pab sau suab lus Hmoob kom peb cov lus nyob mus ib txhis",
    english: "Help record Hmong voices to preserve our language forever",
    lao: "ຊ່ວຍກັນບັນທຶກສຽງພາສາມົ້ງເພື່ອສືບສານພາສາຂອງພວກເຮົາ",
    thai: "ช่วยกันบันทึกเสียงภาษาม้งเพื่อสืบสานภาษาของเรา",
  },

  // Stats
  contributors: {
    hmong: "Cov neeg koom tes",
    english: "Contributors",
    lao: "ຜູ້ຮ່ວມບັນທຶກ",
    thai: "ผู้ร่วมบันทึก",
  },
  totalRecordings: {
    hmong: "Tag nrho suab",
    english: "Total Recordings",
    lao: "ສຽງທັງໝົດ",
    thai: "เสียงทั้งหมด",
  },
  progress: {
    hmong: "Kev vam meej",
    english: "Progress",
    lao: "ຄວາມຄືບໜ້າ",
    thai: "ความคืบหน้า",
  },

  // Recording Card
  recordYourVoice: {
    hmong: "Sau koj lub suab",
    english: "Record Your Voice",
    lao: "ບັນທຶກສຽງຂອງເຈົ້າ",
    thai: "บันทึกเสียงของคุณ",
  },
  readPhraseBelowAndRecord: {
    hmong: "Nyeem cov lus hauv qab thiab nias sau suab",
    english: "Read the phrase below and press record",
    lao: "ອ່ານປະໂຫຍກຂ້າງລຸ່ມນີ້ແລ້ວກົດບັນທຶກ",
    thai: "อ่านประโยคด้านล่างแล้วกดบันทึก",
  },
  phraseOf: {
    hmong: "Lo lus",
    english: "Phrase",
    lao: "ປະໂຫຍກ",
    thai: "ประโยค",
  },
  of: {
    hmong: "ntawm",
    english: "of",
    lao: "ຈາກ",
    thai: "จาก",
  },

  // Recording Controls
  recording: {
    hmong: "Tabtom sau suab... nias kom nres thaum nyeem tiav",
    english: "Recording... Press stop when finished",
    lao: "ກຳລັງບັນທຶກ... ກົດຢຸດເມື່ອອ່ານແລ້ວ",
    thai: "กำลังบันทึก... กดหยุดเมื่ออ่านเสร็จ",
  },
  listenSendOrReRecord: {
    hmong: "Mloog ➜ Xa ➜ Los yog Sau dua",
    english: "Listen ➜ Send ➜ Or Re-record",
    lao: "ຟັງ ➜ ສົ່ງ ➜ ຫຼື ບັນທຶກໃໝ່",
    thai: "ฟัง ➜ ส่ง ➜ หรือ บันทึกใหม่",
  },
  pressMicToStart: {
    hmong: "Nias lub microphone los pib sau suab",
    english: "Press the microphone button to start recording",
    lao: "ກົດປຸ່ມໄມເພື່ອເລີ່ມບັນທຶກ",
    thai: "กดปุ่มไมค์เพื่อเริ่มบันทึก",
  },
  skipPhrase: {
    hmong: "Hla lo lus no",
    english: "Skip this phrase",
    lao: "ຂ້າມປະໂຫຍກນີ້",
    thai: "ข้ามประโยคนี้",
  },

  // Footer
  footerMessage: {
    hmong: "Koj lub suab yuav pab txhim kho technology lus Hmoob",
    english: "Your recordings will help develop Hmong language technology",
    lao: "ສຽງທີ່ບັນທຶກຈະຊ່ອຍພັດທະນາເຕັກໂນໂລຊີພາສາມົ້ງ",
    thai: "เสียงที่บันทึกจะช่วยพัฒนาเทคโนโลยีภาษาม้ง",
  },
  thankYou: {
    hmong: "Ua tsaug uas koj pab txuag peb hom lus 💚",
    english: "Thank you for helping preserve our language 💚",
    lao: "ຂອບໃຈທີ່ຮ່ວມອະນຸລັກພາສາຂອງພວກເຮົາ 💚",
    thai: "ขอบคุณที่ร่วมอนุรักษ์ภาษาของเรา 💚",
  },

  // Mic permission error
  micPermissionError: {
    hmong: "Tsis tau kev tso cai siv microphone. Thov tso cai siv.",
    english: "Cannot access microphone. Please allow microphone access.",
    lao: "ບໍ່ສາມາດເຂົ້າເຖິງໄມໂຄຣໂຟນໄດ້. ກະລຸນາອະນຸຍາດການໃຊ້ໄມ.",
    thai: "ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้ไมค์",
  },

  // Authentication
  loginTitle: {
    hmong: "Nkag mus rau hauv",
    english: "Sign In",
    lao: "ເຂົ້າສູ່ລະບົບ",
    thai: "เข้าสู่ระบบ",
  },
  loginDescription: {
    hmong: "Nkag mus siv Google txhawm rau sau suab",
    english: "Sign in with Google to start recording",
    lao: "ເຂົ້າສູ່ລະບົບດ້ວຍ Google ເພື່ອເລີ່ມບັນທຶກສຽງ",
    thai: "เข้าสู่ระบบด้วย Google เพื่อเริ่มบันทึกเสียง",
  },
  signInWithGoogle: {
    hmong: "Nkag mus nrog Google",
    english: "Sign in with Google",
    lao: "ເຂົ້າສູ່ລະບົບດ້ວຍ Google",
    thai: "เข้าสู่ระบบด้วย Google",
  },
  loginAgreement: {
    hmong: "Thaum nkag mus, koj pom zoo rau peb cov lus cog tseg",
    english: "By signing in, you agree to our terms of service",
    lao: "ໂດຍການເຂົ້າສູ່ລະບົບ, ເຈົ້າຍອมຮັບເງື່ອນໄຂການໃຊ້ງານ",
    thai: "การเข้าสู่ระบบถือว่าคุณยอมรับเงื่อนไขการใช้งาน",
  },
  loginRequired: {
    hmong: "Thov nkag mus ua ntej sau suab",
    english: "Please sign in to record",
    lao: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນບັນທຶກສຽງ",
    thai: "กรุณาเข้าสู่ระบบก่อนบันทึกเสียง",
  },
  profile: {
    hmong: "Tus Account",
    english: "Profile",
    lao: "ໂປຣໄຟລ",
    thai: "โปรไฟล์",
  },
  logout: {
    hmong: "Tawm mus",
    english: "Sign Out",
    lao: "ອອກຈາກລະບົບ",
    thai: "ออกจากระบบ",
  },

  // Profile
  myProfile: {
    hmong: "Kuv Tus Account",
    english: "My Profile",
    lao: "ໂປຣໄຟລຂອງຂ້ອຍ",
    thai: "โปรไฟล์ของฉัน",
  },
  email: {
    hmong: "Email",
    english: "Email",
    lao: "ອີເມວ",
    thai: "อีเมล",
  },
  joinDate: {
    hmong: "Hnub koom",
    english: "Joined Date",
    lao: "ວັນທີເຂົ້າຮ່ວມ",
    thai: "วันที่เข้าร่วม",
  },
  myStats: {
    hmong: "Kuv Li Stats",
    english: "My Statistics",
    lao: "ສະຖິຕິຂອງຂ້ອຍ",
    thai: "สถิติของฉัน",
  },
  backToHome: {
    hmong: "Rov qab mus tsev",
    english: "Back to Home",
    lao: "ກັບຄືນໜ້າຫຼັກ",
    thai: "กลับหน้าหลัก",
  },

  // 404 Page
  pageNotFound: {
    hmong: "Nplooj ntawv tsis pom",
    english: "Page Not Found",
    lao: "ບໍ່ພົບໜ້າທີ່ຕ້ອງການ",
    thai: "ไม่พบหน้าที่ต้องการ",
  },
  pageNotFoundDesc: {
    hmong: "Thov txim, nplooj ntawv koj nrhiav tsis muaj nyob ntawm no lawm.",
    english: "Sorry, the page you are looking for does not exist.",
    lao: "ຂໍໂທດ, ໜ້າທີ່ເຈົ້າກຳລັງຊອກຫາບໍ່ມີຢູ່ໃນລະບົບ.",
    thai: "ขอโทษ, หน้าที่คุณกำลังค้นหาไม่มีอยู่ในระบบ",
  },

  // Phrase Creation
  createCustomPhrase: {
    hmong: "Sau lo lus tshiab",
    english: "Create Custom Phrase",
    lao: "ສ້າງປະໂຫຍກໃໝ່",
    thai: "สร้างประโยคใหม่",
  },
  createCustomPhraseDesc: {
    hmong: "Sau lo lus Hmoob uas koj xav kawm",
    english: "Enter a Hmong phrase you want to learn",
    lao: "ປ້ອນປະໂຫຍກມົ້ງທີ່ເຈົ້າຕ້ອງການບັນທຶກ",
    thai: "ป้อนประโยคม้งที่คุณต้องการบันทึก",
  },
  hmongPhrase: {
    hmong: "Lo lus Hmoob",
    english: "Hmong Phrase",
    lao: "ປະໂຫຍກມົ້ງ",
    thai: "ประโยคม้ง",
  },
  englishMeaning: {
    hmong: "Lus txhais ua lus Askiv",
    english: "English Meaning",
    lao: "ຄວາມໝາຍພາສາອັງກິດ",
    thai: "ความหมายภาษาอังกฤษ",
  },
  laoMeaning: {
    hmong: "Lus txhais ua lus Nplog",
    english: "Lao Meaning",
    lao: "ຄວາມໝາຍພາສາລາວ",
    thai: "ความหมายภาษาลาว",
  },
  thaiMeaning: {
    hmong: "Lus txhais ua lus Thai",
    english: "Thai Meaning",
    lao: "ຄວາມໝາຍພາສາໄທ",
    thai: "ความหมายภาษาไทย",
  },
  cancel: {
    hmong: "Thim rov qab",
    english: "Cancel",
    lao: "ຍົກເລີກ",
    thai: "ยกเลิก",
  },
  addPhrase: {
    hmong: "Ntxiv lo lus",
    english: "Add Phrase",
    lao: "ເພີ່ມປະໂຫຍກ",
    thai: "เพิ่มประโยค",
  },
  generateWithAI: {
    hmong: "Tsim nrog AI",
    english: "Generate with AI",
    lao: "ສ້າງດ້ວຍ AI",
    thai: "สร้างด้วย AI",
  },
  clearPhrases: {
    hmong: "Rho tawm cov lus",
    english: "Clear Phrases",
    lao: "ລ້າງປະໂຫຍກ",
    thai: "ล้างประโยค",
  },
  generateWithAIDesc: {
    hmong: "Siv AI los tsim lo lus Hmoob tshiab",
    english: "Use AI to generate new Hmong phrases",
    lao: "ໃຊ້ AI ສ້າງປະໂຫຍກມົ້ງໃໝ່",
    thai: "ใช้ AI สร้างประโยคม้งใหม่",
  },
  selectAIProvider: {
    hmong: "Xaiv AI",
    english: "Select AI Provider",
    lao: "ເລືອກ AI",
    thai: "เลือก AI",
  },
  topic: {
    hmong: "Lub ntsiab lus",
    english: "Topic",
    lao: "ຫົວຂໍ້",
    thai: "หัวข้อ",
  },
  topicPlaceholder: {
    hmong: "piv txwv: tsev neeg, zaub mov, hnub so",
    english: "e.g., family, food, holidays",
    lao: "ເຊັ່ນ: ຄອບຄົວ, ອາຫານ, ວັນພັກ",
    thai: "เช่น: ครอบครัว, อาหาร, วันหยุด",
  },
  numberOfPhrases: {
    hmong: "Pes tsawg lo lus",
    english: "Number of Phrases",
    lao: "ຈຳນວນປະໂຫຍກ",
    thai: "จำนวนประโยค",
  },
  phrases: {
    hmong: "lo lus",
    english: "phrases",
    lao: "ປະໂຫຍກ",
    thai: "ประโยค",
  },
  generatedPhrases: {
    hmong: "Cov lus tsim tau",
    english: "Generated Phrases",
    lao: "ປະໂຫຍກທີ່ສ້າງແລ້ວ",
    thai: "ประโยคที่สร้างแล้ว",
  },
  addAllPhrases: {
    hmong: "Ntxiv tag nrho",
    english: "Add All Phrases",
    lao: "ເພີ່ມທັງໝົດ",
    thai: "เพิ่มทั้งหมด",
  },
  generating: {
    hmong: "Tabtom tsim...",
    english: "Generating...",
    lao: "ກຳລັງສ້າງ...",
    thai: "กำลังสร้าง...",
  },
  generate: {
    hmong: "Tsim",
    english: "Generate",
    lao: "ສ້າງ",
    thai: "สร้าง",
  },
};

// Font families for each language
export const fontFamilies: Record<Language, string> = {
  hmong: "'Open Sans', sans-serif",
  english: "'Noto Sans', sans-serif",
  lao: "'Noto Sans Lao Looped', sans-serif",
  thai: "'Noto Sans Thai Looped', sans-serif",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  fontFamily: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("lao");

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  const fontFamily = fontFamilies[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, fontFamily }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
