import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Heart } from "lucide-react-native";

export function WatchHeader({
  insets,
  onBack,
  title,
  inWatchlist,
  onToggleWatchlist,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: (insets?.top || 44) + 8,
        paddingBottom: 12,
        backgroundColor: "#07071a",
        borderBottomWidth: 1,
        borderColor: "#1e1e3f",
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.06)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <ArrowLeft size={18} color="#fff" />
      </TouchableOpacity>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: "#fff",
          fontSize: 15,
          fontWeight: "600",
          textAlign: "center",
          marginHorizontal: 12,
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={onToggleWatchlist}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: inWatchlist
            ? "rgba(139,92,246,0.15)"
            : "rgba(255,255,255,0.06)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: inWatchlist ? "#8b5cf6" : "rgba(255,255,255,0.08)",
        }}
      >
        <Heart
          size={18}
          color={inWatchlist ? "#8b5cf6" : "#fff"}
          fill={inWatchlist ? "#8b5cf6" : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
}
