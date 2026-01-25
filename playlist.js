// ================= CONFIG =================
// const API_KEY = 'AIzaSyB0Wp8FDfm8G31UK7JRxTnHpkgOeI5ClEQ';
// const SEED_PLAYLIST_ID = 'PLXi_3CgEdI2ezCtbM4tAoWguVOPilGRKm';

// ================= CONFIG =================
const API_KEY = "YOUR_API_KEY_HERE";
const SOURCE_PLAYLIST_ID = "YOUR_REFERENCE_PLAYLIST_ID";
const MAX_RESULTS = 1; // only latest episode per drama

const container = document.getElementById("playlist");
const loading = document.getElementById("loading");

// ================= MAIN =================
async function init() {
  const referenceVideos = await getPlaylistVideos();
  const dramas = extractDramaInfo(referenceVideos);

  loading.style.display = "none";

  for (const drama of dramas) {
    const latest = await searchLatestEpisode(drama);
    if (latest) renderVideo(latest);
  }
}

// ================= STEP 1 =================
async function getPlaylistVideos() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${SOURCE_PLAYLIST_ID}&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

// ================= STEP 2 =================
function extractDramaInfo(videos) {
  const map = new Map();

  videos.forEach(v => {
    const title = v.snippet.title;
    const channelId = v.snippet.videoOwnerChannelId;

    // Remove episode numbers heuristically
    const dramaName = title
      .replace(/episode\s*\d+/i, "")
      .replace(/\d+/g, "")
      .trim();

    if (!map.has(dramaName)) {
      map.set(dramaName, { dramaName, channelId });
    }
  });

  return Array.from(map.values());
}

// ================= STEP 3 =================
async function searchLatestEpisode({ dramaName, channelId }) {
  const q = encodeURIComponent(dramaName);

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${q}&order=date&type=video&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;

  const v = data.items[0];
  return {
    videoId: v.id.videoId,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails.medium.url
  };
}

// ================= RENDER =================
function renderVideo(video) {
  const card = document.createElement("div");
  card.className = "video-card";
  card.onclick = () =>
    window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank");

  card.innerHTML = `
    <img src="${video.thumbnail}">
    <div class="video-title">${video.title}</div>
  `;

  container.appendChild(card);
}

// ================= START =================
init();

