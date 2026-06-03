// lib/audio.ts
export async function playAudio(text: string, speaker: any): Promise<void> {
  const response = await fetch("/api/audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, speaker }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch audio from /api/audio.");
  }

  // route.ts now returns binary directly, so we can use it as a blob
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  const revokeObjectUrl = () => URL.revokeObjectURL(audioUrl);
  audio.addEventListener("ended", revokeObjectUrl, { once: true });
  audio.addEventListener("error", revokeObjectUrl, { once: true });

  audio.volume = 1;
  await audio.play();
}
