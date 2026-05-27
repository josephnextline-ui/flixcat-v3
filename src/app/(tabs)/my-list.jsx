import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Film,
  Tv,
  Heart,
  Play,
  Compass,
  Grid2X2,
  List,
  ArrowUpDown,
} from "lucide-react-native";
import { getWatchlist, removeFromWatchlist } from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const C = {
  bg: "#07071a",
  surface: "#0d0d22",
  card: "#111127",
  border: "#1e1e3f",
  primary: "#8b5cf6",
  primaryGlow: "rgba(139,92,246,0.15)",
  pink: "#ec4899",
  gold: "#f59e0b",
  green: "#10b981",
  text: "#e8e5ff",
  muted: "#8885b0",
  mutedDark: "#4b4870",
};

export default function MyListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [typeFilter, setTypeFilter] = useState("all"); // all | movie | tv
  const [sortMode, setSortMode] = useState("recent"); // recent | az | type

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, []),
  );

  const loadWatchlist = async () => {
    const items = await getWatchlist();
    setWatchlist(items);
  };

  const handleRemove = async (item) => {
    await removeFromWatchlist(item.content_id, item.content_type);
    loadWatchlist();
  };

  const filtered = watchlist
    .filter((item) => typeFilter === "all" || item.content_type === typeFilter)
    .sort((a, b) => {
      if (sortMode === "az")
        return (a.title || "").localeCompare(b.title || "");
      if (sortMode === "type")
        return (a.content_type || "").localeCompare(b.content_type || "");
      return 0; // recent = original order
    });

  const movieCount = watchlist.filter((i) => i.content_type === "movie").length;
  const tvCount = watchlist.filter((i) => i.content_type === "tv").length;

  const CARD_W =
    viewMode === "grid" ? (SCREEN_WIDTH - 48) / 2 : SCREEN_WIDTH - 32;
  const CARD_H = viewMode === "grid" ? CARD_W * 1.5 : 96;

  const renderGridItem = ({ item, index }) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push(`/details/${item.content_type}/${item.content_id}`)
        }
        activeOpacity={0.82}
        style={{
          width: CARD_W,
          marginBottom: 14,
          marginLeft: index % 2 === 0 ? 16 : 8,
          marginRight: index % 2 === 1 ? 16 : 8,
        }}
      >
        <View
          style={{
            width: CARD_W,
            height: CARD_H,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            marginBottom: 8,
          }}
        >
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item.content_type === "movie" ? (
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
              height: 70,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "rgba(139,92,246,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Play size={12} color="#fff" fill="#fff" />
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: "rgba(0,0,0,0.72)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <X size={12} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text
          numberOfLines={2}
          style={{
            color: C.text,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
            marginBottom: 3,
          }}
        >
          {item.title}
        </Text>
        <View
          style={{
            backgroundColor:
              item.content_type === "movie"
                ? "rgba(139,92,246,0.12)"
                : "rgba(236,72,153,0.12)",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor:
              item.content_type === "movie"
                ? "rgba(139,92,246,0.2)"
                : "rgba(236,72,153,0.2)",
          }}
        >
          <Text
            style={{
              color: item.content_type === "movie" ? C.primary : C.pink,
              fontSize: 9,
              fontWeight: "700",
            }}
          >
            {item.content_type === "movie" ? "MOVIE" : "TV"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w154${item.poster_path}`
      : null;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push(`/details/${item.content_type}/${item.content_id}`)
        }
        activeOpacity={0.82}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          marginBottom: 10,
          backgroundColor: C.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.border,
          overflow: "hidden",
        }}
      >
        <View style={{ width: 64, height: 96, backgroundColor: "#1a1a35" }}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item.content_type === "movie" ? (
                <Film size={20} color={C.mutedDark} />
              ) : (
                <Tv size={20} color={C.mutedDark} />
              )}
            </View>
          )}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text
            numberOfLines={2}
            style={{
              color: C.text,
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
              marginBottom: 6,
            }}
          >
            {item.title}
          </Text>
          <View
            style={{
              backgroundColor:
                item.content_type === "movie"
                  ? "rgba(139,92,246,0.12)"
                  : "rgba(236,72,153,0.12)",
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 6,
              alignSelf: "flex-start",
              borderWidth: 1,
              borderColor:
                item.content_type === "movie"
                  ? "rgba(139,92,246,0.2)"
                  : "rgba(236,72,153,0.2)",
            }}
          >
            <Text
              style={{
                color: item.content_type === "movie" ? C.primary : C.pink,
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              {item.content_type === "movie" ? "MOVIE" : "TV SHOW"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, paddingRight: 12 }}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/watch/${item.content_type}/${item.content_id}`)
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: C.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Play size={13} color="#fff" fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.06)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <X size={13} color={C.muted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: C.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
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
              My Stash 🐾
            </Text>
            <Text style={{ color: C.mutedDark, fontSize: 12, marginTop: 1 }}>
              {watchlist.length > 0
                ? `${movieCount} movies · ${tvCount} shows`
                : "Nothing saved yet"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {/* Sort */}
            <TouchableOpacity
              onPress={() =>
                setSortMode((s) =>
                  s === "recent" ? "az" : s === "az" ? "type" : "recent",
                )
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: C.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowUpDown size={15} color={C.muted} />
            </TouchableOpacity>
            {/* View mode */}
            <TouchableOpacity
              onPress={() =>
                setViewMode((v) => (v === "grid" ? "list" : "grid"))
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(139,92,246,0.1)",
                borderWidth: 1,
                borderColor: "rgba(139,92,246,0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {viewMode === "grid" ? (
                <List size={15} color={C.primary} />
              ) : (
                <Grid2X2 size={15} color={C.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Type filter */}
        {watchlist.length > 0 && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              ["all", "✨ All"],
              ["movie", "🎬 Movies"],
              ["tv", "📺 Shows"],
            ].map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setTypeFilter(id)}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor:
                    typeFilter === id ? C.primary : "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: typeFilter === id ? C.primary : C.border,
                }}
              >
                <Text
                  style={{
                    color: typeFilter === id ? "#fff" : C.muted,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            {sortMode !== "recent" && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(245,158,11,0.25)",
                }}
              >
                <Text
                  style={{ color: C.gold, fontSize: 11, fontWeight: "600" }}
                >
                  {sortMode === "az" ? "A–Z" : "By Type"}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Empty state */}
      {watchlist.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 56, marginBottom: 12 }}>😿</Text>
          <Text
            style={{
              color: C.text,
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 8,
            }}
          >
            Stash is empty
          </Text>
          <Text
            style={{
              color: C.muted,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
              marginBottom: 24,
            }}
          >
            Browse movies and shows, then tap the bookmark button to save them
            here for later
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/browse")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: C.primary,
              paddingHorizontal: 24,
              paddingVertical: 13,
              borderRadius: 25,
            }}
          >
            <Compass size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
              Explore Content
            </Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 40 }}>🐱</Text>
          <Text style={{ color: C.muted, fontSize: 14, marginTop: 10 }}>
            No {typeFilter === "movie" ? "movies" : "shows"} in your stash
          </Text>
        </View>
      ) : viewMode === "grid" ? (
        <FlatList
          data={filtered}
          renderItem={renderGridItem}
          keyExtractor={(item, i) => `${item.content_id}-${i}`}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderListItem}
          keyExtractor={(item, i) => `${item.content_id}-${i}`}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
