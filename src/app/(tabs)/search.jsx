import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Search,
  X,
  Star,
  Film,
  Tv,
  TrendingUp,
  Clock,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 48) / 2;
const CARD_H = CARD_W * 1.5;

const C = {
  bg: "#07071a",
  surface: "#0d0d22",
  card: "#111127",
  border: "#1e1e3f",
  primary: "#8b5cf6",
  primaryGlow: "rgba(139,92,246,0.15)",
  pink: "#ec4899",
  gold: "#f59e0b",
  text: "#e8e5ff",
  muted: "#8885b0",
  mutedDark: "#4b4870",
};

const TRENDING_SEARCHES = [
  "Attack on Titan",
  "Breaking Bad",
  "Oppenheimer",
  "Squid Game",
  "The Bear",
  "Interstellar",
  "Succession",
  "One Piece",
  "Dune",
  "Wednesday",
  "Arcane",
  "Severance",
  "The Last of Us",
  "Shogun",
];

const QUICK_CATEGORIES = [
  {
    label: "🔥 Trending",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    url: "/api/tmdb/trending?media_type=all&time_window=week",
  },
  {
    label: "🎬 New Movies",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    url: "/api/tmdb/discover?type=movie&sort=primary_release_date.desc&min_votes=100",
  },
  {
    label: "📺 Top Shows",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    url: "/api/tmdb/discover?type=tv&sort=vote_average.desc&min_votes=200",
  },
  {
    label: "⛩️ Anime",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    url: "/api/tmdb/discover?type=tv&genre=16&language=ja&sort=popularity.desc&min_votes=50",
  },
  {
    label: "🇰🇷 K-Drama",
    color: "#FF6B9D",
    bg: "rgba(255,107,157,0.12)",
    url: "/api/tmdb/discover?type=tv&language=ko&sort=popularity.desc&min_votes=30",
  },
  {
    label: "👑 Award Winners",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    url: "/api/tmdb/discover?type=movie&sort=vote_average.desc&min_votes=1000&vote_average_gte=8",
  },
  {
    label: "🎭 Drama",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    url: "/api/tmdb/discover?type=tv&genre=18&sort=vote_average.desc&min_votes=200",
  },
  {
    label: "🚀 Sci-Fi",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    url: "/api/tmdb/discover?type=movie&genre=878&sort=popularity.desc&min_votes=100",
  },
];

function ResultCard({ item, onPress }) {
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const type = item.media_type || (item.title ? "movie" : "tv");
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
        borderColor: C.border,
      }}
    >
      <View style={{ height: CARD_H, backgroundColor: "#1a1a35" }}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {type === "movie" ? (
              <Film size={32} color={C.mutedDark} />
            ) : (
              <Tv size={32} color={C.mutedDark} />
            )}
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(7,7,26,0.9)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
          }}
        />
        {rating && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              backgroundColor: "rgba(0,0,0,0.72)",
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
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor:
              type === "movie"
                ? "rgba(139,92,246,0.8)"
                : "rgba(236,72,153,0.8)",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>
            {type === "movie" ? "MOVIE" : "TV"}
          </Text>
        </View>
      </View>
      <View style={{ padding: 9 }}>
        <Text
          numberOfLines={2}
          style={{
            color: C.text,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
          }}
        >
          {item.title || item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      setResults(
        (data.results || []).filter(
          (r) => r.media_type !== "person" && r.poster_path,
        ),
      );
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(val), 450);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleItemPress = (item) => {
    Keyboard.dismiss();
    const type = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${type}/${item.id}`);
  };

  const handleQuickCat = async (cat) => {
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setQuery("");
    try {
      const res = await fetch(cat.url);
      const data = await res.json();
      setResults((data.results || []).filter((r) => r.poster_path));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item, index }) => (
    <View
      style={{
        marginLeft: index % 2 === 0 ? 16 : 8,
        marginRight: index % 2 === 1 ? 16 : 8,
      }}
    >
      <ResultCard item={item} onPress={handleItemPress} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            color: C.text,
            fontSize: 22,
            fontWeight: "900",
            marginBottom: 12,
            letterSpacing: -0.5,
          }}
        >
          Discover 🔍
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: C.surface,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: focused ? C.primary : C.border,
            paddingHorizontal: 14,
            gap: 10,
            shadowColor: focused ? C.primary : "transparent",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        >
          <Search size={18} color={focused ? C.primary : C.mutedDark} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Movies, shows, anime..."
            placeholderTextColor={C.mutedDark}
            style={{
              flex: 1,
              color: C.text,
              fontSize: 15,
              paddingVertical: 13,
              fontWeight: "500",
            }}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query)}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={17} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!searched && !loading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <TrendingUp size={13} color={C.primary} />
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>
                Quick Picks
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {QUICK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => handleQuickCat(cat)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 20,
                    backgroundColor: cat.bg,
                    borderWidth: 1,
                    borderColor: cat.color + "40",
                  }}
                >
                  <Text
                    style={{
                      color: cat.color,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <Clock size={13} color={C.muted} />
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>
                Trending Searches
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TRENDING_SEARCHES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setQuery(s);
                    performSearch(s);
                  }}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderWidth: 1,
                    borderColor: C.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <TrendingUp size={10} color={C.mutedDark} />
                  <Text
                    style={{ color: C.muted, fontSize: 12, fontWeight: "500" }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={{ color: C.muted, fontSize: 13 }}>Searching... 🐾</Text>
        </View>
      ) : results.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 52 }}>🙀</Text>
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
            The cat looked everywhere but couldn't find anything. Try a
            different title.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderCard}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 6,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{ color: C.primary, fontSize: 13, fontWeight: "700" }}
              >
                {results.length} results
              </Text>
              {query && (
                <Text style={{ color: C.mutedDark, fontSize: 13 }}>
                  for "{query}"
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
