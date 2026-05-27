import { useState, useEffect, memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Star,
  Film,
  Tv,
  SlidersHorizontal,
  Shuffle,
} from "lucide-react-native";
import { CATEGORY_MAP } from "@/data/categories";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 48) / 2;
const CARD_H = CARD_W * 1.5;

const C = {
  bg: "#07071a",
  surface: "#0d0d22",
  card: "#111127",
  border: "#1e1e3f",
  primary: "#8b5cf6",
  pink: "#ec4899",
  gold: "#f59e0b",
  text: "#e8e5ff",
  muted: "#8885b0",
  mutedDark: "#4b4870",
};

const SORT_OPTIONS = [
  { id: "popularity.desc", label: "🔥 Popular" },
  { id: "vote_average.desc", label: "👑 Top Rated" },
  { id: "primary_release_date.desc", label: "🆕 Newest" },
  { id: "vote_count.desc", label: "📈 Most Voted" },
];

const RATING_FILTERS = [
  { id: "", label: "Any" },
  { id: "6", label: "6+" },
  { id: "7", label: "7+" },
  { id: "8", label: "8+" },
  { id: "9", label: "9+ 🐾" },
];

function Chip({ label, active, accent, onPress }) {
  const color = accent || C.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 20,
        marginRight: 7,
        backgroundColor: active ? color : "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: active ? color : C.border,
        shadowColor: active ? color : "transparent",
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

// Memoised card
const ContentCard = memo(function ContentCard({ item, onPress, accent }) {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const isPurrfect = item.vote_average >= 9;
  const isMovie =
    item.media_type === "movie" || item.type === "movie" || item.title;

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
        borderColor: isPurrfect ? `${accent}70` : C.border,
        // no shadow — cheaper in long lists
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
        {/* Simple dim overlay instead of LinearGradient */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            backgroundColor: "rgba(7,7,26,0.55)",
          }}
        />
        {isPurrfect && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: `${accent}CC`,
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
        {(item.release_date || item.first_air_date) && (
          <Text style={{ color: C.mutedDark, fontSize: 10 }}>
            {(item.release_date || item.first_air_date || "").split("-")[0]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function CategoryPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const category = CATEGORY_MAP[slug];

  const [sort, setSort] = useState(category?.params?.sort || "popularity.desc");
  const [minRating, setMinRating] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const accent = category?.accent || C.primary;

  const buildUrl = (p = 1) => {
    if (!category) return null;
    const { params } = category;
    const ps = new URLSearchParams({
      type: params.type,
      sort,
      page: String(p),
      min_votes: params.min_votes || "20",
    });
    if (params.genre) ps.set("genre", params.genre);
    if (params.language) ps.set("language", params.language);
    if (params.with_keywords) ps.set("with_keywords", params.with_keywords);
    if (minRating) ps.set("vote_average_gte", minRating);
    return `/api/tmdb/discover?${ps.toString()}`;
  };

  const fetchContent = async (p = 1, append = false) => {
    const url = buildUrl(p);
    if (!url) return;
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      const items = (data.results || []).filter((r) => r.poster_path);
      setTotalResults(data.total_results || 0);
      setTotalPages(data.total_pages || 1);
      if (append) setResults((prev) => [...prev, ...items]);
      else setResults(items);
    } catch (e) {
      console.error("category fetch error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchContent(1, false);
  }, [slug, sort, minRating]);

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchContent(next, true);
  };

  const handleShuffle = () => {
    if (results.length === 0) return;
    const item = results[Math.floor(Math.random() * results.length)];
    const type = category?.params?.type || (item.title ? "movie" : "tv");
    router.push(`/details/${type}/${item.id}`);
  };

  const handleItemPress = useCallback(
    (item) => {
      const type =
        item.media_type ||
        category?.params?.type ||
        (item.title ? "movie" : "tv");
      router.push(`/details/${type}/${item.id}`);
    },
    [category],
  );

  const renderCard = useCallback(
    ({ item, index }) => (
      <View
        style={{
          marginLeft: index % 2 === 0 ? 16 : 8,
          marginRight: index % 2 === 1 ? 16 : 8,
        }}
      >
        <ContentCard item={item} onPress={handleItemPress} accent={accent} />
      </View>
    ),
    [handleItemPress, accent],
  );

  if (!category) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 48 }}>😿</Text>
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: "700",
            marginTop: 12,
          }}
        >
          Category not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, padding: 14 }}
        >
          <Text style={{ color: accent, fontSize: 14, fontWeight: "600" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />

      {/* ── Hero Header ── */}
      <View style={{ position: "relative", paddingBottom: 0 }}>
        <LinearGradient
          colors={[...category.gradient, C.bg]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          {/* Back + action row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <ArrowLeft size={18} color="#fff" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={handleShuffle}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Shuffle size={13} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  Shuffle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterOpen(!filterOpen)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: filterOpen
                    ? `${accent}30`
                    : "rgba(0,0,0,0.4)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: filterOpen
                    ? `${accent}60`
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <SlidersHorizontal
                  size={13}
                  color={filterOpen ? accent : "#fff"}
                />
                <Text
                  style={{
                    color: filterOpen ? accent : "#fff",
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  Sort
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: `${accent}20`,
                borderWidth: 1.5,
                borderColor: `${accent}40`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 30 }}>{category.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: -0.5,
                  marginBottom: 4,
                }}
              >
                {category.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                {category.subtitle}
              </Text>
              {totalResults > 0 && (
                <Text
                  style={{
                    color: `${accent}CC`,
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {totalResults.toLocaleString()} titles
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* ── Sort & Filter Panel ── */}
      {filterOpen && (
        <View
          style={{
            backgroundColor: C.surface,
            borderBottomWidth: 1,
            borderColor: C.border,
            paddingVertical: 12,
          }}
        >
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
            SORT BY
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 12 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                label={opt.label}
                active={sort === opt.id}
                accent={accent}
                onPress={() => setSort(opt.id)}
              />
            ))}
          </ScrollView>

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
            MIN RATING
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {RATING_FILTERS.map((opt) => (
              <Chip
                key={opt.id}
                label={opt.label}
                active={minRating === opt.id}
                accent={accent}
                onPress={() => setMinRating(minRating === opt.id ? "" : opt.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Results Grid ── */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ActivityIndicator color={accent} size="large" />
          <Text style={{ color: C.muted, fontSize: 14 }}>
            Loading {category.emoji}...
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
            Try adjusting the sort or rating filters
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
            paddingBottom: insets.bottom + 30,
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
            length: CARD_H + 14 + 44,
            offset: (CARD_H + 14 + 44) * Math.floor(index / 2),
            index,
          })}
        />
      )}
    </View>
  );
}
