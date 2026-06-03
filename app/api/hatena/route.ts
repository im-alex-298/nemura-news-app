import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export const dynamic = 'force-dynamic'; // ← add this

export async function GET(req: Request) {
    try {
        
        const type = new URL(req.url).searchParams.get("type") || "popular";

        // Fetch RSS on the server (no CORS issues)
        const rssURL = type === "new" ? 'https://b.hatena.ne.jp/hotentry/it.rss' : 'https://b.hatena.ne.jp/hotentry/all.rss';

        const res = await fetch(rssURL, {
            headers: { "User-Agent": "Mozilla/5.0" },
        })

        const xmlData = await res.text();

        // Parse XML to JS object
        const jsonData = await parseStringPromise(xmlData, { explicitArray: false });
        
        const items = jsonData?.rdf?.item || jsonData?.["rdf:RDF"]?.item || [];

        return NextResponse.json(items);
    } catch (error) {
        console.error("RSS fetch failed:", error);
        return NextResponse.json({ error: "Failed to fetch RSS" }, { status: 500 });
    }
}

