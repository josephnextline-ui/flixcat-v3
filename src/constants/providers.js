export const PROVIDERS = [
  {
    name: "VidLink",
    color: "#6366f1",
    movie: (id) => `https://vidlink.pro/movie/${id}?autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true`,
  },
  {
    name: "VixSrc",
    color: "#E50914",
    movie: (id) => `https://vixsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vixsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidNest",
    color: "#10b981",
    movie: (id) => `https://vidnest.fun/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidnest.fun/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidFast",
    color: "#f59e0b",
    movie: (id) => `https://vidfast.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}`,
  },
  {
    name: "Videasy",
    color: "#a855f7",
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidZee",
    color: "#ec4899",
    movie: (id) => `https://player.vidzee.wtf/movie/${id}`,
    tv: (id, s, e) => `https://player.vidzee.wtf/tv/${id}/${s}/${e}`,
  },
  {
    name: "Vidking",
    color: "#f97316",
    movie: (id) => `https://www.vidking.net/movie/${id}`,
    tv: (id, s, e) => `https://www.vidking.net/tv/${id}/${s}/${e}`,
  },
];
