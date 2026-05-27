import { View, Text, ScrollView } from "react-native";
import { Star, Clock, Calendar, Tv, Film } from "lucide-react-native";

export function ContentInfo({ content, type }) {
  const title = content?.title || content?.name || "Loading...";
  const rating = content?.vote_average ? content.vote_average.toFixed(1) : null;
  const year =
    content?.release_date?.split("-")[0] ||
    content?.first_air_date?.split("-")[0];
  const totalSeasons = content?.number_of_seasons || 0;

  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#1a1a1a" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 8,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: "rgba(255,255,255,0.06)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {type === "movie" ? (
            <Film size={11} color="#9ca3af" />
          ) : (
            <Tv size={11} color="#9ca3af" />
          )}
          <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600" }}>
            {type === "movie" ? "MOVIE" : "TV SHOW"}
          </Text>
        </View>

        {year && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(255,255,255,0.06)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Calendar size={11} color="#9ca3af" />
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "500" }}>
              {year}
            </Text>
          </View>
        )}

        {rating && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(251,191,36,0.1)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "rgba(251,191,36,0.2)",
            }}
          >
            <Star size={11} color="#fbbf24" fill="#fbbf24" />
            <Text style={{ color: "#fbbf24", fontSize: 11, fontWeight: "600" }}>
              {rating}
            </Text>
          </View>
        )}

        {type === "tv" && totalSeasons > 0 && (
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "500" }}>
              {totalSeasons} {totalSeasons === 1 ? "Season" : "Seasons"}
            </Text>
          </View>
        )}

        {content?.runtime > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(255,255,255,0.06)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Clock size={11} color="#9ca3af" />
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "500" }}>
              {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
            </Text>
          </View>
        )}
      </View>

      {content?.genres?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 6 }}
        >
          {content.genres.map((g) => (
            <View
              key={g.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <Text
                style={{ color: "#6b7280", fontSize: 11, fontWeight: "500" }}
              >
                {g.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {content?.overview && (
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 13,
            lineHeight: 20,
          }}
          numberOfLines={4}
        >
          {content.overview}
        </Text>
      )}
    </View>
  );
}
