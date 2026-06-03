import { NextRequest, NextResponse } from "next/server";

import { synthesizeVoice } from "@/app/lib/config/voicevox";

type AudioRequestBody = {
  speaker?: string;
  text?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { text, speaker } = (await req.json()) as AudioRequestBody;
    
    // if news description is too long
    
    if (!text || !speaker) {
      return NextResponse.json(
        { error: "Both text and speaker are required." },
        { status: 400 },
      );
    }
    
    // send raw audio file directly to the client
    const safeText = text.length > 200 ? text?.slice(0, 200) : text;
    const audioBuffer = await synthesizeVoice(safeText, speaker);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/wav",
      }
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "VoiceVox server is not running." },
          { status: 503 },
        );
      }

      if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "Speaker ID not found." },
          { status: 404 },
        );
      }
    }

    console.error("Failed to synthesize voice preview:", error);
    return NextResponse.json(
      { error: "Failed to generate audio preview." },
      { status: 500 },
    );
  }
}
