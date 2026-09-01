const MAX_CHARS_PER_REQUEST = 480;

function splitLongLine(line: string): string[] {
  if (line.length <= MAX_CHARS_PER_REQUEST) return [line];
  const words = line.split(" ");
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > MAX_CHARS_PER_REQUEST) {
      if (current) chunks.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function translateLine(line: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!line.trim()) return line;

  const chunks = splitLongLine(line);
  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const url = new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q", chunk);
      url.searchParams.set("langpair", `${sourceLang}|${targetLang}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("translation_failed");
      const json = await res.json();
      const translated = json?.responseData?.translatedText;
      if (typeof translated !== "string") throw new Error("translation_failed");
      return translated;
    })
  );
  return translatedChunks.join(" ");
}

/** Traduz um texto linha por linha (preserva a estrutura de linhas do markdown). */
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (sourceLang === targetLang) return text;

  const lines = text.split("\n");
  const translatedLines = await Promise.all(lines.map((line) => translateLine(line, sourceLang, targetLang)));
  return translatedLines.join("\n");
}
