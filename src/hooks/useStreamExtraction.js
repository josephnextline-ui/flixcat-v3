import { useState, useEffect, useRef, useCallback } from "react";

export function useStreamExtraction(providerIdx, season, episode, player) {
  const [extractionState, setExtractionState] = useState("extracting");
  const [extractedUrl, setExtractedUrl] = useState(null);
  const [extractReferer, setExtractReferer] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [selectedSubtitleIdx, setSelectedSubtitleIdx] = useState(null);
  const extractionTimer = useRef(null);

  useEffect(() => {
    try {
      player.pause();
    } catch (e) {}
    setExtractedUrl(null);
    setExtractReferer(null);
    setExtractionState("extracting");
    setSubtitles([]);
    setSelectedSubtitleIdx(null);
    if (extractionTimer.current) clearTimeout(extractionTimer.current);
    extractionTimer.current = setTimeout(() => {
      setExtractionState((prev) => (prev === "extracting" ? "failed" : prev));
    }, 20000);
    return () => {
      if (extractionTimer.current) clearTimeout(extractionTimer.current);
    };
  }, [providerIdx, season, episode]);

  const handleExtraction = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "VIDEO_URL" && data.url) {
        if (extractionTimer.current) clearTimeout(extractionTimer.current);
        setExtractedUrl(data.url);
        setExtractReferer(data.referer || null);
        setExtractionState("success");
      } else if (data.type === "SUBTITLE_URL" && data.url) {
        setSubtitles((prev) => {
          if (prev.some((s) => s.url === data.url)) return prev;
          const next = [
            ...prev,
            {
              url: data.url,
              language: data.language || "en",
              label: data.label || "English",
            },
          ];
          const enIdx = next.findIndex((s) => s.language === "en");
          if (enIdx !== -1) setSelectedSubtitleIdx(enIdx);
          return next;
        });
      }
    } catch (e) {}
  }, []);

  return {
    extractionState,
    extractedUrl,
    extractReferer,
    subtitles,
    selectedSubtitleIdx,
    setSelectedSubtitleIdx,
    handleExtraction,
  };
}
