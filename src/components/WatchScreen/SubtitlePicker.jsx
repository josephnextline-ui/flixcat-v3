import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Subtitles, X, Check } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function SubtitlePicker({
  visible,
  onClose,
  subtitles,
  selectedSubtitleIdx,
  onSelectSubtitle,
  insets,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#111",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: SCREEN_HEIGHT * 0.6,
            paddingBottom: (insets?.bottom || 0) + 16,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#333",
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 4,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderColor: "#1a1a1a",
            }}
          >
            <Subtitles size={16} color="#9ca3af" />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
                flex: 1,
              }}
            >
              Subtitles
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => {
                onSelectSubtitle(null);
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderColor: "#1e1e3f",
                backgroundColor:
                  selectedSubtitleIdx === null
                    ? "rgba(139,92,246,0.08)"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  color: selectedSubtitleIdx === null ? "#8b5cf6" : "#d1d5db",
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Off
              </Text>
              {selectedSubtitleIdx === null && (
                <Check size={16} color="#8b5cf6" />
              )}
            </TouchableOpacity>

            {subtitles.length === 0 ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Subtitles size={32} color="#374151" />
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 12,
                    fontWeight: "500",
                  }}
                >
                  No subtitles found for this server
                </Text>
                <Text
                  style={{
                    color: "#4b5563",
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  Try a different server
                </Text>
              </View>
            ) : (
              subtitles.map((sub, idx) => {
                const isActive = selectedSubtitleIdx === idx;
                return (
                  <TouchableOpacity
                    key={sub.url}
                    onPress={() => {
                      onSelectSubtitle(idx);
                      onClose();
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderColor: "#1e1e3f",
                      backgroundColor: isActive
                        ? "rgba(139,92,246,0.08)"
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#8b5cf6" : "#d1d5db",
                        fontSize: 15,
                        fontWeight: "500",
                        flex: 1,
                      }}
                    >
                      {sub.label}
                    </Text>
                    <Text
                      style={{
                        color: "#6b7280",
                        fontSize: 11,
                        fontWeight: "600",
                        marginRight: isActive ? 8 : 0,
                      }}
                    >
                      {sub.language.toUpperCase()}
                    </Text>
                    {isActive && <Check size={16} color="#8b5cf6" />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
