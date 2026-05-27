import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Tv, Play, ChevronDown, ChevronUp, Star } from "lucide-react-native";

const absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function EpisodePicker({
  type,
  totalSeasons,
  season,
  episode,
  seasonData,
  showEpisodes,
  onToggleEpisodes,
  onSelectSeason,
  onSelectEpisode,
}) {
  if (type !== "tv" || totalSeasons === 0) return null;

  const totalEpisodes = seasonData?.episodes?.length || 0;

  return (
    <View style={{ borderBottomWidth: 1, borderColor: "#1a1a1a" }}>
      {/* Now playing indicator */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 4,
        }}
      >
        <Text
          style={{
            color: "#8b5cf6",
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          NOW PLAYING
        </Text>
        <Text
          style={{
            color: "#d1d5db",
            fontSize: 13,
            fontWeight: "500",
            marginTop: 2,
          }}
        >
          Season {season} · Episode {episode}
          {seasonData?.episodes?.[episode - 1]?.name
            ? ` · ${seasonData.episodes[episode - 1].name}`
            : ""}
        </Text>
      </View>

      {/* Episode picker toggle */}
      <TouchableOpacity
        onPress={onToggleEpisodes}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderColor: "#1a1a1a",
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Tv size={14} color="#9ca3af" />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            Episodes
          </Text>
          {totalEpisodes > 0 && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{ color: "#6b7280", fontSize: 11, fontWeight: "500" }}
              >
                {totalEpisodes} eps
              </Text>
            </View>
          )}
        </View>
        {showEpisodes ? (
          <ChevronUp size={18} color="#6b7280" />
        ) : (
          <ChevronDown size={18} color="#6b7280" />
        )}
      </TouchableOpacity>

      {showEpisodes && (
        <View>
          {/* Season tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              paddingBottom: 10,
            }}
          >
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onSelectSeason(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    season === s ? "#8b5cf6" : "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor:
                    season === s ? "#8b5cf6" : "rgba(255,255,255,0.08)",
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
            ))}
          </ScrollView>

          {/* Episode list */}
          {!seasonData ? (
            <ActivityIndicator
              color="#8b5cf6"
              style={{ paddingVertical: 20 }}
            />
          ) : (
            seasonData.episodes?.map((ep, epIdx) => {
              const isPlaying = episode === ep.episode_number;
              const stillUrl = ep.still_path
                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                : null;
              return (
                <TouchableOpacity
                  key={ep.episode_number}
                  onPress={() => onSelectEpisode(ep.episode_number)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderTopWidth: epIdx === 0 ? 0 : 1,
                    borderColor: "#1a1a1a",
                    backgroundColor: isPlaying
                      ? "rgba(139,92,246,0.08)"
                      : "transparent",
                  }}
                >
                  {/* Thumbnail */}
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
                        style={absoluteFill}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={{
                          ...absoluteFill,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Tv size={20} color="#374151" />
                      </View>
                    )}
                    {isPlaying && (
                      <View
                        style={{
                          ...absoluteFill,
                          backgroundColor: "rgba(139,92,246,0.45)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Play size={18} color="#fff" fill="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Episode info */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: isPlaying ? "#8b5cf6" : "#6b7280",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        E{ep.episode_number}
                      </Text>
                      {ep.runtime > 0 && (
                        <Text style={{ color: "#4b5563", fontSize: 11 }}>
                          · {ep.runtime}m
                        </Text>
                      )}
                      {ep.vote_average > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Star size={9} color="#fbbf24" fill="#fbbf24" />
                          <Text
                            style={{
                              color: "#fbbf24",
                              fontSize: 10,
                              fontWeight: "600",
                            }}
                          >
                            {ep.vote_average.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: isPlaying ? "#fff" : "#d1d5db",
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
          )}
        </View>
      )}
    </View>
  );
}
