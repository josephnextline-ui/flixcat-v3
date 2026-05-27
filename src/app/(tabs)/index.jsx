import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Play,
  Clapperboard,
  Tv,
  Globe,
  Swords,
  Star,
  Info,
  ChevronRight,
  History,
  Sparkles,
  X,
  Bell,
  Shuffle,
} from "lucide-react-native";
import {
  getContinueWatching,
  getTopGenres,
  removeFromContinueWatching,
} from "@/utils/watchHistory";
import { MOODS, PORTAL_CATEGORIES, CATEGORY_MAP } from "@/data/categories";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 116;
const CARD_HEIGHT = 174;
const CW_CARD_W = 160;
const CW_CARD_H = 95;
const PORTAL_W = (SCREEN_WIDTH - 40) / 2;

// ─────────────────────────────────────────────────────────
// Memoised card for ContentRow — avoids re-render on scroll
// ─────────────────────────────────────────────────────────
const ContentCard = memo(({ item, onPress }) => {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const type = item.media_type || (item.title ? "movie" : "tv");

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.82}
      style={{ width: CARD_WIDTH, marginRight: 10 }}
    >
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#1a1a35",
          marginBottom: 6,
        }}
      >
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
            {type === "movie" ? (
              <Clapperboard size={28} color="#374151" />
            ) : (
              <Tv size={28} color="#374151" />
            )}
          </View>
        )}
        {/* Dim overlay instead of LinearGradient — cheaper */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 50,
            backgroundColor: "transparent",
          }}
        />
        {rating && (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              backgroundColor: "rgba(0,0,0,0.75)",
              paddingHorizontal: 5,
              paddingVertical: 2,
              borderRadius: 5,
            }}
          >
            <Star size={9} color="#fbbf24" fill="#fbbf24" />
            <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700" }}>
              {rating}
            </Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={2}
        style={{
          color: "#d1d5db",
          fontSize: 12,
          fontWeight: "500",
          lineHeight: 16,
        }}
      >
        {item.title || item.name}
      </Text>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────
// ContentRow — memoised, uses FlatList horizontally
// ─────────────────────────────────────────────────────────
const ContentRow = memo(
  ({ label, icon: Icon, iconColor = "#8b5cf6", items, onPress, onSeeAll }) => {
    const sliced = useMemo(() => (items || []).slice(0, 12), [items]);
    if (!items || items.length === 0) return null;
    return (
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {Icon && <Icon size={14} color={iconColor} />}
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              {label}
            </Text>
          </View>
          {onSeeAll ? (
            <TouchableOpacity
              onPress={onSeeAll}
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Text
                style={{ color: "#8b5cf6", fontSize: 12, fontWeight: "600" }}
              >
                See all
              </Text>
              <ChevronRight size={12} color="#8b5cf6" />
            </TouchableOpacity>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Text style={{ color: "#4b5563", fontSize: 12 }}>See all</Text>
              <ChevronRight size={12} color="#4b5563" />
            </View>
          )}
        </View>
        <FlatList
          data={sliced}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ContentCard item={item} onPress={onPress} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + 10,
            offset: (CARD_WIDTH + 10) * index,
            index,
          })}
        />
      </View>
    );
  },
);

// ─────────────────────────────────────────────────────────
// ContinueWatchingRow
// ─────────────────────────────────────────────────────────
const CwCard = memo(({ item, onPress, onRemove }) => {
  const posterUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
    : item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.82}
      style={{ width: CW_CARD_W, marginRight: 10 }}
    >
      <View
        style={{
          width: CW_CARD_W,
          height: CW_CARD_H,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#1a1a35",
          marginBottom: 6,
        }}
      >
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
            <Tv size={24} color="#374151" />
          </View>
        )}
        <View
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: "rgba(139,92,246,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Play size={12} color="#fff" fill="#fff" />
        </View>
        <TouchableOpacity
          onPress={() => onRemove(item.id, item.type)}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <X size={11} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text
        numberOfLines={1}
        style={{ color: "#d1d5db", fontSize: 12, fontWeight: "500" }}
      >
        {item.title}
      </Text>
      {item.season && (
        <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>
          S{item.season} · E{item.episode}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const ContinueWatchingRow = memo(({ items, onPress, onRemove }) => {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <History size={14} color="#8b5cf6" />
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
          Continue Watching
        </Text>
      </View>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(item) => `${item.id}-${item.type}`}
        renderItem={({ item }) => (
          <CwCard item={item} onPress={onPress} onRemove={onRemove} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        getItemLayout={(_, index) => ({
          length: CW_CARD_W + 10,
          offset: (CW_CARD_W + 10) * index,
          index,
        })}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// MoodPicker — static, never re-renders
// ─────────────────────────────────────────────────────────
const MoodPicker = memo(({ onSelect }) => (
  <View style={{ marginBottom: 24 }}>
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
        What's your vibe? 🐾
      </Text>
      <Text style={{ color: "#4b4870", fontSize: 12, marginTop: 2 }}>
        Pick a mood and we'll pick for you
      </Text>
    </View>
    <FlatList
      data={MOODS}
      horizontal
      keyExtractor={(m) => m.id}
      renderItem={({ item: m }) => (
        <TouchableOpacity
          onPress={() => onSelect(m.slug)}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 22,
            marginRight: 8,
            backgroundColor: "rgba(139,92,246,0.08)",
            borderWidth: 1,
            borderColor: "rgba(139,92,246,0.22)",
          }}
        >
          <Text style={{ color: "#c4b5fd", fontSize: 13, fontWeight: "700" }}>
            {m.label}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews
    />
  </View>
));

// ─────────────────────────────────────────────────────────
// CategoryPortals
// ─────────────────────────────────────────────────────────
const PortalCard = memo(({ cat, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(cat.slug)}
    activeOpacity={0.82}
    style={{
      width: PORTAL_W,
      height: 88,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: `${cat.accent}30`,
    }}
  >
    <LinearGradient
      colors={[...cat.gradient, "#07071a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, padding: 14, justifyContent: "space-between" }}
    >
      <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
      <View>
        <Text
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: "800",
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {cat.title}
        </Text>
        <Text
          style={{
            color: `${cat.accent}CC`,
            fontSize: 10,
            fontWeight: "600",
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {cat.subtitle}
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

const CategoryPortals = memo(({ onPress }) => {
  const portals = useMemo(
    () => PORTAL_CATEGORIES.map((slug) => CATEGORY_MAP[slug]).filter(Boolean),
    [],
  );
  return (
    <View style={{ marginBottom: 26 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
          Specialty Channels ✨
        </Text>
        <TouchableOpacity
          onPress={() => onPress("_browse")}
          style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
        >
          <Text style={{ color: "#4b4870", fontSize: 12 }}>Browse all</Text>
          <ChevronRight size={12} color="#4b4870" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        {portals.map((cat) => (
          <PortalCard key={cat.slug} cat={cat} onPress={onPress} />
        ))}
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Top10Row
// ─────────────────────────────────────────────────────────
const Top10Card = memo(({ item, idx, onPress }) => {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
    : null;
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.82}
      style={{
        width: 110,
        flexDirection: "row",
        alignItems: "flex-end",
        marginRight: 2,
      }}
    >
      <Text
        style={{
          color: idx === 0 ? "#f59e0b" : idx <= 2 ? "#8885b0" : "#1e1e3f",
          fontSize: 72,
          fontWeight: "900",
          lineHeight: 80,
          marginRight: -10,
          zIndex: 2,
          letterSpacing: -4,
        }}
      >
        {idx + 1}
      </Text>
      <View
        style={{
          width: 72,
          height: 106,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#1a1a35",
          borderWidth: 1,
          borderColor: idx === 0 ? "rgba(245,158,11,0.4)" : "#1e1e3f",
        }}
      >
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
            <Tv size={22} color="#4b4870" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const Top10Row = memo(({ items, onPress }) => {
  const top10 = useMemo(() => (items || []).slice(0, 10), [items]);
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 26 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: "#f59e0b",
            fontSize: 18,
            fontWeight: "900",
            letterSpacing: -0.5,
          }}
        >
          TOP 10
        </Text>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
          This Week 🔥
        </Text>
      </View>
      <FlatList
        data={top10}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <Top10Card item={item} idx={index} onPress={onPress} />
        )}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={5}
        getItemLayout={(_, index) => ({
          length: 112,
          offset: 112 * index,
          index,
        })}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// HeroSection — isolated so interval ticks DON'T bubble up
// ─────────────────────────────────────────────────────────
const HeroSection = memo(
  ({ heroPool, onPlay, onInfo, onShuffle, insetTop }) => {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
      if (heroPool.length < 2) return;
      const t = setInterval(
        () => setIdx((i) => (i + 1) % Math.min(heroPool.length, 8)),
        8000,
      );
      return () => clearInterval(t);
    }, [heroPool]);

    const hero = heroPool[idx];
    if (!hero) return null;

    // Use w1280 instead of original — ~5-8× smaller file
    const backdropUrl = hero.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${hero.backdrop_path}`
      : null;
    const heroTitle = hero.title || hero.name || "";
    const heroRating = hero.vote_average ? hero.vote_average.toFixed(1) : null;
    const heroType = hero.media_type || (hero.title ? "movie" : "tv");

    return (
      <View style={{ height: 520, marginBottom: 24 }}>
        {backdropUrl && (
          <Image
            source={{ uri: backdropUrl }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            contentFit="cover"
            transition={400}
            recyclingKey={backdropUrl}
          />
        )}
        <LinearGradient
          colors={[
            "rgba(10,10,10,0.28)",
            "rgba(10,10,10,0.0)",
            "rgba(10,10,10,0.95)",
          ]}
          locations={[0, 0.42, 1]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: insetTop + 8,
          }}
        >
          <Text
            style={{
              color: "#8b5cf6",
              fontSize: 22,
              fontWeight: "900",
              letterSpacing: -0.5,
            }}
          >
            FlixCat 🐾
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onShuffle}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(139,92,246,0.12)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(139,92,246,0.25)",
              }}
            >
              <Shuffle size={16} color="#8b5cf6" />
            </TouchableOpacity>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.08)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Bell size={18} color="#fff" />
            </View>
          </View>
        </View>

        {/* Bottom */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(255,255,255,0.12)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              {heroType === "movie" ? (
                <Clapperboard size={10} color="#d1d5db" />
              ) : (
                <Tv size={10} color="#d1d5db" />
              )}
              <Text
                style={{ color: "#d1d5db", fontSize: 10, fontWeight: "700" }}
              >
                {heroType === "movie" ? "MOVIE" : "TV SHOW"}
              </Text>
            </View>
            {heroRating && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                  backgroundColor: "rgba(251,191,36,0.12)",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Star size={10} color="#fbbf24" fill="#fbbf24" />
                <Text
                  style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700" }}
                >
                  {heroRating}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "800",
              marginBottom: 14,
              letterSpacing: -0.5,
            }}
            numberOfLines={2}
          >
            {heroTitle}
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => onPlay(hero)}
              activeOpacity={0.85}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#8b5cf6",
                paddingVertical: 13,
                borderRadius: 10,
              }}
            >
              <Play size={16} color="#fff" fill="#fff" />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                Play Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onInfo(hero)}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.12)",
                paddingVertical: 13,
                paddingHorizontal: 18,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Info size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                Info
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dots */}
        {heroPool.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 130,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {heroPool.slice(0, 8).map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIdx(i)}
                style={{
                  width: i === idx ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    i === idx ? "#8b5cf6" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
);

// ─────────────────────────────────────────────────────────
// Section list data — FlatList as outer scroll for virtualization
// ─────────────────────────────────────────────────────────
const SECTION_KEYS = [
  "hero",
  "continueWatching",
  "moods",
  "portals",
  "top10",
  "recommended",
  "movies",
  "tv",
  "korean",
  "koreanFantasy",
  "fantasy",
  "magical",
  "drama",
  "footer",
];

// ─────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [heroPool, setHeroPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState([]);
  const [recommended, setRecommended] = useState([]);

  // Rows loaded in two waves for perceived speed
  const [wave1, setWave1] = useState({ trending: [], movies: [], tv: [] });
  const [wave2, setWave2] = useState({
    korean: [],
    koreanFantasy: [],
    fantasy: [],
    magical: [],
    drama: [],
  });

  // ── Focus: reload continue watching ──
  useFocusEffect(
    useCallback(() => {
      loadLocalData();
    }, []),
  );

  const loadLocalData = async () => {
    const cw = await getContinueWatching();
    setContinueWatching(cw);
    const topGenres = await getTopGenres(3);
    if (topGenres.length > 0) {
      try {
        const genre = topGenres[0];
        const type =
          topGenres.length > 1 && parseInt(topGenres[1]) % 2 === 0
            ? "tv"
            : "movie";
        const res = await fetch(
          `/api/tmdb/discover?type=${type}&genre=${genre}&sort=vote_average.desc&min_votes=100&page=1`,
        );
        if (res.ok) {
          const d = await res.json();
          const cwIds = new Set(cw.map((i) => i.id));
          setRecommended(
            (d.results || [])
              .filter((r) => r.poster_path && !cwIds.has(r.id))
              .slice(0, 12),
          );
        }
      } catch (e) {
        console.warn("recommendations error:", e);
      }
    }
  };

  // ── Wave 1: hero + popular — highest priority ──
  useEffect(() => {
    let cancelled = false;
    const fetchWave1 = async () => {
      try {
        const [trendRes, movRes, tvRes] = await Promise.all([
          fetch("/api/tmdb/trending?media_type=all&time_window=week").then(
            (r) => r.json(),
          ),
          fetch("/api/tmdb/movies/popular").then((r) => r.json()),
          fetch("/api/tmdb/tv/popular").then((r) => r.json()),
        ]);
        if (cancelled) return;
        const pool = (trendRes.results || []).filter((r) => r.backdrop_path);
        setHeroPool(pool);
        setWave1({
          trending: (trendRes.results || [])
            .filter((x) => x.poster_path)
            .slice(0, 12),
          movies: (movRes.results || [])
            .filter((x) => x.poster_path)
            .slice(0, 12),
          tv: (tvRes.results || []).filter((x) => x.poster_path).slice(0, 12),
        });
        setLoading(false);
        // Kick off wave 2 after a short delay so UI is responsive first
        setTimeout(() => {
          if (!cancelled) fetchWave2();
        }, 400);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    };
    fetchWave1();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Wave 2: specialty rows ──
  const fetchWave2 = async () => {
    try {
      const disc = (type, params = "") =>
        fetch(`/api/tmdb/discover?type=${type}${params}`)
          .then((r) => r.json())
          .then((d) =>
            (d.results || []).filter((x) => x.poster_path).slice(0, 12),
          );

      // Group into 3 parallel batches to limit concurrency
      const [koreanTV, koreanMov, koreanFantasyTV] = await Promise.all([
        disc("tv", "&language=ko&genre=18&min_votes=20&sort=vote_average.desc"),
        disc(
          "movie",
          "&language=ko&genre=18&min_votes=20&sort=vote_average.desc",
        ),
        disc("tv", "&language=ko&genre=14&min_votes=20&sort=vote_average.desc"),
      ]);

      const [koreanFantasyMov, fantasyMov, fantasyTV] = await Promise.all([
        disc(
          "movie",
          "&language=ko&genre=14&min_votes=20&sort=vote_average.desc",
        ),
        disc("movie", "&genre=14&min_votes=100&sort=vote_average.desc"),
        disc("tv", "&genre=10765&min_votes=100&sort=vote_average.desc"),
      ]);

      const [magicalMov, dramaTV] = await Promise.all([
        disc(
          "movie",
          "&genre=14&min_votes=50&with_keywords=10364|4379|4370&sort=vote_average.desc",
        ),
        disc("tv", "&genre=18&sort=vote_average.desc&min_votes=100"),
      ]);

      setWave2({
        korean: [...koreanTV.slice(0, 8), ...koreanMov.slice(0, 6)],
        koreanFantasy: [
          ...koreanFantasyTV.slice(0, 8),
          ...koreanFantasyMov.slice(0, 6),
        ],
        fantasy: [...fantasyMov.slice(0, 8), ...fantasyTV.slice(0, 6)],
        magical: magicalMov,
        drama: dramaTV,
      });
    } catch (err) {
      console.error("wave2 error:", err);
    }
  };

  // ── Stable callbacks ──
  const handleItemPress = useCallback((item) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${type}/${item.id}`);
  }, []);

  const handleCategoryPress = useCallback((slug) => {
    if (slug === "_browse") router.push("/(tabs)/browse");
    else router.push(`/category/${slug}`);
  }, []);

  const handleMoodPress = useCallback((slug) => {
    router.push(`/category/${slug}`);
  }, []);

  const handleHeroPlay = useCallback((hero) => {
    const type = hero.media_type || (hero.title ? "movie" : "tv");
    router.push(`/watch/${type}/${hero.id}`);
  }, []);

  const handleHeroInfo = useCallback((hero) => {
    const type = hero.media_type || (hero.title ? "movie" : "tv");
    router.push(`/details/${type}/${hero.id}`);
  }, []);

  const handleHeroShuffle = useCallback(() => {
    if (heroPool.length === 0) return;
    const rand = heroPool[Math.floor(Math.random() * heroPool.length)];
    const t = rand.media_type || (rand.title ? "movie" : "tv");
    router.push(`/details/${t}/${rand.id}`);
  }, [heroPool]);

  const handleRemoveCW = useCallback(async (id, type) => {
    await removeFromContinueWatching(id, type);
    setContinueWatching((prev) =>
      prev.filter((i) => !(i.id === id && i.type === type)),
    );
  }, []);

  const handleCWPress = useCallback((item) => {
    if (item.type === "tv" && item.season) {
      router.push(
        `/watch/${item.type}/${item.id}?season=${item.season}&episode=${item.episode || 1}`,
      );
    } else {
      router.push(`/watch/${item.type}/${item.id}`);
    }
  }, []);

  // ── FlatList section renderer ──
  const renderSection = useCallback(
    ({ item: key }) => {
      switch (key) {
        case "hero":
          return (
            <HeroSection
              heroPool={heroPool}
              onPlay={handleHeroPlay}
              onInfo={handleHeroInfo}
              onShuffle={handleHeroShuffle}
              insetTop={insets.top}
            />
          );
        case "continueWatching":
          return (
            <ContinueWatchingRow
              items={continueWatching}
              onPress={handleCWPress}
              onRemove={handleRemoveCW}
            />
          );
        case "moods":
          return <MoodPicker onSelect={handleMoodPress} />;
        case "portals":
          return <CategoryPortals onPress={handleCategoryPress} />;
        case "top10":
          return <Top10Row items={wave1.trending} onPress={handleItemPress} />;
        case "recommended":
          return recommended.length > 0 ? (
            <ContentRow
              label="Recommended For You"
              icon={Sparkles}
              iconColor="#a855f7"
              items={recommended}
              onPress={handleItemPress}
            />
          ) : null;
        case "movies":
          return (
            <ContentRow
              label="Popular Movies"
              icon={Clapperboard}
              items={wave1.movies}
              onPress={handleItemPress}
            />
          );
        case "tv":
          return (
            <ContentRow
              label="Popular TV Shows"
              icon={Tv}
              iconColor="#3b82f6"
              items={wave1.tv}
              onPress={handleItemPress}
            />
          );
        case "korean":
          return (
            <ContentRow
              label="Korean Dramas 🇰🇷"
              icon={Globe}
              iconColor="#FF6B9D"
              items={wave2.korean}
              onPress={handleItemPress}
              onSeeAll={() => router.push("/category/korean-drama-series")}
            />
          );
        case "koreanFantasy":
          return (
            <ContentRow
              label="Korean Fantasy 🏯"
              icon={Sparkles}
              iconColor="#c084fc"
              items={wave2.koreanFantasy}
              onPress={handleItemPress}
              onSeeAll={() => router.push("/category/korean-fantasy-series")}
            />
          );
        case "fantasy":
          return (
            <ContentRow
              label="Fantasy & Magic ⚔️"
              icon={Swords}
              iconColor="#7c3aed"
              items={wave2.fantasy}
              onPress={handleItemPress}
              onSeeAll={() => router.push("/category/fantasy-movies")}
            />
          );
        case "magical":
          return (
            <ContentRow
              label="Magical Movies ✨"
              icon={Star}
              iconColor="#a78bfa"
              items={wave2.magical}
              onPress={handleItemPress}
              onSeeAll={() => router.push("/category/magical-movies")}
            />
          );
        case "drama":
          return (
            <ContentRow
              label="Top Drama 🎭"
              icon={Star}
              iconColor="#fbbf24"
              items={wave2.drama}
              onPress={handleItemPress}
              onSeeAll={() => router.push("/category/korean-drama-series")}
            />
          );
        case "footer":
          return <View style={{ height: insets.bottom + 80 }} />;
        default:
          return null;
      }
    },
    [
      heroPool,
      continueWatching,
      recommended,
      wave1,
      wave2,
      insets,
      handleItemPress,
      handleCategoryPress,
      handleMoodPress,
      handleHeroPlay,
      handleHeroInfo,
      handleHeroShuffle,
      handleCWPress,
      handleRemoveCW,
    ],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#07071a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator color="#8b5cf6" size="large" />
        <Text
          style={{
            color: "#8885b0",
            fontSize: 14,
            marginTop: 14,
            fontWeight: "500",
          }}
        >
          Fetching streams... 🐾
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#07071a" }}>
      <StatusBar style="light" />
      <FlatList
        data={SECTION_KEYS}
        keyExtractor={(key) => key}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        // Virtualize rows aggressively
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}
