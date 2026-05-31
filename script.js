// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const mainPlayBtn = document.getElementById('main-play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const tracksList = document.getElementById('tracks-list');

// Playback Bar UI
const currentCover = document.getElementById('current-cover');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const likeBtn = document.getElementById('like-btn');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');

// Volume Controls
const volumeContainer = document.getElementById('volume-container');
const volumeFill = document.getElementById('volume-fill');
const muteBtn = document.getElementById('mute-btn');
const volumeIcon = document.getElementById('volume-icon');

// Top Info
const totalTracksCount = document.getElementById('total-tracks-count');
totalTracksCount.textContent = `${songs.length} songs`;

// State
let currentTrackIndex = 0;
let isPlaying = false;
let isMuted = false;
let previousVolume = 1;

// Initialize App
function init() {
    renderTrackList();
    loadTrack(currentTrackIndex, false);
    
    // Default volume
    audioPlayer.volume = 1;
    updateVolumeBar();
}

// Render Tracks in the main list
function renderTrackList() {
    tracksList.innerHTML = '';
    
    songs.forEach((song, index) => {
        const tr = document.createElement('div');
        tr.className = `track-row ${index === currentTrackIndex ? 'active' : ''}`;
        tr.dataset.index = index;
        
        tr.innerHTML = `
            <div class="track-number-cell">
                <span class="track-number">${index + 1}</span>
                <i class="ph-fill ph-play track-play"></i>
                <div class="playing-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            </div>
            <div class="track-info-cell">
                <img src="${song.cover}" alt="${song.title}" class="track-cover">
                <div class="track-details">
                    <span class="track-name-cell">${song.title}</span>
                    <span class="track-artist-cell">${song.artist}</span>
                </div>
            </div>
            <div class="track-album-cell">Single</div>
            <div class="track-date-cell">Just added</div>
            <div class="track-duration-cell">--:--</div>
        `;
        
        // Double click to play
        tr.addEventListener('dblclick', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex, true);
        });
        
        // Single click on play icon
        const playIconEl = tr.querySelector('.track-play');
        playIconEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (index === currentTrackIndex && isPlaying) {
                pauseTrack();
            } else {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex, true);
            }
        });

        tracksList.appendChild(tr);
    });
}

// Load a track into the player
function loadTrack(index, playImmediately = false) {
    const song = songs[index];
    audioPlayer.src = song.url;
    
    // Update UI
    currentCover.src = song.cover;
    currentCover.classList.remove('hidden');
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    likeBtn.classList.remove('hidden');
    
    updateActiveRow();
    
    if (playImmediately) {
        playTrack();
    }
}

function updateActiveRow() {
    document.querySelectorAll('.track-row').forEach(row => {
        row.classList.remove('active');
        row.classList.remove('playing');
        if (parseInt(row.dataset.index) === currentTrackIndex) {
            row.classList.add('active');
            if (isPlaying) {
                row.classList.add('playing');
            }
        }
    });
}

// Play & Pause
function playTrack() {
    audioPlayer.play().then(() => {
        isPlaying = true;
        playIcon.classList.replace('ph-play', 'ph-pause');
        mainPlayBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
        updateActiveRow();
    }).catch(error => {
        console.error("Audio playback error:", error);
    });
}

function pauseTrack() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.classList.replace('ph-pause', 'ph-play');
    mainPlayBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
    updateActiveRow();
}

function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

// Next & Prev
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % songs.length;
    loadTrack(currentTrackIndex, isPlaying);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
    loadTrack(currentTrackIndex, isPlaying);
}

// Formatting Time
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
mainPlayBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Audio Event Listeners
audioPlayer.addEventListener('ended', nextTrack);

audioPlayer.addEventListener('timeupdate', () => {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    currentTimeEl.textContent = formatTime(current);
    
    if (duration) {
        const progressPercent = (current / duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        totalTimeEl.textContent = formatTime(duration);
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
    
    // Attempt to update duration in track list (async because we only have 1 audio element, but we can do it for current)
    const activeRow = document.querySelector('.track-row.active .track-duration-cell');
    if (activeRow) {
        activeRow.textContent = formatTime(audioPlayer.duration);
    }
});

// Progress Bar Click & Drag
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    if (duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
}
progressContainer.addEventListener('click', setProgress);

// Volume Controls
function setVolume(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    let volume = clickX / width;
    
    if (volume < 0.05) volume = 0;
    if (volume > 0.95) volume = 1;
    
    audioPlayer.volume = volume;
    isMuted = volume === 0;
    updateVolumeBar();
}
volumeContainer.addEventListener('click', setVolume);

function updateVolumeBar() {
    const vol = audioPlayer.volume;
    volumeFill.style.width = `${vol * 100}%`;
    
    if (vol === 0 || isMuted) {
        volumeIcon.classList.replace('ph-speaker-high', 'ph-speaker-none');
    } else if (vol < 0.5) {
        volumeIcon.classList.replace('ph-speaker-none', 'ph-speaker-low');
        volumeIcon.classList.replace('ph-speaker-high', 'ph-speaker-low');
    } else {
        volumeIcon.classList.replace('ph-speaker-none', 'ph-speaker-high');
        volumeIcon.classList.replace('ph-speaker-low', 'ph-speaker-high');
    }
}

muteBtn.addEventListener('click', () => {
    if (isMuted) {
        audioPlayer.volume = previousVolume > 0 ? previousVolume : 1;
        isMuted = false;
    } else {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        isMuted = true;
    }
    updateVolumeBar();
});

// Navbar scroll effect
const mainContent = document.querySelector('.main-content');
const topNav = document.querySelector('.top-nav');

mainContent.addEventListener('scroll', () => {
    if (mainContent.scrollTop > 50) {
        topNav.classList.add('scrolled');
    } else {
        topNav.classList.remove('scrolled');
    }
});

// Start app
init();
