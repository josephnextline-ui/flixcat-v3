import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Shield,
  Zap,
  Trash2,
  ChevronRight,
  Info,
  Server,
} from "lucide-react-native";
import { PROVIDERS } from "@/constants/providers";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const CAT_FACTS = [
  "Cats sleep 70% of their lives — just like us watching FlixCat 😴",
  "A cat's purr vibrates at 25–150 Hz — the frequency of healing 🐾",
  "Cats have 32 muscles in each ear, allowing precise sound direction 👂",
  "The world's oldest cat, Creme Puff, lived to 38 years 🎂",
  "A group of cats is called a clowder 🐱",
  "Cats can rotate their ears 180 degrees independently 🔄",
  "Cats spend 50% of their awake time grooming — quality content selection 😸",
  "Cats have a special reflective layer in their eyes called tapetum lucidum ✨",
];

function StatCard({ emoji, value, label, color }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        alignItems: "center",
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{ color: color || C.primary, fontSize: 20, fontWeight: "800" }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: C.mutedDark,
          fontSize: 11,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Section({ title, icon: Icon, iconColor, children }) {
  return (
    <View
      style={{
        backgroundColor: C.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          padding: 16,
          borderBottomWidth: 1,
          borderColor: C.border,
        }}
      >
        {Icon && <Icon size={16} color={iconColor || C.muted} />}
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [catFactIdx, setCatFactIdx] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const wl = await AsyncStorage.getItem("flixcat_watchlist");
        const wh = await AsyncStorage.getItem("flixcat_watch_history");
        setSavedCount(wl ? JSON.parse(wl).length : 0);
        setHistoryCount(wh ? JSON.parse(wh).length : 0);
      } catch (e) {}
    };
    loadStats();
    const interval = setInterval(
      () => setCatFactIdx((i) => (i + 1) % CAT_FACTS.length),
      5000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Watch History",
      "This will remove all your watch history. Your saved list won't be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("flixcat_watch_history");
            setHistoryCount(0);
          },
        },
      ],
    );
  };

  const handleClearWatchlist = () => {
    Alert.alert(
      "Clear My Stash",
      "This will remove all saved titles from your stash.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("flixcat_watchlist");
            setSavedCount(0);
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Brand header */}
        <View
          style={{ alignItems: "center", paddingVertical: 28, marginBottom: 8 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: C.primaryGlow,
              borderWidth: 2,
              borderColor: "rgba(139,92,246,0.4)",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 38 }}>😸</Text>
          </View>
          <Text
            style={{
              color: C.primary,
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: -0.5,
            }}
          >
            FlixCat
          </Text>
          <Text style={{ color: C.mutedDark, fontSize: 13, marginTop: 4 }}>
            Your purr-fect streaming companion
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              backgroundColor: "rgba(139,92,246,0.1)",
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(139,92,246,0.2)",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: C.green,
              }}
            />
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: "600" }}>
              v2.0 · Powered by TMDB
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatCard
            emoji="🐾"
            value={savedCount}
            label="Saved"
            color={C.primary}
          />
          <StatCard
            emoji="📺"
            value={historyCount}
            label="Watched"
            color={C.pink}
          />
          <StatCard
            emoji="🖥️"
            value={PROVIDERS.length}
            label="Servers"
            color={C.gold}
          />
        </View>

        {/* Cat Fact carousel */}
        <View
          style={{
            backgroundColor: C.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.border,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 14 }}>🐾</Text>
            <Text
              style={{
                color: C.primary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              CAT FACT
            </Text>
          </View>
          <Text
            style={{
              color: C.text,
              fontSize: 14,
              lineHeight: 22,
              fontStyle: "italic",
            }}
          >
            "{CAT_FACTS[catFactIdx]}"
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 4,
              marginTop: 12,
            }}
          >
            {CAT_FACTS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === catFactIdx ? 14 : 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: i === catFactIdx ? C.primary : C.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* Ad Blocker */}
        <View
          style={{
            backgroundColor: C.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(16,185,129,0.2)",
            padding: 16,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "rgba(16,185,129,0.1)",
                borderWidth: 1,
                borderColor: "rgba(16,185,129,0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Shield size={18} color={C.green} />
            </View>
            <View>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>
                Ad Blocker
              </Text>
              <Text style={{ color: C.mutedDark, fontSize: 12, marginTop: 2 }}>
                Popups & redirects blocked
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "rgba(16,185,129,0.12)",
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(16,185,129,0.25)",
            }}
          >
            <Text style={{ color: C.green, fontSize: 11, fontWeight: "800" }}>
              ACTIVE
            </Text>
          </View>
        </View>

        {/* Streaming Servers */}
        <Section title="Streaming Servers" icon={Server} iconColor={C.primary}>
          {PROVIDERS.map((server, i) => (
            <View
              key={server.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderTopWidth: i === 0 ? 0 : 1,
                borderColor: C.border,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: server.color,
                  }}
                />
                <Text
                  style={{ color: C.text, fontSize: 13, fontWeight: "500" }}
                >
                  {server.name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(16,185,129,0.08)",
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: C.green,
                  }}
                />
                <Text
                  style={{ color: C.green, fontSize: 11, fontWeight: "600" }}
                >
                  Online
                </Text>
              </View>
            </View>
          ))}
        </Section>

        {/* Tips */}
        <Section title="Tips & Tricks" icon={Zap} iconColor={C.gold}>
          <View style={{ padding: 16, gap: 12 }}>
            {[
              "If a server doesn't load, switch to a different one using the server switcher 🖥️",
              "The native player extracts raw video links for ad-free playback with subtitle support 🎬",
              "Long-press a card on the home screen to see quick actions — play or save to stash 🐾",
              "Use the Shuffle button in Explore to discover something random 🎲",
            ].map((tip, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: C.primaryGlow,
                    borderWidth: 1,
                    borderColor: "rgba(139,92,246,0.3)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{ color: C.primary, fontSize: 9, fontWeight: "800" }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    lineHeight: 20,
                    flex: 1,
                  }}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Danger zone */}
        <Section title="Data" icon={Trash2} iconColor="#ef4444">
          <TouchableOpacity
            onPress={handleClearHistory}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: "600" }}>
                Clear Watch History
              </Text>
              <Text style={{ color: C.mutedDark, fontSize: 11, marginTop: 2 }}>
                {historyCount} titles in history
              </Text>
            </View>
            <ChevronRight size={16} color={C.mutedDark} />
          </TouchableOpacity>
          <View
            style={{
              height: 1,
              backgroundColor: C.border,
              marginHorizontal: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleClearWatchlist}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: "600" }}>
                Clear My Stash
              </Text>
              <Text style={{ color: C.mutedDark, fontSize: 11, marginTop: 2 }}>
                {savedCount} saved titles
              </Text>
            </View>
            <ChevronRight size={16} color={C.mutedDark} />
          </TouchableOpacity>
        </Section>

        <Text
          style={{
            color: C.mutedDark,
            fontSize: 11,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          FlixCat v2.0 · Made with 🐾 · Powered by TMDB
        </Text>
      </ScrollView>
    </View>
  );
}
