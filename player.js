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
let player;

// --------------------------------------
// YouTube API ready
// --------------------------------------
function onYouTubeIframeAPIReady() {
    init();
}

// --------------------------------------
async function init() {
    await updateLatestEpisodes();
    createPlayer(videoQueue[0]);
    setInterval(updateLatestEpisodes, CHECK_INTERVAL);
}

// --------------------------------------
// Create YT Player
// --------------------------------------
function createPlayer(videoId) {
    player = new YT.Player("player", {
        height: "450",
        width: "80%",
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            rel: 0
        },
        events: {
            onStateChange: onPlayerStateChange
        }
    });
}

// --------------------------------------
// Detect END → Play next
// --------------------------------------
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// --------------------------------------
function playNext() {
    if (videoQueue.length === 0) return;

    currentIndex = (currentIndex + 1) % videoQueue.length;
    player.loadVideoById(videoQueue[currentIndex]);
}

// --------------------------------------
// Fetch latest episode from all playlists
// --------------------------------------
async function updateLatestEpisodes() {
    setStatus("Checking latest episodes...");

    const newQueue = [];

    for (let playlistId of PLAYLISTS) {
        const videoId = await getLatestFromPlaylist(playlistId);
        if (videoId) newQueue.push(videoId);
    }

    // If queue changed → reset autoplay order
    if (JSON.stringify(videoQueue) !== JSON.stringify(newQueue)) {
        videoQueue = newQueue;
        currentIndex = 0;
        setStatus("Updated with new episodes 🔄");

        if (player && videoQueue.length > 0) {
            player.loadVideoById(videoQueue[0]);
        }
    } else {
        setStatus("No new episodes ✅");
    }
}

// --------------------------------------
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

// --------------------------------------
function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

