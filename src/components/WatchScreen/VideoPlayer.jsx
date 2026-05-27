import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { VideoView } from "expo-video";
import {
  AlertCircle,
  RotateCcw,
  PictureInPicture2,
  Subtitles,
} from "lucide-react-native";
import { AD_BLOCK_JS, EXTRACTION_JS } from "@/utils/adBlockScripts";
import { AD_BLOCK_DOMAINS } from "@/constants/adBlockConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16) + 60;

const absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function VideoPlayer({
  extractionState,
  embedUrl,
  handleExtraction,
  extractedUrl,
  player,
  videoViewRef,
  selectedSubtitleIdx,
  subtitles,
  onShowSubtitlePicker,
  currentSubtitle,
  provider,
  webRef,
  webLoading,
  webError,
  setWebLoading,
  setWebError,
}) {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: PLAYER_HEIGHT,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Hidden extraction WebView */}
      {extractionState === "extracting" && (
        <WebView
          ref={webRef}
          source={{ uri: embedUrl }}
          injectedJavaScript={AD_BLOCK_JS + "\n" + EXTRACTION_JS}
          onMessage={handleExtraction}
          style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          mixedContentMode="always"
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        />
      )}

      {/* Native ad-free player (extraction succeeded) */}
      {extractionState === "success" && extractedUrl && (
        <View style={absoluteFill}>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={absoluteFill}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
          />

          {/* Top-right action buttons */}
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                try {
                  videoViewRef.current?.startPictureInPicture();
                } catch (e) {}
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(0,0,0,0.65)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <PictureInPicture2 size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onShowSubtitlePicker}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor:
                  selectedSubtitleIdx !== null
                    ? "rgba(139,92,246,0.8)"
                    : "rgba(0,0,0,0.65)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor:
                  selectedSubtitleIdx !== null
                    ? "#8b5cf6"
                    : "rgba(255,255,255,0.15)",
              }}
            >
              <Subtitles size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Active subtitle label */}
          {selectedSubtitleIdx !== null && subtitles[selectedSubtitleIdx] && (
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "rgba(139,92,246,0.8)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                {subtitles[selectedSubtitleIdx].label}
              </Text>
            </View>
          )}

          {/* Subtitle text overlay */}
          {currentSubtitle !== "" && (
            <View
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "600",
                  textAlign: "center",
                  backgroundColor: "rgba(0,0,0,0.75)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {currentSubtitle}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Fallback: regular ad-blocked WebView */}
      {extractionState === "failed" && (
        <WebView
          ref={webRef}
          source={{ uri: embedUrl }}
          injectedJavaScript={AD_BLOCK_JS}
          onShouldStartLoadWithRequest={(req) => {
            const isBlocked = AD_BLOCK_DOMAINS.some((d) => req.url.includes(d));
            if (isBlocked) return false;
            if (req.navigationType === "click" && req.url !== embedUrl) {
              try {
                const isNewWindow = !req.url.includes(
                  new URL(embedUrl).hostname,
                );
                if (isNewWindow) return false;
              } catch (e) {}
            }
            return true;
          }}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          originWhitelist={["*"]}
          mixedContentMode="always"
          onLoadStart={() => {
            setWebLoading(true);
            setWebError(false);
          }}
          onLoad={() => setWebLoading(false)}
          onError={() => {
            setWebLoading(false);
            setWebError(true);
          }}
          onHttpError={() => {
            setWebLoading(false);
            setWebError(true);
          }}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          style={absoluteFill}
        />
      )}

      {/* Extracting overlay */}
      {extractionState === "extracting" && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <ActivityIndicator color="#8b5cf6" size="large" />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "600",
              marginTop: 14,
            }}
          >
            Extracting stream...
          </Text>
          <Text
            style={{
              color: "#6b7280",
              fontSize: 12,
              marginTop: 6,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            Pulling the raw video from {provider?.name} — this removes all ads
          </Text>
        </View>
      )}

      {/* Fallback loading overlay */}
      {extractionState === "failed" && webLoading && !webError && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <ActivityIndicator color="#8b5cf6" />
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 12,
              marginTop: 10,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            Loading {provider?.name} with ad blocker...
          </Text>
        </View>
      )}

      {/* Error overlay */}
      {extractionState === "failed" && webError && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <AlertCircle size={36} color="#8b5cf6" />
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "600",
              marginTop: 12,
            }}
          >
            This server didn't load
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
            Try a different server below
          </Text>
          <TouchableOpacity
            onPress={() => {
              setWebError(false);
              setWebLoading(true);
              webRef.current?.reload();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#1a1a35",
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#2a2a42",
              marginTop: 16,
            }}
          >
            <RotateCcw size={14} color="#9ca3af" />
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "500" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
