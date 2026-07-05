export type VoiceOption = {
  id: string;
  label: string;
  speaker: string;
  word: string;
};

export const VOICES: VoiceOption[] = [
  { id: "electronic", label: "電子的な声", speaker: "54", word: "電子的な声です" },
  { id: "cool", label: "冷静な声", speaker: "47", word: "冷静な声" },
  { id: "child", label: "雨晴はう", speaker: "10", word: "雨晴はうの音声ライブラリを用いて生成した音声" },
  { id: "low", label: "低音な声", speaker: "13", word: "低音な声" },
  { id: "warm", label: "あたたかい声", speaker: "24", word: "あたたかい声" },
];

export const DEFAULT_VOICE = VOICES[0];

export function getVoiceOption(voiceId?: string | null): VoiceOption {
  return VOICES.find((voice) => voice.id === voiceId) ?? DEFAULT_VOICE;
}

export function getSpeakerForVoice(voiceId?: string | null): string {
  return getVoiceOption(voiceId).speaker;
}
