// Subtitle parser: handles WebVTT and SRT
export function parseSubtitleFile(raw) {
  const cues = [];
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n");
  let i = 0;
  const TS_RE =
    /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/;
  const toSec = (h, m, s, ms) =>
    parseInt(h || 0, 10) * 3600 +
    parseInt(m, 10) * 60 +
    parseInt(s, 10) +
    parseInt(ms, 10) / 1000;
  while (i < lines.length) {
    const m = lines[i].trim().match(TS_RE);
    if (m) {
      const start = toSec(m[1], m[2], m[3], m[4]);
      const end = toSec(m[5], m[6], m[7], m[8]);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim());
        i++;
      }
      const cueText = textLines
        .join("\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      if (cueText) cues.push({ start, end, text: cueText });
    } else {
      i++;
    }
  }
  return cues;
}
