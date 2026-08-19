export type VideoSource = {
  kind: "file" | "youtube" | "vimeo" | "unknown";
  embedUrl?: string;
};

export function parseVideoUrl(url: string): VideoSource {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { kind: "unknown" };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const host = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsedUrl.pathname;

    if (/\.(mp4|webm)$/i.test(pathname) || (host.endsWith("supabase.co") && pathname.includes("/storage/v1/object/"))) {
      return { kind: "file" };
    }

    if (host === "youtu.be") {
      const videoId = pathname.split("/").filter(Boolean)[0];
      return videoId ? { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` } : { kind: "unknown" };
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v") ?? pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return videoId ? { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` } : { kind: "unknown" };
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const videoId = pathname.match(/\/(\d+)(?:\/|$)/)?.[1];
      return videoId ? { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${videoId}` } : { kind: "unknown" };
    }
  } catch {
    return { kind: "unknown" };
  }

  return { kind: "unknown" };
}
