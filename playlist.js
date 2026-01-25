// ---------------- CONFIG ----------------
const API_KEY = 'AIzaSyB0Wp8FDfm8G31UK7JRxTnHpkgOeI5ClEQ'; // Replace with your API key
const PLAYLIST_ID = 'PLXi_3CgEdI2ezCtbM4tAoWguVOPilGRKm'; // Replace with your playlist ID
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

  // Create the player container at the top
  const playerDiv = document.createElement('div');
  playerDiv.id = 'video-player';
  playerDiv.style.width = '80%';
  playerDiv.style.maxWidth = '800px';
  playerDiv.style.height = '450px';
  playerDiv.style.margin = '0 auto 40px';
  container.appendChild(playerDiv);

  // Create video cards
  videos.forEach((video, index) => {
    const videoId = video.snippet.resourceId.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;

    const card = document.createElement('div');
    card.className = 'video-card';

    card.onclick = () => {
      // Load video in iframe
      playerDiv.innerHTML = `
        <iframe width="100%" height="100%" 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
          title="${title}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
    };

    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${thumbnail}" alt="${title}">
      </div>
      <div class="video-title">${title}</div>
    `;

    container.appendChild(card);

    // Auto-click first video to play it on load
    if (index === 0) card.click();
  });
}

// ---------------- INIT ----------------
fetchPlaylist();
