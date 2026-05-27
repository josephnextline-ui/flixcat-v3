import { useState, useEffect, useRef } from "react";
import { parseSubtitleFile } from "@/utils/subtitleParser";

export function useSubtitleSync(selectedSubtitleIdx, subtitles, player) {
  const subtitleCues = useRef([]);
  const subtitlePollRef = useRef(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    subtitleCues.current = [];
    setCurrentSubtitle("");
    if (selectedSubtitleIdx === null || !subtitles[selectedSubtitleIdx]) return;
    const { url } = subtitles[selectedSubtitleIdx];
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("subtitle fetch failed");
        return r.text();
      })
      .then((raw) => {
        subtitleCues.current = parseSubtitleFile(raw);
      })
      .catch((e) => console.warn("subtitle parse error:", e));
  }, [selectedSubtitleIdx, subtitles]);

  useEffect(() => {
    if (subtitlePollRef.current) clearInterval(subtitlePollRef.current);
    if (selectedSubtitleIdx === null) {
      setCurrentSubtitle("");
      return;
    }
    subtitlePollRef.current = setInterval(() => {
      try {
        const t = player.currentTime;
        const cue = subtitleCues.current.find(
          (c) => t >= c.start && t <= c.end,
        );
        setCurrentSubtitle(cue ? cue.text : "");
      } catch (e) {}
    }, 200);
    return () => {
      if (subtitlePollRef.current) clearInterval(subtitlePollRef.current);
    };
  }, [selectedSubtitleIdx]);

  return currentSubtitle;
}
