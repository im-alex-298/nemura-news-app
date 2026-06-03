export const VOICEVOX_URL = process.env.VOICEVOX_URL;

// if there is no voicevox env
if( !VOICEVOX_URL ){
  throw new Error("VOICEVOX_URL environment variable is not defined.");
}

export async function synthesizeVoice(
  text: string,
  speaker: string,
): Promise<Buffer> {

  // fetch the audio query from VOICEVOX
  const queryResponse = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  // Check if the audio query request was successful
  if (!queryResponse.ok) {
    const errorText = await queryResponse.text();
    throw new Error(
      `Failed to create a VOICEVOX audio query: ${queryResponse.status} ${errorText}`,
    );
  }

  const audioQuery = await queryResponse.json();

  // fetch the synthesized audio from VOICEVOX
  const synthesisResponse = await fetch(
    `${VOICEVOX_URL}/synthesis?speaker=${speaker}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(audioQuery),
    },
  );

  if (!synthesisResponse.ok) {
    const errorText = await synthesisResponse.text();
    throw new Error(
      `Failed to synthesize VOICEVOX audio: ${synthesisResponse.status} ${errorText}`,
    );
  }

  return Buffer.from(await synthesisResponse.arrayBuffer());
}
