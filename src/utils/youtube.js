export function getYouTubeEmbedUrl(url) {
  if (!url.trim()) {
    return "";
  }

  try {
    const parsedUrl = new URL(url.trim());
    let videoId = "";

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.slice(1);
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/shorts/") || parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2];
      } else {
        videoId = parsedUrl.searchParams.get("v") ?? "";
      }
    }

    const cleanId = videoId.split(/[?&]/)[0];
    return cleanId ? `https://www.youtube.com/embed/${cleanId}` : "";
  } catch {
    return "";
  }
}
