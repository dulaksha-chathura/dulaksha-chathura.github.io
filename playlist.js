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

// ================= STATE =================
let player;
let videoQueue = []; // [{ videoId, title }]
let currentIndex = 0;

// ================= STATUS =================
function setStatus(text) {
  document.getElementById("status").innerText = text;
}

// ================= YOUTUBE API =================
function onYouTubeIframeAPIReady() {
  updateLatestEpisodes();
  setInterval(updateLatestEpisodes, CHECK_INTERVAL);
}

// ================= FETCH LATEST VIDEO =================
async function getLatestFromPlaylist(playlistId) {
  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0].snippet;

    return {
      videoId: item.resourceId.videoId,
      title: item.title
    };
  } catch (err) {
    console.error("Playlist fetch error", err);
    return null;
  }
}

// ================= UPDATE ALL =================
async function updateLatestEpisodes() {
  setStatus("Checking for new episodes…");

  const newQueue = [];

  for (const pid of PLAYLISTS) {
    const video = await getLatestFromPlaylist(pid);
    if (video) newQueue.push(video);
  }

  if (JSON.stringify(newQueue) !== JSON.stringify(videoQueue)) {
    videoQueue = newQueue;
    currentIndex = 0;
    renderEpisodeList();
    setStatus("New episodes loaded");

    if (!player) {
      createPlayer(videoQueue[0].videoId);
    } else {
      player.loadVideoById(videoQueue[0].videoId);
      highlightActive();
    }
  } else {
    setStatus("No new episodes");
  }
}

// ================= PLAYER =================
function createPlayer(videoId) {
  player = new YT.Player("player", {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        setStatus("Playing ▶");
        highlightActive();
      },
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNext();
  }
}

function playNext() {
  if (videoQueue.length === 0) return;

  currentIndex = (currentIndex + 1) % videoQueue.length;
  player.loadVideoById(videoQueue[currentIndex].videoId);
  highlightActive();
}

// ================= UI =================
function renderEpisodeList() {
  const list = document.getElementById("episodeList");
  list.innerHTML = "";

  videoQueue.forEach((video, index) => {
    const div = document.createElement("div");
    div.className = "episode";
    div.innerText = video.title;

    div.onclick = () => {
      currentIndex = index;
      player.loadVideoById(video.videoId);
      highlightActive();
    };

    list.appendChild(div);
  });

  highlightActive();
}

function highlightActive() {
  document.querySelectorAll(".episode").forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });
}
