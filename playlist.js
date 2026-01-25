// ---------------- CONFIG ----------------
const API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with your API key
const PLAYLIST_ID = 'YOUR_PLAYLIST_ID'; // Replace with your playlist ID
const MAX_RESULTS = 20; // Number of videos to fetch

// ---------------- FETCH PLAYLIST ----------------
async function fetchPlaylist() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) {
      console.error("No videos found or API limit reached", data);
      return;
    }

    displayVideos(data.items);
  } catch (err) {
    console.error("Error fetching playlist:", err);
  }
}

// ---------------- DISPLAY VIDEOS ----------------
function displayVideos(videos) {
  const container = document.getElementById('playlist');
  container.innerHTML = '';

  videos.forEach(video => {
    const videoId = video.snippet.resourceId.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;

    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    };

    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${thumbnail}" alt="${title}">
      </div>
      <div class="video-title">${title}</div>
    `;

    container.appendChild(card);
  });
}

// ---------------- INIT ----------------
fetchPlaylist();
