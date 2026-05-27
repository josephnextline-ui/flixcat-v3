import AsyncStorage from "@react-native-async-storage/async-storage";

const WATCHLIST_KEY = "flixcat_watchlist";

export const getWatchlist = async () => {
  try {
    const data = await AsyncStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchlist = async (item) => {
  const list = await getWatchlist();
  const exists = list.find(
    (i) =>
      i.content_id === item.content_id && i.content_type === item.content_type,
  );
  if (!exists) {
    list.unshift({ ...item, added_at: new Date().toISOString() });
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
  return list;
};

export const removeFromWatchlist = async (content_id, content_type) => {
  const list = (await getWatchlist()).filter(
    (i) => !(i.content_id === content_id && i.content_type === content_type),
  );
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return list;
};

export const isInWatchlist = async (content_id, content_type) => {
  const list = await getWatchlist();
  return list.some(
    (i) => i.content_id === content_id && i.content_type === content_type,
  );
};
