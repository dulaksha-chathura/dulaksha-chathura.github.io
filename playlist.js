const API_KEY = "YOUR_API_KEY_HERE";
const CHANNEL_ID = "YOUR_CHANNEL_ID_HERE";
const MAX_RESULTS = 10;

const player = document.getElementById("player");

async function loadLatestEpisode() {
  const url = `https://www.googleapis.com/youtube/v3/search?` +
              `key=${API_KEY}` +
              `&channelId=${CHANNEL_ID}` +
              `&part=snippet` +
              `&order=date` +
              `&maxResults=${MAX_RESULTS}` +
              `&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No videos found");
      return;
    }

    // Pick newest available video
    const videoId = data.items[0].id.videoId;

    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  } catch (err) {
    console.error("YouTube API error:", err);
  }
}

loadLatestEpisode();

// Auto refresh every 10 minutes
setInterval(loadLatestEpisode, 10 * 60 * 1000);
