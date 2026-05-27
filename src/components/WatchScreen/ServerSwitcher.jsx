import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Server } from "lucide-react-native";

export function ServerSwitcher({ providers, providerIdx, onSelectProvider }) {
  const active = providers[providerIdx];
  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#1a1a1a",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <Server size={13} color="#6b7280" />
        <Text
          style={{
            color: "#6b7280",
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.8,
          }}
        >
          SERVER
        </Text>
        <View
          style={{
            marginLeft: "auto",
            backgroundColor: "rgba(255,255,255,0.06)",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "500" }}>
            {active?.name}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {providers.map((p, idx) => {
          const isActive = idx === providerIdx;
          return (
            <TouchableOpacity
              key={p.name}
              onPress={() => onSelectProvider(idx)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 13,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: isActive ? p.color : "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: isActive ? p.color : "rgba(255,255,255,0.07)",
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? "#fff" : "#22c55e",
                }}
              />
              <Text
                style={{
                  color: isActive ? "#fff" : "#d1d5db",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {p.name}
              </Text>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                >
                  {idx + 1}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
