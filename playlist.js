// ================= CONFIG =================
const API_KEY = 'AIzaSyB0Wp8FDfm8G31UK7JRxTnHpkgOeI5ClEQ';
const SEED_PLAYLIST_ID = 'PLXi_3CgEdI2ezCtbM4tAoWguVOPilGRKm';
const MAX_RESULTS = 50;

// ================= HELPERS =================

// Extract probable teledrama name (remove episode numbers)
function extractSeriesName(title) {
  return title
    .replace(/episode\s*\d+/i, '')
    .replace(/ep\s*\d+/i, '')
    .replace(/\d+/g, '')
    .replace(/[|:-]/g, '')
    .trim();
}

// Extract episode number (best effort)
function extractEpisodeNumber(text) {
  const match = text.match(/(?:episode|ep)\s*(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

// ================= STEP 1: READ SEED PLAYLIST =================
async function getSeedVideos() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${SEED_PLAYLIST_ID}&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items;
}

// ================= STEP 2: FIND LATEST EPISODE =================
async function findLatestEpisode(channelId, seriesName) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(seriesName)}&type=video&order=date&maxResults=10&key=${API_KEY}`;
  const res = await fetch(searchUrl);
  const data = await res.json();

  let best = null;
  let maxEpisode = -1;

  for (const item of data.items) {
    const title = item.snippet.title;
    const desc = item.snippet.description;
    const ep = extractEpisodeNumber(title + " " + desc);

    if (ep !== null && ep > maxEpisode) {
      maxEpisode = ep;
      best = {
        id: item.id.videoId,
        title: title,
        thumb: item.snippet.thumbnails.medium.url
      };
    }
  }

  // Fallback: newest upload
  if (!best && data.items.length > 0) {
    const v = data.items[0];
    best = {
      id: v.id.videoId,
      title: v.snippet.title,
      thumb: v.snippet.thumbnails.medium.url
    };
  }

  return best;
}

// ================= STEP 3: MAIN PIPELINE =================
async function loadLatestEpisodes() {
  const seedVideos = await getSeedVideos();
  const seen = new Set();
  const results = [];

  for (const v of seedVideos) {
    const snippet = v.snippet;
    const channelId = snippet.videoOwnerChannelId;
    const seriesName = extractSeriesName(snippet.title);

    const key = channelId + seriesName;
    if (seen.has(key)) continue;
    seen.add(key);

    const latest = await findLatestEpisode(channelId, seriesName);
    if (latest) results.push(latest);
  }

  render(results);
}

// ================= RENDER =================
function render(videos) {
  const container = document.getElementById('playlist');
  const player = document.getElementById('videoPlayer');

  if (videos.length > 0) {
    player.src = `https://www.youtube.com/embed/${videos[0].id}?autoplay=1`;
  }

  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => {
      player.src = `https://www.youtube.com/embed/${v.id}?autoplay=1`;
    };

    card.innerHTML = `
      <img src="${v.thumb}">
      <div class="title">${v.title}</div>
    `;

    container.appendChild(card);
  });
}

// ================= START =================
loadLatestEpisodes();
