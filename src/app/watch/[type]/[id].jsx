import { useState, useRef, useEffect } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { useVideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PROVIDERS } from "@/constants/providers";
import { useWatchContent } from "@/hooks/useWatchContent";
import { useSeasonData } from "@/hooks/useSeasonData";
import { useStreamExtraction } from "@/hooks/useStreamExtraction";
import { useSubtitleSync } from "@/hooks/useSubtitleSync";
import { WatchHeader } from "@/components/WatchScreen/WatchHeader";
import { VideoPlayer } from "@/components/WatchScreen/VideoPlayer";
import { ServerSwitcher } from "@/components/WatchScreen/ServerSwitcher";
import { SubtitlePicker } from "@/components/WatchScreen/SubtitlePicker";
import { ContentInfo } from "@/components/WatchScreen/ContentInfo";
import { EpisodePicker } from "@/components/WatchScreen/EpisodePicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type, id } = params;
  const initSeason = parseInt(params.season) || 1;
  const initEpisode = parseInt(params.episode) || 1;

  const [providerIdx, setProviderIdx] = useState(0);
  const [season, setSeason] = useState(initSeason);
  const [episode, setEpisode] = useState(initEpisode);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);
  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false);

  const webRef = useRef(null);
  const videoViewRef = useRef(null);

  const player = useVideoPlayer(null);

  const { content, loading, inWatchlist, toggleWatchlist } = useWatchContent(
    id,
    type,
    params,
  );
  const seasonData = useSeasonData(id, season, type);
  const {
    extractionState,
    extractedUrl,
    extractReferer,
    subtitles,
    selectedSubtitleIdx,
    setSelectedSubtitleIdx,
    handleExtraction,
  } = useStreamExtraction(providerIdx, season, episode, player);

  const currentSubtitle = useSubtitleSync(
    selectedSubtitleIdx,
    subtitles,
    player,
  );

  useEffect(() => {
    if (!extractedUrl || !player) return;
    try {
      const provider = PROVIDERS[providerIdx];
      const embedUrl =
        type === "movie"
          ? provider.movie(id)
          : provider.tv(id, season, episode);
      const headers = {
        Referer: extractReferer || embedUrl,
        Origin: (() => {
          try {
            return new URL(extractReferer || embedUrl).origin;
          } catch (e) {
            return "";
          }
        })(),
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      };
      const source = { uri: extractedUrl, headers };
      player.replace(source);
      player.play();
    } catch (e) {
      console.error("player.replace failed:", e);
    }
  }, [extractedUrl]);

  const provider = PROVIDERS[providerIdx];
  const embedUrl =
    type === "movie" ? provider.movie(id) : provider.tv(id, season, episode);

  const title = content?.title || content?.name || "Loading...";
  const totalSeasons = content?.number_of_seasons || 0;

  const handleSelectProvider = (idx) => {
    try {
      player.pause();
    } catch (e) {}
    setProviderIdx(idx);
  };

  const handleSelectSeason = (s) => {
    setSeason(s);
    setEpisode(1);
  };

  const handleSelectEpisode = (e) => {
    setEpisode(e);
    setShowEpisodes(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#07071a" }}>
      <StatusBar style="light" />
      <WatchHeader
        insets={insets}
        onBack={() => router.back()}
        title={title}
        inWatchlist={inWatchlist}
        onToggleWatchlist={toggleWatchlist}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <VideoPlayer
          extractionState={extractionState}
          embedUrl={embedUrl}
          handleExtraction={handleExtraction}
          extractedUrl={extractedUrl}
          player={player}
          videoViewRef={videoViewRef}
          selectedSubtitleIdx={selectedSubtitleIdx}
          subtitles={subtitles}
          onShowSubtitlePicker={() => setShowSubtitlePicker(true)}
          currentSubtitle={currentSubtitle}
          provider={provider}
          webRef={webRef}
          webLoading={webLoading}
          webError={webError}
          setWebLoading={setWebLoading}
          setWebError={setWebError}
        />

        <ServerSwitcher
          providers={PROVIDERS}
          providerIdx={providerIdx}
          onSelectProvider={handleSelectProvider}
        />

        <ContentInfo content={content} type={type} />

        <EpisodePicker
          type={type}
          totalSeasons={totalSeasons}
          season={season}
          episode={episode}
          seasonData={seasonData}
          showEpisodes={showEpisodes}
          onToggleEpisodes={() => setShowEpisodes(!showEpisodes)}
          onSelectSeason={handleSelectSeason}
          onSelectEpisode={handleSelectEpisode}
        />

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>

      <SubtitlePicker
        visible={showSubtitlePicker}
        onClose={() => setShowSubtitlePicker(false)}
        subtitles={subtitles}
        selectedSubtitleIdx={selectedSubtitleIdx}
        onSelectSubtitle={setSelectedSubtitleIdx}
        insets={insets}
      />
    </View>
  );
}
