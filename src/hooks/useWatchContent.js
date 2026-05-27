import { useState, useEffect } from "react";
import {
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/utils/watchlist";
import { saveToWatchHistory } from "@/utils/watchHistory";

export function useWatchContent(id, type, params) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (id && type) {
      fetchContent();
      isInWatchlist(parseInt(id), type).then(setInWatchlist);
    }
  }, [id, type]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/tmdb/details/${type}/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContent(data);
      saveToWatchHistory({
        id: parseInt(id),
        type,
        title: data.title || data.name,
        poster_path: data.poster_path || null,
        backdrop_path: data.backdrop_path || null,
        season: type === "tv" ? parseInt(params.season) || 1 : null,
        episode: type === "tv" ? parseInt(params.episode) || 1 : null,
        genre_ids: (data.genres || []).map((g) => g.id),
      });
    } catch (err) {
      console.error("fetchContent error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (inWatchlist) {
      await removeFromWatchlist(parseInt(id), type);
      setInWatchlist(false);
    } else {
      await addToWatchlist({
        content_id: parseInt(id),
        content_type: type,
        title: content?.title || content?.name,
        poster_path: content?.poster_path,
      });
      setInWatchlist(true);
    }
  };

  return { content, loading, inWatchlist, toggleWatchlist };
}
