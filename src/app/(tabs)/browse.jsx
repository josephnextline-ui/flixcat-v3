import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  SlidersHorizontal,
  Shuffle,
  Star,
  Film,
  Tv,
  X,
} from "lucide-react-native";
import { CATEGORIES } from "@/data/categories";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 48) / 2;
const CARD_H = CARD_W * 1.5;

const C = {
  bg: "#07071a",
  surface: "#0d0d22",
  card: "#111127",
  border: "#1e1e3f",
  primary: "#8b5cf6",
  primaryGlow: "rgba(139,92,246,0.18)",
  pink: "#ec4899",
  gold: "#f59e0b",
  text: "#e8e5ff",
  muted: "#8885b0",
  mutedDark: "#4b4870",
};

const TYPES = [
  { id: "all", label: "✨ All" },
  { id: "movie", label: "🎬 Movie" },
  { id: "tv", label: "📺 TV Show" },
  { id: "anime", label: "⛩️ Anime" },
];
const SORTS = [
  { id: "popularity.desc", label: "🔥 Popular" },
  { id: "vote_average.desc", label: "👑 Top Rated" },
  { id: "primary_release_date.desc", label: "🆕 Newest" },
  { id: "vote_count.desc", label: "📈 Most Voted" },
];
const DECADES = [
  { id: "", label: "Any" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2020s", label: "2020s" },
  { id: "2010s", label: "2010s" },
  { id: "2000s", label: "2000s" },
  { id: "classic", label: "Classic" },
];
const LANGUAGES = [
  { id: "", label: "🌍 Any" },
  { id: "en", label: "🇺🇸 EN" },
  { id: "ko", label: "🇰🇷 KR" },
  { id: "ja", label: "🇯🇵 JP" },
  { id: "es", label: "🇪🇸 ES" },
  { id: "hi", label: "🇮🇳 HI" },
  { id: "fr", label: "🇫🇷 FR" },
  { id: "ar", label: "🇸🇦 AR" },
  { id: "zh", label: "🇨🇳 ZH" },
  { id: "pt", label: "🇧🇷 PT" },
];
const RATINGS = [
  { id: "", label: "Any" },
  { id: "6", label: "6+ ⭐" },
  { id: "7", label: "7+ ⭐" },
  { id: "8", label: "8+ ⭐" },
  { id: "9", label: "9+ 🐾" },
];
const GENRES = [
  { id: "28", label: "Action" },
  { id: "12", label: "Adventure" },
  { id: "16", label: "Animation" },
  { id: "35", label: "Comedy" },
  { id: "80", label: "Crime" },
  { id: "99", label: "Documentary" },
  { id: "18", label: "Drama" },
  { id: "10751", label: "Family" },
  { id: "14", label: "Fantasy" },
  { id: "36", label: "History" },
  { id: "27", label: "Horror" },
  { id: "10402", label: "Music" },
  { id: "9648", label: "Mystery" },
  { id: "10749", label: "Romance" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
  { id: "10752", label: "War" },
  { id: "37", label: "Western" },
];

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 20,
        marginRight: 7,
        backgroundColor: active ? C.primary : "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: active ? C.primary : C.border,
        shadowColor: active ? C.primary : "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: active ? 0.5 : 0,
        shadowRadius: 6,
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : C.muted,
          fontSize: 12,
          fontWeight: active ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterSection({
  label,
  options,
  value,
  onSelect,
  allowDeselect = true,
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: C.mutedDark,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1,
          marginBottom: 8,
          paddingHorizontal: 16,
        }}
      >
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {options.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            active={value === opt.id}
            onPress={() =>
              onSelect(allowDeselect && value === opt.id ? "" : opt.id)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ContentCard({ item, onPress }) {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const isPurrfect = item.vote_average >= 9;
  const isMovie = item.media_type === "movie";
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      style={{
        width: CARD_W,
        marginBottom: 14,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: isPurrfect ? "rgba(139,92,246,0.45)" : C.border,
        // Removed shadow — too expensive in a long list
      }}
    >
      <View style={{ height: CARD_H, backgroundColor: "#1a1a35" }}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
            recyclingKey={posterUrl}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {isMovie ? (
              <Film size={32} color={C.mutedDark} />
            ) : (
              <Tv size={32} color={C.mutedDark} />
            )}
          </View>
        )}
        {/* Simple dark overlay instead of LinearGradient */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            backgroundColor: "rgba(7,7,26,0.6)",
          }}
        />
        {isPurrfect && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "rgba(139,92,246,0.85)",
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Text style={{ fontSize: 9 }}>🐾</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 9,
                fontWeight: "800",
                letterSpacing: 0.5,
              }}
            >
              PURR-FECT
            </Text>
          </View>
        )}
        {rating && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              backgroundColor: "rgba(0,0,0,0.7)",
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Star size={9} color={C.gold} fill={C.gold} />
            <Text style={{ color: C.gold, fontSize: 10, fontWeight: "700" }}>
              {rating}
            </Text>
          </View>
        )}
      </View>
      <View style={{ padding: 9 }}>
        <Text
          numberOfLines={2}
          style={{
            color: C.text,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
            marginBottom: 4,
          }}
        >
          {item.title || item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View
            style={{
              backgroundColor: isMovie
                ? "rgba(139,92,246,0.12)"
                : "rgba(236,72,153,0.12)",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: isMovie
                ? "rgba(139,92,246,0.2)"
                : "rgba(236,72,153,0.2)",
            }}
          >
            <Text
              style={{
                color: isMovie ? C.primary : C.pink,
                fontSize: 9,
                fontWeight: "700",
              }}
            >
              {isMovie ? "MOVIE" : "TV"}
            </Text>
          </View>
          {(item.release_date || item.first_air_date) && (
            <Text style={{ color: C.mutedDark, fontSize: 10 }}>
              {(item.release_date || item.first_air_date).split("-")[0]}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("popularity.desc");
  const [genre, setGenre] = useState("");
  const [decade, setDecade] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const activeFilters =
    [genre, decade, language, minRating].filter(Boolean).length +
    (type !== "all" ? 1 : 0) +
    (sort !== "popularity.desc" ? 1 : 0);

  const buildQs = (mediaType, p) => {
    const ps = new URLSearchParams({
      type: mediaType,
      sort,
      page: String(p),
      min_votes: minRating ? "100" : "20",
    });
    const g = type === "anime" ? genre || "16" : genre;
    if (g) ps.set("genre", g);
    const lang = type === "anime" ? language || "ja" : language;
    if (lang) ps.set("language", lang);
    if (minRating) ps.set("vote_average_gte", minRating);
    if (decade === "2024") {
      ps.set("year_start", "2024");
      ps.set("year_end", "2024");
    } else if (decade === "2023") {
      ps.set("year_start", "2023");
      ps.set("year_end", "2023");
    } else if (decade === "2020s") {
      ps.set("year_start", "2020");
      ps.set("year_end", "2029");
    } else if (decade === "2010s") {
      ps.set("year_start", "2010");
      ps.set("year_end", "2019");
    } else if (decade === "2000s") {
      ps.set("year_start", "2000");
      ps.set("year_end", "2009");
    } else if (decade === "classic") {
      ps.set("year_start", "1900");
      ps.set("year_end", "1999");
    }
    return ps.toString();
  };

  const fetchResults = async (p = 1, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      let allItems = [],
        total = 0,
        pages = 1;
      const extraQs = `${genre ? `&genre=${genre}` : ""}${language ? `&language=${language}` : ""}${minRating ? `&vote_average_gte=${minRating}` : ""}`;
      if (type === "all") {
        const [movRes, tvRes] = await Promise.all([
          fetch(
            `/api/tmdb/discover?type=movie&sort=${sort}&page=${p}&min_votes=30${extraQs}`,
          ).then((r) => r.json()),
          fetch(
            `/api/tmdb/discover?type=tv&sort=${sort}&page=${p}&min_votes=30${extraQs}`,
          ).then((r) => r.json()),
        ]);
        const movs = (movRes.results || []).filter((r) => r.poster_path);
        const tvs = (tvRes.results || []).filter((r) => r.poster_path);
        const maxLen = Math.max(movs.length, tvs.length);
        for (let i = 0; i < maxLen; i++) {
          if (movs[i]) allItems.push(movs[i]);
          if (tvs[i]) allItems.push(tvs[i]);
        }
        total = (movRes.total_results || 0) + (tvRes.total_results || 0);
        pages = Math.max(movRes.total_pages || 1, tvRes.total_pages || 1);
      } else {
        const mediaType = type === "anime" ? "tv" : type;
        const res = await fetch(`/api/tmdb/discover?${buildQs(mediaType, p)}`);
        const data = await res.json();
        allItems = (data.results || []).filter((r) => r.poster_path);
        total = data.total_results || 0;
        pages = data.total_pages || 1;
      }
      setTotalResults(total);
      setTotalPages(pages);
      if (append) setResults((prev) => [...prev, ...allItems]);
      else setResults(allItems);
    } catch (e) {
      console.error("browse fetch error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchResults(1, false);
  }, [type, sort, genre, decade, language, minRating]);

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchResults(next, true);
  };

  const handleShuffle = () => {
    if (results.length === 0) return;
    const item = results[Math.floor(Math.random() * results.length)];
    const t = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${t}/${item.id}`);
  };

  const handleItemPress = (item) => {
    const t = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${t}/${item.id}`);
  };

  const renderCard = ({ item, index }) => (
    <View
      style={{
        marginLeft: index % 2 === 0 ? 16 : 8,
        marginRight: index % 2 === 1 ? 16 : 8,
      }}
    >
      <ContentCard item={item} onPress={handleItemPress} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: C.bg,
          borderBottomWidth: 1,
          borderColor: C.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: C.text,
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: -0.5,
              }}
            >
              Explore 🐾
            </Text>
            <Text style={{ color: C.mutedDark, fontSize: 12, marginTop: 1 }}>
              {totalResults > 0
                ? `${totalResults.toLocaleString()} titles`
                : "Browse the universe"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={handleShuffle}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(236,72,153,0.12)",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(236,72,153,0.25)",
              }}
            >
              <Shuffle size={13} color={C.pink} />
              <Text style={{ color: C.pink, fontSize: 11, fontWeight: "700" }}>
                Shuffle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFiltersOpen(!filtersOpen)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: filtersOpen
                  ? C.primaryGlow
                  : "rgba(255,255,255,0.04)",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: filtersOpen ? C.primary : C.border,
              }}
            >
              <SlidersHorizontal
                size={13}
                color={filtersOpen ? C.primary : C.muted}
              />
              <Text
                style={{
                  color: filtersOpen ? C.primary : C.muted,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Filters
              </Text>
              {activeFilters > 0 && (
                <View
                  style={{
                    backgroundColor: C.primary,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: -2,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}
                  >
                    {activeFilters}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Panel */}
      {filtersOpen && (
        <View
          style={{
            backgroundColor: C.surface,
            borderBottomWidth: 1,
            borderColor: C.border,
            paddingTop: 14,
            paddingBottom: 8,
          }}
        >
          <FilterSection
            label="TYPE"
            options={TYPES}
            value={type}
            onSelect={setType}
            allowDeselect={false}
          />
          <FilterSection
            label="SORT BY"
            options={SORTS}
            value={sort}
            onSelect={setSort}
            allowDeselect={false}
          />

          {/* Genre with "All" chip */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: C.mutedDark,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1,
                marginBottom: 8,
                paddingHorizontal: 16,
              }}
            >
              GENRE
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              <Chip
                label="All"
                active={genre === ""}
                onPress={() => setGenre("")}
              />
              {GENRES.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  active={genre === opt.id}
                  onPress={() => setGenre(genre === opt.id ? "" : opt.id)}
                />
              ))}
            </ScrollView>
          </View>

          <FilterSection
            label="DECADE"
            options={DECADES}
            value={decade}
            onSelect={setDecade}
          />
          <FilterSection
            label="LANGUAGE"
            options={LANGUAGES}
            value={language}
            onSelect={setLanguage}
          />
          <FilterSection
            label="MIN RATING"
            options={RATINGS}
            value={minRating}
            onSelect={setMinRating}
          />

          {activeFilters > 0 && (
            <TouchableOpacity
              onPress={() => {
                setType("all");
                setSort("popularity.desc");
                setGenre("");
                setDecade("");
                setLanguage("");
                setMinRating("");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                alignSelf: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginTop: 4,
                marginBottom: 8,
                backgroundColor: "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <X size={12} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 12, fontWeight: "600" }}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Specialty Channels strip — only when filter panel is closed */}
      {!filtersOpen && (
        <View
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: C.border,
            backgroundColor: C.surface,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                onPress={() => router.push(`/category/${cat.slug}`)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: `${cat.accent}14`,
                  borderWidth: 1,
                  borderColor: `${cat.accent}35`,
                }}
              >
                <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
                <Text
                  style={{
                    color: cat.accent,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={{ color: C.muted, fontSize: 14 }}>
            Fetching streams... 🐾
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 48 }}>😿</Text>
          <Text
            style={{
              color: C.text,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Nothing found
          </Text>
          <Text
            style={{
              color: C.muted,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            Try adjusting your filters — the cat didn't find what you're looking
            for
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderCard}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={60}
          windowSize={7}
          getItemLayout={(_, index) => ({
            length: CARD_H + 14 + 52,
            offset: (CARD_H + 14 + 52) * Math.floor(index / 2),
            index,
          })}
        />
      )}
    </View>
  );
}
