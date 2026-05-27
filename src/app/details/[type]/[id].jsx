import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  ChevronLeft,
  Clapperboard,
  Tv,
  Users,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
  Film,
  Heart,
} from "lucide-react-native";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DetailsScreen() {
  const { type, id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const [content, setContent] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [season, setSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [showAllOverview, setShowAllOverview] = useState(false);

  useEffect(() => {
    if (id && type) {
      fetchDetails();
      isInWatchlist(parseInt(id), type).then(setInList);
    }
  }, [id, type]);

  useEffect(() => {
    if (type === "tv" && id) {
      fetchSeasonData(season);
    }
  }, [season, id, type]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/tmdb/details/${type}/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContent(data);

      const simRes = await fetch(`/api/tmdb/similar?type=${type}&id=${id}`);
      const simData = await simRes.json();
      setSimilar(
        simData.results?.filter((r) => r.poster_path).slice(0, 12) || [],
      );
    } catch (err) {
      console.error("fetchDetails:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonData = async (s) => {
    setSeasonLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/season?id=${id}&season=${s}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSeasonData(data);
    } catch (err) {
      console.error("fetchSeasonData:", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const toggleList = async () => {
    if (inList) {
      await removeFromWatchlist(parseInt(id), type);
      setInList(false);
    } else {
      await addToWatchlist({
        content_id: parseInt(id),
        content_type: type,
        title: content.title || content.name,
        poster_path: content.poster_path,
      });
      setInList(true);
    }
  };

  const handlePlay = (s, e) => {
    if (type === "tv") {
      router.push(`/watch/${type}/${id}?season=${s || 1}&episode=${e || 1}`);
    } else {
      router.push(`/watch/${type}/${id}`);
    }
  };

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const opacity = Math.min(y / 200, 1);
    headerOpacity.setValue(opacity);
  };

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
        <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!content) return null;

  const title = content.title || content.name;
  const year =
    content.release_date?.split("-")[0] ||
    content.first_air_date?.split("-")[0];
  const rating = content.vote_average ? content.vote_average.toFixed(1) : null;
  const backdrop = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : null;
  const poster = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : null;
  const cast = content.credits?.cast?.slice(0, 15) || [];
  const isMovie = type === "movie";
  const totalSeasons = content.number_of_seasons || 0;
  const totalEpisodes = content.number_of_episodes || 0;
  const overview = content.overview || "";
  const overviewShort =
    overview.length > 200 ? overview.slice(0, 200) + "…" : overview;

  return (
    <View style={{ flex: 1, backgroundColor: "#07071a" }}>
      <StatusBar style="light" />

      {/* Floating header */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "#07071a",
          opacity: headerOpacity,
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: "#1e1e3f",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: "#fff",
            fontSize: 15,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 200,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <ChevronLeft size={20} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero backdrop */}
        <View style={{ height: 260, backgroundColor: "#111" }}>
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
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
              <Film size={48} color="#374151" />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "#0a0a0a"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
          />
        </View>

        {/* Poster + Info */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            marginTop: -60,
            marginBottom: 20,
            gap: 14,
          }}
        >
          {/* Poster */}
          {poster && (
            <View
              style={{
                width: 110,
                height: 165,
                borderRadius: 10,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#1a1a1a",
                flexShrink: 0,
              }}
            >
              <Image
                source={{ uri: poster }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
          )}

          {/* Info */}
          <View style={{ flex: 1, paddingTop: 60 }}>
            {/* Type pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(255,255,255,0.06)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                alignSelf: "flex-start",
                marginBottom: 6,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              {isMovie ? (
                <Clapperboard size={10} color="#9ca3af" />
              ) : (
                <Tv size={10} color="#9ca3af" />
              )}
              <Text
                style={{ color: "#9ca3af", fontSize: 10, fontWeight: "700" }}
              >
                {isMovie ? "MOVIE" : "TV SERIES"}
              </Text>
            </View>

            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "800",
                lineHeight: 22,
                letterSpacing: -0.3,
                marginBottom: 8,
              }}
              numberOfLines={3}
            >
              {title}
            </Text>

            {/* Meta pills */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {rating && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    backgroundColor: "rgba(251,191,36,0.1)",
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(251,191,36,0.2)",
                  }}
                >
                  <Star size={10} color="#fbbf24" fill="#fbbf24" />
                  <Text
                    style={{
                      color: "#fbbf24",
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {rating}
                  </Text>
                </View>
              )}
              {year && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Calendar size={10} color="#6b7280" />
                  <Text style={{ color: "#9ca3af", fontSize: 11 }}>{year}</Text>
                </View>
              )}
              {content.runtime > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Clock size={10} color="#6b7280" />
                  <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                    {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                  </Text>
                </View>
              )}
              {totalSeasons > 0 && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                    {totalSeasons}S · {totalEpisodes}E
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Genre chips */}
        {content.genres?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginBottom: 16 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {content.genres.map((g) => (
              <View
                key={g.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <Text
                  style={{ color: "#9ca3af", fontSize: 12, fontWeight: "500" }}
                >
                  {g.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Overview */}
        {overview.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Text style={{ color: "#9ca3af", fontSize: 14, lineHeight: 21 }}>
              {showAllOverview ? overview : overviewShort}
            </Text>
            {overview.length > 200 && (
              <TouchableOpacity
                onPress={() => setShowAllOverview(!showAllOverview)}
                style={{ marginTop: 6 }}
              >
                <Text
                  style={{ color: "#8b5cf6", fontSize: 13, fontWeight: "600" }}
                >
                  {showAllOverview ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => handlePlay(1, 1)}
            activeOpacity={0.85}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#8b5cf6",
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Play size={16} color="#fff" fill="#fff" />
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              {isMovie ? "Play Movie" : "Play S1 E1"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleList}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: inList
                ? "rgba(139,92,246,0.12)"
                : "rgba(255,255,255,0.06)",
              paddingVertical: 14,
              paddingHorizontal: 18,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: inList ? "#8b5cf6" : "rgba(255,255,255,0.1)",
            }}
          >
            {inList ? (
              <Check size={16} color="#8b5cf6" />
            ) : (
              <Plus size={16} color="#fff" />
            )}
            <Text
              style={{
                color: inList ? "#8b5cf6" : "#fff",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {inList ? "Saved" : "My List"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TV: Season/Episode section */}
        {!isMovie && totalSeasons > 0 && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 24,
              backgroundColor: "#111",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#1a1a1a",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderBottomWidth: 1,
                borderColor: "#1a1a1a",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Episodes
              </Text>
              {totalEpisodes > 0 && (
                <Text style={{ color: "#4b5563", fontSize: 13, marginLeft: 8 }}>
                  · {totalEpisodes} total
                </Text>
              )}
            </View>

            {/* Season selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ padding: 12, gap: 8 }}
            >
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
                (s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSeason(s)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        season === s ? "#8b5cf6" : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        season === s ? "#8b5cf6" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        color: season === s ? "#fff" : "#9ca3af",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Season {s}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>

            {/* Episode list */}
            {seasonLoading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator color="#8b5cf6" />
                <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
                  Loading episodes...
                </Text>
              </View>
            ) : seasonData?.episodes?.length > 0 ? (
              seasonData.episodes.map((ep, epIdx) => {
                const stillUrl = ep.still_path
                  ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                  : null;
                return (
                  <TouchableOpacity
                    key={ep.episode_number}
                    onPress={() => handlePlay(season, ep.episode_number)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      borderTopWidth: epIdx === 0 ? 1 : 1,
                      borderColor: "#1a1a1a",
                    }}
                  >
                    <View
                      style={{
                        width: 100,
                        height: 58,
                        borderRadius: 8,
                        overflow: "hidden",
                        backgroundColor: "#1a1a1a",
                        marginRight: 12,
                      }}
                    >
                      {stillUrl ? (
                        <Image
                          source={{ uri: stillUrl }}
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
                          <Tv size={20} color="#374151" />
                        </View>
                      )}
                      <View
                        style={{
                          position: "absolute",
                          bottom: 5,
                          right: 5,
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: "rgba(229,9,20,0.85)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Play size={10} color="#fff" fill="#fff" />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#6b7280",
                          fontSize: 11,
                          fontWeight: "700",
                          marginBottom: 3,
                        }}
                      >
                        E{ep.episode_number}
                        {ep.runtime > 0 ? ` · ${ep.runtime}m` : ""}
                      </Text>
                      <Text
                        style={{
                          color: "#d1d5db",
                          fontSize: 13,
                          fontWeight: "600",
                          marginBottom: 3,
                        }}
                        numberOfLines={1}
                      >
                        {ep.name}
                      </Text>
                      {ep.overview ? (
                        <Text
                          style={{
                            color: "#4b5563",
                            fontSize: 12,
                            lineHeight: 17,
                          }}
                          numberOfLines={2}
                        >
                          {ep.overview}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#6b7280", fontSize: 13 }}>
                  No episodes available for this season.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Cast */}
        {cast.length > 0 && (
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
              <Users size={14} color="#9ca3af" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Cast
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {cast.map((actor) => (
                <View
                  key={actor.id}
                  style={{ width: 72, alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      overflow: "hidden",
                      backgroundColor: "#1a1a1a",
                      marginBottom: 6,
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                    }}
                  >
                    {actor.profile_path ? (
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
                        }}
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
                        <Users size={22} color="#374151" />
                      </View>
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: "#d1d5db",
                      fontSize: 11,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {actor.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#4b5563",
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 1,
                    }}
                  >
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* More Like This */}
        {similar.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "700",
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              More Like This
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {similar.map((item) => {
                const itemRating =
                  item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/details/${type}/${item.id}`)}
                    activeOpacity={0.85}
                    style={{ width: 116 }}
                  >
                    <View
                      style={{
                        width: 116,
                        height: 174,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: "#1a1a1a",
                        marginBottom: 6,
                      }}
                    >
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      {itemRating && (
                        <View
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            paddingHorizontal: 5,
                            paddingVertical: 2,
                            borderRadius: 5,
                          }}
                        >
                          <Star size={9} color="#fbbf24" fill="#fbbf24" />
                          <Text
                            style={{
                              color: "#fbbf24",
                              fontSize: 9,
                              fontWeight: "700",
                            }}
                          >
                            {itemRating}
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
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}
