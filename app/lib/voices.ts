export type VoiceOption = {
  id: string;
  label: string;
  speaker: string;
  word: string;
};

export const VOICES: VoiceOption[] = [
  {
    id: "clam",
    label: "雨晴はう",
    speaker: "10",
    word: "あめはれはうです",
  },
  { 
    id: "cool", 
    label: "冷静な声", 
    speaker: "47", 
    word: "冷静な声" 
  },
  {
    id: "mature",
    label: "もち子さん",
    speaker: "20",
    word: "もち子さんです",
  },
  { 
    id: "low", 
    label: "低音な声", 
    speaker: "13", 
    word: "青山龍星です" 
  },
  { 
    id: "warm", 
    label: "あたたかい声", 
    speaker: "24", 
    word: "あたたかい声" 
  },
];

export const DEFAULT_VOICE = VOICES[0];

export function getVoiceOption(voiceId?: string | null): VoiceOption {
  return VOICES.find((voice) => voice.id === voiceId) ?? DEFAULT_VOICE;
}

export function getSpeakerForVoice(voiceId?: string | null): string {
  return getVoiceOption(voiceId).speaker;
}
