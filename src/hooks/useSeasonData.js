import { useState, useEffect } from "react";

export function useSeasonData(id, season, type) {
  const [seasonData, setSeasonData] = useState(null);

  useEffect(() => {
    if (type === "tv" && id) {
      fetchSeasonData();
    }
  }, [season, id, type]);

  const fetchSeasonData = async () => {
    try {
      const res = await fetch(`/api/tmdb/tv/season?id=${id}&season=${season}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSeasonData(data);
    } catch (err) {
      console.error("fetchSeasonData error:", err);
    }
  };

  return seasonData;
}
