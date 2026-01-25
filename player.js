const API_KEY = "AIzaSyB0Wp8FDfm8G31UK7JRxTnHpkgOeI5ClEQ";

// 🔹 ADD ALL PLAYLIST IDS HERE (ORDER MATTERS)
const PLAYLISTS = [
    "PLcwO5OebB2EmaLQ0-8v4yCSHNroy13_rg",
    "PLcwO5OebB2EnMZ2oNg9yOiaBlDcLUydaH",
    "PLcwO5OebB2EnuqEVtYtAt8lIhLh5BfjVR"
];

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let videoQueue = [];
let currentIndex = 0;

// --------------------------------------
// INIT
// --------------------------------------
async function init() {
    await updateLatestEpisodes();
    playCurrent();
    setInterval(updateLatestEpisodes, CHECK_INTERVAL);
}

// --------------------------------------
// GET LATEST VIDEO FROM EACH PLAYLIST
// --------------------------------------
async function updateLatestEpisodes() {
    setStatus("Checking playlists for latest episodes...");

    const newQueue = [];

    for (let playlistId of PLAYLISTS) {
        const videoId = await getLatestFromPlaylist(playlistId);
        if (videoId) newQueue.push(videoId);
    }

    // Update queue ONLY if changed
    if (JSON.stringify(videoQueue) !== JSON.stringify(newQueue)) {
        videoQueue = newQueue;
        currentIndex = 0;
        setStatus("New episodes detected 🔄");
    } else {
        setStatus("No new episodes ✅");
    }
}

// --------------------------------------
// FETCH FIRST ITEM OF PLAYLIST
// --------------------------------------
async function getLatestFromPlaylist(playlistId) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems
        ?part=contentDetails
        &maxResults=1
        &playlistId=${playlistId}
        &key=${API_KEY}`.replace(/\s+/g, "");

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;
    return data.items[0].contentDetails.videoId;
}

// --------------------------------------
// AUTOPLAY LOGIC
// --------------------------------------
function playCurrent() {
    if (videoQueue.length === 0) return;

    const videoId = videoQueue[currentIndex];
    const iframe = document.getElementById("player");

    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;

    currentIndex = (currentIndex + 1) % videoQueue.length;
}

// --------------------------------------
// DETECT VIDEO END → PLAY NEXT
// --------------------------------------
window.addEventListener("message", event => {
    if (event.data?.event === "onStateChange" && event.data.info === 0) {
        playCurrent();
    }
});

// --------------------------------------
function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

// START
init();
