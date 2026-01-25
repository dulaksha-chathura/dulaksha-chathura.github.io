const API_KEY = "AIzaSyB0Wp8FDfm8G31UK7JRxTnHpkgOeI5ClEQ";

// 🔹 ADD ALL PLAYLIST IDS HERE (ORDER MATTERS)

//kodukari
//sitha nidi ne
//iskole
//sangeethe
//man adarey

const PLAYLISTS = [
    "PLcwO5OebB2EnuqEVtYtAt8lIhLh5BfjVR",
    "PLcwO5OebB2En8YWYGlT6YAFd6BcQuf1NL",
    "PLcwO5OebB2El9lowzMY0y2tdRSp_nj3Fb",
    "PLcwO5OebB2EnMZ2oNg9yOiaBlDcLUydaH",
    "PLcwO5OebB2EmaLQ0-8v4yCSHNroy13_rg"
];

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let videoQueue = [];
let currentIndex = 0;
let player;
let apiReady = false;

// ---------------- API READY (MUST BE GLOBAL) ----------------
window.onYouTubeIframeAPIReady = function () {
  apiReady = true;
  init();
};

// ---------------- INIT ----------------
async function init() {
  setStatus("Loading latest episodes…");
  await updateLatestEpisodes();

  if (videoQueue.length === 0) {
    setStatus("No videos found");
    return;
  }

  createPlayer(videoQueue[0]);
  setInterval(updateLatestEpisodes, CHECK_INTERVAL);
}

// ---------------- CREATE PLAYER ----------------
function createPlayer(videoId) {
  player = new YT.Player("player", {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      rel: 0
    },
    events: {
      onReady: () => setStatus("Playing ▶"),
      onStateChange: onPlayerStateChange
    }
  });
}

// ---------------- PLAYER STATE ----------------
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNext();
  }
}

// ---------------- PLAY NEXT ----------------
function playNext() {
  if (videoQueue.length === 0) return;

  currentIndex = (currentIndex + 1) % videoQueue.length;
  player.loadVideoById(videoQueue[currentIndex]);
}

// ---------------- FETCH LATEST EPISODES ----------------
async function updateLatestEpisodes() {
  const newQueue = [];

  for (const playlistId of PLAYLISTS) {
    const videoId = await getLatestFromPlaylist(playlistId);
    if (videoId) newQueue.push(videoId);
  }

  if (newQueue.length === 0) return;

  if (JSON.stringify(videoQueue) !== JSON.stringify(newQueue)) {
    videoQueue = newQueue;
    currentIndex = 0;

    setStatus("New episode detected 🔄");

    if (player) {
      player.loadVideoById(videoQueue[0]);
    }
  }
}

// ---------------- GET LATEST VIDEO FROM PLAYLIST ----------------
async function getLatestFromPlaylist(playlistId) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems
    ?part=contentDetails
    &playlistId=${playlistId}
    &maxResults=1
    &key=${API_KEY}`.replace(/\s+/g, "");

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;
  return data.items[0].contentDetails.videoId;
}

// ---------------- STATUS ----------------
function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

