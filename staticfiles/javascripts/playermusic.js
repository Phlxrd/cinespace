// --- Global Scope Variables (within DOMContentLoaded) ---
let currentAudio = null;
let isPlaying = false;
let isLooping = false;
let isShuffled = false;
let currentSongIndex = -1;
window.songsList = []; // Global list of songs, accessible via window
let playbackHistory = []; // Playback history array
let isVolumeDragging = false; // Flag for volume slider drag
let isScrollbarDragging = false; // Flag for sidebar scrollbar drag
let mainCarouselIntervalId = null; // ID for the main carousel autoplay interval
let rightSidebarCarouselIntervalId = null; // ID for the right sidebar carousel autoplay interval

// --- Selectors (Grouped for clarity) ---
// Player Controls & Display
const playPauseContainer = document.querySelector('.play-pause-container');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressBarContainer = document.querySelector('.progress-bar'); // Clickable area for seeking
const progressBar = document.querySelector('.progress'); // The visual progress fill
const progressThumb = document.querySelector('.progress-thumb'); // The draggable thumb
const currentTimeDisplay = document.querySelector('.current-time');
const totalTimeDisplay = document.querySelector('.total-time');
const loopButton = document.querySelector('.looping');
const shuffleButton = document.querySelector('.aleatorio');
const proximaButton = document.querySelector('.proxima');
const anteriorButton = document.querySelector('.anterior');
const songCover = document.querySelector('.song-cover');
const songTitle = document.querySelector('.song-title');
const songArtist = document.querySelector('.song-artist');

// Volume Controls
const volumeSliderContainer = document.querySelector('.volume-slider-container');
const volumeSliderProgress = document.querySelector('.volume-slider-progress');
const volumeSliderThumb = document.querySelector('.volume-slider-thumb');

// Left Sidebar (assuming .sidebar is the left one)
const leftSidebar = document.querySelector('.sidebar'); // Renamed for clarity
const leftScrollbar = leftSidebar ? leftSidebar.querySelector('.scrollbar') : null; // Custom scrollbar element
const closeSidebarButton = leftSidebar ? leftSidebar.querySelector('.close-sidebar') : null;
const openSidebarButton = leftSidebar ? leftSidebar.querySelector('.open-sidebar') : null;
const categoryTitles = leftSidebar ? leftSidebar.querySelectorAll('.category-title') : []; // Titles to hide/show

// Right Sidebar (specific selectors needed for its carousel)
const rightSidebar = document.querySelector('.right-sidebar');
const recentlyPlayedList = rightSidebar ? rightSidebar.querySelector('#recently-played-list') : null; // History container in right sidebar

// Main Artist Carousel (likely in the main content area)
const mainCarouselTrack = document.querySelector('.artist-carousel .carousel-track'); // More specific selector
const mainCarouselDotsContainer = document.querySelector('.artist-carousel .carousel-dots'); // More specific selector
const mainCarouselArtistNameElement = document.querySelector('.artist-carousel .artist-name'); // More specific selector
const mainCarouselPrevButton = document.querySelector('.artist-carousel .carousel-prev'); // More specific selector
const mainCarouselNextButton = document.querySelector('.artist-carousel .carousel-next'); // More specific selector
const mainArtistCarouselElement = document.querySelector('.artist-carousel'); // Main carousel container

// Content Loading Containers
const popularSongsContainer = document.getElementById('popular-songs');
const albumGrid = document.getElementById('album-grid');
const artistasContainer = document.getElementById('artista-grid');

// Search
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// --- Utility Functions ---
function formatTime(time) {
    if (isNaN(time) || !isFinite(time) || time < 0) {
        return '0:00'; // Handle invalid or unloaded duration/time
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// --- Player State Management ---
function dispatchPlayerStateChanged() {
    // No changes needed here, but ensure it's called after state changes
    if (!currentAudio) {
        // console.log("Dispatch skipped: No current audio.");
        return;
    }
    const playerState = {
        url: currentAudio.src,
        title: songTitle ? songTitle.textContent : '',
        artist: songArtist ? songArtist.textContent : '',
        cover: songCover ? songCover.src : '',
        currentTime: currentAudio.currentTime,
        duration: currentAudio.duration, // Include duration
        volume: currentAudio.volume,
        isLooping: isLooping,
        isShuffled: isShuffled,
        index: currentSongIndex,
        isPlaying: isPlaying // Send current playing status
    };
    const event = new CustomEvent('playerStateChanged', { detail: playerState });
    window.dispatchEvent(event);
}

// Função para salvar o estado do player
function savePlayerState() {
    if (currentAudio) {
        const playerState = {
            url: currentAudio.src,
            title: songTitle ? songTitle.textContent : '',
            artist: songArtist ? songArtist.textContent : '',
            cover: songCover ? songCover.src : '',
            currentTime: currentAudio.currentTime,
            volume: currentAudio.volume,
            isPlaying: isPlaying,
            index: currentSongIndex
        };
        
        try {
            localStorage.setItem('playerState', JSON.stringify(playerState));
            console.log('Estado do player salvo:', playerState);
        } catch (error) {
            console.error("Erro ao salvar estado:", error);
        }
    }
}


// ******** REVISED: Function to LOAD player state with autoplay attempt ********
function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
        try {
            const playerState = JSON.parse(savedState);
            console.log("Estado do player carregado:", playerState);

            if (playerState.url) {
                const isSameSong = currentAudio && currentAudio.src === playerState.url;
                const wasPlaying = playerState.isPlaying || false; // Get the saved playing status

                if (!isSameSong) {
                    if (currentAudio) {
                        currentAudio.pause();
                        // Remove listeners explicitly here
                        currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
                        currentAudio.removeEventListener('ended', handleSongEnd);
                        currentAudio.removeEventListener('loadedmetadata', handleMetadataLoaded);
                        currentAudio.removeEventListener('play', handlePlay);
                        currentAudio.removeEventListener('pause', handlePause);
                        currentAudio.removeEventListener('volumechange', handleVolumeChange);
                        currentAudio.src = '';
                    }
                    currentAudio = new Audio(playerState.url);
                    // Add listeners *immediately* after creating the new audio object
                    addAudioListeners();
                } else if (currentAudio) {
                    // If same song, ensure listeners are still attached (good practice)
                    addAudioListeners();
                } else {
                    // Edge case: savedState exists, but currentAudio is null somehow
                    currentAudio = new Audio(playerState.url);
                    addAudioListeners();
                }

                // --- Restore State ---
                // Set volume first
                currentAudio.volume = (playerState.volume !== undefined) ? playerState.volume : 0.5;
                // Set loop/shuffle states
                isLooping = playerState.isLooping || false;
                isShuffled = playerState.isShuffled || false;
                currentSongIndex = (playerState.index !== undefined) ? playerState.index : -1;

                // --- Update UI Initially Based on Saved State ---
                if (songCover) songCover.src = playerState.cover || '';
                if (songTitle) songTitle.textContent = playerState.title || 'Desconhecido';
                if (songArtist) songArtist.textContent = playerState.artist || '';
                updateVolumeSlider(currentAudio.volume * 100);
                if (loopButton) loopButton.style.opacity = isLooping ? '1' : '0.5';
                if (shuffleButton) shuffleButton.style.opacity = isShuffled ? '1' : '0.5';

                // Set isPlaying temporarily for initial UI update
                isPlaying = wasPlaying;
                updatePlayPauseIcon(); // Show correct icon initially based on saved state

                // Set currentTime - needs to happen *after* src is set and potentially *before* play attempt
                // Browsers handle this differently; setting it now is usually okay.
                // The 'loadedmetadata' might refine the duration display later.
                currentAudio.currentTime = playerState.currentTime || 0;
                updateProgressBar(); // Update progress bar with loaded time

                dispatchPlayerStateChanged(); // Dispatch state before play attempt

                // --- Attempt Autoplay if Necessary ---
                if (wasPlaying) {
                    console.log("Estado salvo indica que estava tocando. Tentando retomar...");
                    // Use a small delay to potentially allow the browser to be ready
                    setTimeout(() => {
                        if (!currentAudio) return; // Guard against race conditions
                        const playPromise = currentAudio.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                // Success! Playback started.
                                console.log("Reprodução retomada automaticamente.");
                                // 'handlePlay' will be triggered, setting isPlaying = true and saving state.
                            }).catch(error => {
                                // Failure! Likely autoplay restriction.
                                console.warn("Falha ao retomar reprodução automaticamente (provável restrição de autoplay):", error);
                                // Correct the state and UI because playback DID NOT start.
                                isPlaying = false;
                                updatePlayPauseIcon(); // Show PLAY button again.
                                // Do NOT save state here; the state is effectively paused.
                            });
                        }
                    }, 50); // Small delay (e.g., 50ms) - adjust if needed
                } else {
                    console.log("Estado salvo indica que estava pausado.");
                    // Ensure state reflects pause
                    isPlaying = false;
                    updatePlayPauseIcon();
                }
                // --- End Autoplay Attempt ---

            } else {
                console.warn("Estado salvo inválido (sem URL). Resetando.");
                clearPlayerState();
                setInitialPlayerUI();
            }
        } catch (error) {
            console.error("Erro ao carregar/parsear estado do player:", error);
            clearPlayerState();
            setInitialPlayerUI();
        }
    } else {
        console.log("Nenhum estado de player salvo.");
        setInitialPlayerUI();
    }
}

// Função para limpar o estado do player
function clearPlayerState() {
    try {
        localStorage.removeItem('playerState');
        console.log("Estado do player limpo.");
        playerInitialized = false;
        
        const songInfo = document.querySelector('.song-info');
        if (songInfo) {
            songInfo.classList.remove('has-song');
            songInfo.style.opacity = '0';
            songInfo.style.transform = 'translateX(-20px)';
        }
    } catch (error) {
        console.error("Erro ao limpar estado:", error);
    }
}

let hasInitializedPlayer = false;

// Modifique a função setInitialPlayerUI
function setInitialPlayerUI() {
    const songInfo = document.querySelector('.song-info');
    if (songInfo && !hasInitializedPlayer) {
        songInfo.classList.remove('has-song');
        songInfo.style.opacity = '0';
        songInfo.style.transform = 'translateX(-20px)';
    }
    
    if (songTitle) songTitle.textContent = 'Selecione uma música';
    if (songArtist) songArtist.textContent = '';
    if (songCover) songCover.src = '';
    isPlaying = false;
    isLooping = false;
    isShuffled = false;
    currentSongIndex = -1;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    updatePlayPauseIcon();
    updateProgressBar();
    updateVolumeSlider(50);
    if (loopButton) loopButton.style.opacity = '0.5';
    if (shuffleButton) shuffleButton.style.opacity = '0.5';
}

// --- Playback History Management ---
function addToPlaybackHistory(song) {
    if (!song || !song.url) return;
    const existingIndex = playbackHistory.findIndex(item => item.url === song.url);
    if (existingIndex !== -1) {
        playbackHistory.splice(existingIndex, 1);
    }
    playbackHistory.unshift({
        url: song.url,
        title: song.title || 'Desconhecido',
        artist: song.artist || 'Desconhecido',
        cover: song.cover || '',
        timestamp: new Date().getTime()
    });
    const maxHistorySize = 20;
    if (playbackHistory.length > maxHistorySize) {
        playbackHistory.pop();
    }
    try {
        localStorage.setItem('playbackHistory', JSON.stringify(playbackHistory));
    } catch (error) {
        console.error("Erro ao salvar histórico de reprodução:", error);
    }
    updateRecentlyPlayedList();
}

function loadPlaybackHistory() {
    const savedHistory = localStorage.getItem('playbackHistory');
    if (savedHistory) {
        try {
            playbackHistory = JSON.parse(savedHistory);
            updateRecentlyPlayedList();
        } catch (error) {
            console.error("Erro ao carregar histórico de reprodução:", error);
            playbackHistory = [];
            try { localStorage.removeItem('playbackHistory'); } catch (e) { } // Clear corrupted history
        }
    }
}
// Adicione esta variável global no início com as outras
let selectedSongUrl = null;

// Atualize a função updateRecentlyPlayedList
function updateRecentlyPlayedList() {
    if (!recentlyPlayedList) return;

    recentlyPlayedList.innerHTML = '';
    if (playbackHistory.length === 0) {
        recentlyPlayedList.innerHTML = '<div class="no-recent">Nenhuma música tocada recentemente</div>';
        return;
    }

    playbackHistory.forEach((song) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item-recent';
        songItem.setAttribute('role', 'button');
        songItem.setAttribute('tabindex', '0');
        songItem.setAttribute('data-url', song.url);

        // Verifica se é a música atual
        if (currentAudio && currentAudio.src === song.url) {
            songItem.classList.add('playing');
        }

        // Verifica se é a música selecionada
        if (song.url === selectedSongUrl) {
            songItem.classList.add('selected');
        }

        const timeText = calculateRelativeTime(song.timestamp);

        songItem.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="song-thumbnail-recent" loading="lazy">
            <div class="song-details-recent">
                <div class="song-title-recent">${song.title}</div>
                <div class="song-artist-recent">${song.artist}</div>
            </div>
            <div class="song-time-recent" data-timestamp="${song.timestamp}">${timeText}</div>
        `;

        songItem.addEventListener('click', (e) => {
            // Remove seleção de todos os itens
            document.querySelectorAll('.song-item-recent').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Adiciona seleção ao item clicado
            songItem.classList.add('selected');
            selectedSongUrl = song.url;
            
            const mainListIndex = window.songsList.findIndex(s => s.arquivo === song.url);
            window.playSong(song.url, song.title, song.artist, song.cover, mainListIndex !== -1 ? mainListIndex : -1);
        });

        songItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Remove seleção de todos os itens
                document.querySelectorAll('.song-item-recent').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Adiciona seleção ao item clicado
                songItem.classList.add('selected');
                selectedSongUrl = song.url;
                songItem.click();
            }
        });

        recentlyPlayedList.appendChild(songItem);
    });
}


function calculateRelativeTime(timestamp) {
    if (!timestamp) return '';
    const now = new Date().getTime();
    const diffMillis = now - timestamp;
    const diffMinutes = Math.floor(diffMillis / (1000 * 60));
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours} h atrás`;
    }
    const days = Math.floor(diffMinutes / 1440);
    return `${days} d atrás`;
}

function updateRecentlyPlayedTimes() {
    const timeElements = document.querySelectorAll('#recently-played-list .song-time-recent'); // Ensure selector is correct
    if (!timeElements) return;
    timeElements.forEach(el => {
        const timestamp = parseInt(el.dataset.timestamp, 10);
        if (!isNaN(timestamp)) el.textContent = calculateRelativeTime(timestamp);
    });
}

// --- Core Player Logic ---
function addAudioListeners() {
    if (!currentAudio) return;
    // Remove existing listeners first to prevent duplicates
    currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
    currentAudio.removeEventListener('ended', handleSongEnd);
    currentAudio.removeEventListener('loadedmetadata', handleMetadataLoaded);
    currentAudio.removeEventListener('play', handlePlay);
    currentAudio.removeEventListener('pause', handlePause);
    currentAudio.removeEventListener('volumechange', handleVolumeChange);
    // Add new listeners
    currentAudio.addEventListener('timeupdate', handleTimeUpdate);
    currentAudio.addEventListener('ended', handleSongEnd);
    currentAudio.addEventListener('loadedmetadata', handleMetadataLoaded);
    currentAudio.addEventListener('play', handlePlay);
    currentAudio.addEventListener('pause', handlePause);
    currentAudio.addEventListener('volumechange', handleVolumeChange);
}

// ******** MODIFIED: Save state on time update ********
function handleTimeUpdate() {
    updateProgressBar();
    // Optional: Save state frequently during playback. Can be heavy.
    // Consider saving only every few seconds if needed, but saving on pause/seek/end is usually enough.
    // savePlayerState(); // Uncomment cautiously if frequent saving is desired
}

// ******** MODIFIED: Save state when metadata loads (includes duration) ********
function handleMetadataLoaded() {
    console.log("Metadados carregados. Duração:", currentAudio.duration);
    updateProgressBar(); // Update UI with duration
    // It's good to save here as we now have the duration and potentially initial currentTime
    savePlayerState();
}

function handleSongEnd() {
    console.log('Música terminou. Looping:', isLooping);
    if (isLooping) {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(e => console.error("Erro ao reiniciar loop:", e));
        // No need to save state here, loop state is already saved
    } else {
        playNextSong(); // playNextSong calls playSong, which saves state
    }
}
function handlePlay() {
    console.log("Audio Play event");
    isPlaying = true;
    updatePlayPauseIcon();
    // State is saved in playSong's .then() or togglePlayPause after successful play
    // savePlayerState(); // Avoid saving here, might be premature
}
// ******** MODIFIED: Save state on pause ********
// Modifique a função handlePause para manter o song-info visível mesmo quando pausado:
function handlePause() {
    console.log("Audio Pause event");
    isPlaying = false;
    updatePlayPauseIcon();
    savePlayerState();
    
    // Mantém o song-info visível mesmo quando pausado
    const songInfo = document.querySelector('.song-info');
    if (songInfo) {
        songInfo.classList.add('has-song');
        songInfo.style.opacity = '1';
        songInfo.style.transform = 'translateX(0)';
    }
}

// ******** MODIFIED: Save state on volume change (via slider usually) ********
function handleVolumeChange() {
    updateVolumeSlider(currentAudio.volume * 100);
    // Volume changes via the slider already trigger savePlayerState on drag end or click.
    // This handler updates the UI if volume changes programmatically.
    // savePlayerState(); // Avoid saving here unless volume can change without user interaction
}

// Variável global para controlar o estado do player
let playerInitialized = false;

window.playSong = function(url, title, artist, cover, index) {
    if (!url) { 
        console.error("URL da música inválida."); 
        return; 
    }
    
    console.log('Reproduzindo música:', { url, title, artist, cover, index });
    addToPlaybackHistory({ url, title, artist, cover });

    // Atualiza a exibição do song-info
    const songInfo = document.querySelector('.song-info');
    if (songInfo) {
        songInfo.classList.add('has-song');
        songInfo.style.opacity = '1';
        songInfo.style.transform = 'translateX(0)';
        playerInitialized = true;
    }

    // Pausa e limpa o áudio atual se existir
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
        currentAudio.removeEventListener('ended', handleSongEnd);
        currentAudio.removeEventListener('loadedmetadata', handleMetadataLoaded);
        currentAudio.removeEventListener('play', handlePlay);
        currentAudio.removeEventListener('pause', handlePause);
        currentAudio.removeEventListener('volumechange', handleVolumeChange);
        currentAudio.src = '';
        currentAudio = null;
    }

    // Cria novo objeto de áudio
    currentAudio = new Audio(url);
    addAudioListeners();

    // Configura volume baseado no estado salvo ou padrão
    const savedState = localStorage.getItem('playerState');
    let previousVolume = 0.5;
    if (savedState) {
        try {
            const playerState = JSON.parse(savedState);
            if (playerState.volume !== undefined) {
                previousVolume = playerState.volume;
            }
        } catch (e) { /* ignore parsing error, use default */ }
    }
    currentAudio.volume = previousVolume;

    // Atualiza a UI com os dados da música
    if (songCover) songCover.src = cover || '';
    if (songTitle) songTitle.textContent = title || 'Desconhecido';
    if (songArtist) songArtist.textContent = artist || 'Desconhecido';
    currentSongIndex = index;
    console.log('Índice da música atual:', currentSongIndex);

    // Tenta reproduzir a música
    currentAudio.play().then(() => {
        console.log('Música começou a tocar:', title);
        isPlaying = true;
        updatePlayPauseIcon();
        savePlayerState();
    }).catch((error) => {
        console.error('Erro ao reproduzir o áudio:', error);
        isPlaying = false;
        updatePlayPauseIcon();
    });
};

// Função para carregar o estado do player
function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
        try {
            const playerState = JSON.parse(savedState);
            console.log("Estado do player carregado:", playerState);

            if (playerState.url) {
                playerInitialized = true;
                
                // Atualiza a UI com os dados salvos
                const songInfo = document.querySelector('.song-info');
                if (songInfo) {
                    songInfo.classList.add('has-song');
                    songInfo.style.opacity = '1';
                    songInfo.style.transform = 'translateX(0)';
                }
                
                if (songCover) songCover.src = playerState.cover || '';
                if (songTitle) songTitle.textContent = playerState.title || 'Desconhecido';
                if (songArtist) songArtist.textContent = playerState.artist || 'Desconhecido';
                
                // Cria o objeto de áudio mas não toca automaticamente (evitar autoplay bloqueado)
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.src = '';
                }
                
                currentAudio = new Audio(playerState.url);
                addAudioListeners();
                currentAudio.volume = playerState.volume || 0.5;
                currentAudio.currentTime = playerState.currentTime || 0;
                
                // Atualiza o estado de reprodução
                isPlaying = false; // Começa como pausado
                updatePlayPauseIcon();
                
                // Se estava tocando, tenta retomar a reprodução
                if (playerState.isPlaying) {
                    setTimeout(() => {
                        currentAudio.play().then(() => {
                            isPlaying = true;
                            updatePlayPauseIcon();
                        }).catch(e => {
                            console.log("Autoplay bloqueado:", e);
                        });
                    }, 100);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar estado:", error);
        }
    }
}

// E a função clearPlayerState para resetar o estado
function clearPlayerState() {
    try {
        localStorage.removeItem('playerState');
        console.log("Estado do player limpo.");
        playerInitialized = false;
    } catch (error) {
        console.error("Erro ao limpar estado:", error);
    }
}

// ******** REVISED: Handle Play Event ********
function handlePlay() {
    // This event fires when playback *actually* begins successfully.
    console.log("Evento 'play' disparado.");
    if (!isPlaying) { // Update state only if it wasn't already considered playing
        isPlaying = true;
        updatePlayPauseIcon();
        savePlayerState(); // Save the state *confirming* playback has started
    } else {
        // If isPlaying was already true (e.g., set optimistically in loadPlayerState),
        // ensure UI is correct, but maybe avoid redundant save.
        updatePlayPauseIcon();
    }
}

// ******** REVISED: Handle Pause Event ********
function handlePause() {
    // This event fires when playback *actually* pauses (user click, end of song without loop, etc.)
    console.log("Evento 'pause' disparado.");
    if (isPlaying) { // Update state only if it wasn't already considered paused
        isPlaying = false;
        updatePlayPauseIcon();
        savePlayerState(); // Save the state *confirming* pause
    } else {
        // If isPlaying was already false (e.g., set in loadPlayerState catch block),
        // ensure UI is correct, but avoid redundant save.
        updatePlayPauseIcon();
    }
    // Special case: if pause happens right at the end, avoid saving near-duration time
    // (This might need more complex logic if seeking near the end causes issues)
    // if (currentAudio && Math.abs(currentAudio.currentTime - currentAudio.duration) < 0.1) {
    // console.log("Pause perto do fim, não salvando estado para evitar loop estranho.");
    // } else {
    // savePlayerState(); // Save the state *confirming* pause
    // }
}
// ******** MODIFIED: Save state on pause/play toggle ********
function togglePlayPause() {
    if (!currentAudio) {
        console.log("Nenhuma música carregada para tocar/pausar.");
        // Try loading the first song if available
        if (window.songsList && window.songsList.length > 0) {
            const firstSong = window.songsList[0];
            console.log("Tentando tocar a primeira música da lista.");
            window.playSong(firstSong.arquivo, firstSong.titulo, firstSong.artista, firstSong.capa, 0);
        } else {
            console.log("Nenhuma música na lista para iniciar.");
        }
        return;
    }
    if (isPlaying) {
        currentAudio.pause(); // handlePause will save state
    } else {
        // Check if audio is ready (avoid errors if called too quickly after loading)
        if (currentAudio.readyState >= 2) { // HAVE_CURRENT_DATA or more
            currentAudio.play().then(() => {
                // isPlaying and UI update is handled by 'handlePlay'
                // We save state AFTER play is confirmed (in handlePlay or here)
                console.log("Reprodução retomada via toggle.");
                // Redundant save here? handlePlay/handlePause should cover. Let's rely on them.
                // savePlayerState(); // Let's comment this out, rely on play/pause events
            }).catch((error) => {
                console.error("Erro ao retomar a reprodução:", error);
                isPlaying = false; // Ensure state is correct on error
                updatePlayPauseIcon();
            });
        } else {
            console.log("Áudio não está pronto para tocar, tentando carregar...");
            // Attempt to load data if not ready
            currentAudio.load();
            // Optionally try playing again after a short delay, or let user click again
        }
    }
}

function updatePlayPauseIcon() {
    if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
        if (playPauseContainer) {
            playPauseContainer.classList.toggle('playing', isPlaying);
            // Update accessibility attribute
            playPauseContainer.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Tocar');
        }
    }
}

function playNextSong() {
    console.log('Tentando tocar próxima música.');
    if (!window.songsList || window.songsList.length === 0) {
        console.error('Lista de músicas não carregada ou vazia.');
        if (currentAudio) { currentAudio.pause(); }
        setInitialPlayerUI(); // Reset UI
        clearPlayerState(); // Clear state if list is gone
        return;
    }
    let nextIndex;
    if (isShuffled) {
        if (window.songsList.length <= 1) {
            nextIndex = 0;
        } else {
            // Ensure the next random index is different from the current one
            do {
                nextIndex = Math.floor(Math.random() * window.songsList.length);
            } while (nextIndex === currentSongIndex);
        }
        console.log('Próxima música aleatória. Índice:', nextIndex);
    } else {
        nextIndex = (currentSongIndex + 1) % window.songsList.length;
        console.log('Próxima música na lista. Índice:', nextIndex);
    }
    const nextSong = window.songsList[nextIndex];
    if (nextSong && nextSong.arquivo) {
        window.playSong(nextSong.arquivo, nextSong.titulo, nextSong.artista, nextSong.capa, nextIndex);
    } else {
        console.error(`Próxima música inválida (índice ${nextIndex}). Parando reprodução.`);
        if (currentAudio) { currentAudio.pause(); }
        setInitialPlayerUI(); // Reset UI
        clearPlayerState(); // Clear state if next song is invalid
    }
}

function playPreviousSong() {
    console.log('Tentando tocar música anterior.');
    if (!window.songsList || window.songsList.length === 0) {
        console.error('Lista de músicas não carregada ou vazia.');
        if (currentAudio) { currentAudio.pause(); }
        setInitialPlayerUI();
        clearPlayerState();
        return;
    }

    // If played for more than 3 seconds (and not shuffling), restart current song
    if (currentAudio && currentAudio.currentTime > 3 && !isShuffled) {
        console.log("Reiniciando música atual.");
        currentAudio.currentTime = 0;
        if (isPlaying) {
            currentAudio.play().catch(e => console.error("Erro ao reiniciar:", e));
        }
        savePlayerState(); // Save the reset time
        return;
    }

    let prevIndex;
    if (isShuffled) {
        if (window.songsList.length <= 1) {
            prevIndex = 0;
        } else {
            // Ensure the previous random index is different from the current one
            do {
                prevIndex = Math.floor(Math.random() * window.songsList.length);
            } while (prevIndex === currentSongIndex);
        }
        console.log('Música anterior aleatória. Índice:', prevIndex);
    } else {
        // Calculate previous index correctly, wrapping around
        prevIndex = (currentSongIndex - 1 + window.songsList.length) % window.songsList.length;
        console.log('Música anterior na lista. Índice:', prevIndex);
    }
    const prevSong = window.songsList[prevIndex];
    if (prevSong && prevSong.arquivo) {
        window.playSong(prevSong.arquivo, prevSong.titulo, prevSong.artista, prevSong.capa, prevIndex);
    } else {
        console.error(`Música anterior inválida (índice ${prevIndex}). Parando reprodução.`);
        if (currentAudio) { currentAudio.pause(); }
        setInitialPlayerUI();
        clearPlayerState();
    }
}

// ******** MODIFIED: Save state when toggling loop ********
function toggleLoop() {
    isLooping = !isLooping;
    console.log('Alternando looping:', isLooping);
    if (loopButton) {
        loopButton.style.opacity = isLooping ? '1' : '0.5';
        loopButton.setAttribute('aria-checked', isLooping);
        savePlayerState(); // Save the new loop state
    } else {
        console.error('Botão de looping não encontrado.');
    }
}

// ******** MODIFIED: Save state when toggling shuffle ********
function toggleShuffle() {
    isShuffled = !isShuffled;
    console.log('Alternando shuffle:', isShuffled);
    if (shuffleButton) {
        shuffleButton.style.opacity = isShuffled ? '1' : '0.5';
        shuffleButton.setAttribute('aria-checked', isShuffled);
        savePlayerState(); // Save the new shuffle state
    } else {
        console.error('Botão aleatório não encontrado.');
    }
}

// ******** MODIFIED: Update progress bar, ensure displays reset correctly ********
function updateProgressBar() {
    if (currentAudio && progressBar && progressThumb && currentTimeDisplay && totalTimeDisplay) {
        const currentTime = currentAudio.currentTime;
        const duration = currentAudio.duration;

        // Check for valid duration
        if (duration && isFinite(duration) && duration > 0) {
            const progressPercentage = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // Calculate thumb position based on container width if available
            if (progressBarContainer) {
                const containerWidth = progressBarContainer.offsetWidth;
                const thumbWidth = progressThumb.offsetWidth;
                // Ensure thumb doesn't go past the edges
                const maxLeft = containerWidth - thumbWidth;
                const thumbLeft = Math.max(0, Math.min(maxLeft, (progressPercentage / 100) * containerWidth - (thumbWidth / 2)));
                progressThumb.style.left = `${thumbLeft}px`;
            } else {
                // Fallback if container ref is not reliable
                progressThumb.style.left = `calc(${progressPercentage}% - ${progressThumb.offsetWidth / 2}px)`;
            }

            currentTimeDisplay.textContent = formatTime(currentTime);
            totalTimeDisplay.textContent = formatTime(duration);
        } else {
            // Reset if duration is not valid (e.g., before loading)
            progressBar.style.width = '0%';
            progressThumb.style.left = '0%'; // Adjust based on thumb centering
            currentTimeDisplay.textContent = '0:00';
            totalTimeDisplay.textContent = '0:00'; // Or '--:--'
        }
    } else {
        // Reset if no audio element
        if (progressBar) progressBar.style.width = '0%';
        if (progressThumb) progressThumb.style.left = '0%';
        if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
        if (totalTimeDisplay) totalTimeDisplay.textContent = '0:00';
    }
}

// ******** MODIFIED: Save state after seeking ********
function handleProgressBarSeek(event) {
    if (currentAudio && currentAudio.duration && isFinite(currentAudio.duration) && progressBarContainer) {
        const progressBarRect = progressBarContainer.getBoundingClientRect();
        const clickX = event.clientX - progressBarRect.left;
        // Ensure percentage is between 0 and 1
        const percentage = Math.max(0, Math.min(1, clickX / progressBarRect.width));
        currentAudio.currentTime = currentAudio.duration * percentage;
        updateProgressBar(); // Update UI immediately
        savePlayerState(); // Save the new time state
    }
}

// --- Volume Control Logic ---
function handleVolumeDragMove(event) {
    if (!isVolumeDragging) return;
    updateVolumeFromEvent(event);
    // Don't save on every move, only on release (handleVolumeDragEnd)
}
// ******** MODIFIED: Save state after volume drag ends ********
function handleVolumeDragEnd() {
    if (!isVolumeDragging) return;
    isVolumeDragging = false;
    if (volumeSliderContainer) volumeSliderContainer.classList.remove('is-dragging');
    document.removeEventListener('mousemove', handleVolumeDragMove);
    // document.removeEventListener('mouseup', handleVolumeDragEnd); // Removed in setup
    savePlayerState(); // Save final volume state after drag
}
function updateVolume(percentage) {
    percentage = Math.max(0, Math.min(100, percentage));
    if (currentAudio) {
        currentAudio.volume = percentage / 100; // Update audio object volume
    }
    updateVolumeSlider(percentage); // Update UI
}
function updateVolumeFromEvent(event) {
    if (!volumeSliderContainer) return;
    const containerRect = volumeSliderContainer.getBoundingClientRect();
    const clickX = event.clientX - containerRect.left;
    const percentage = (containerRect.width > 0) ? Math.max(0, Math.min(100, (clickX / containerRect.width) * 100)) : 0;
    updateVolume(percentage); // This updates both UI and audio object
}
function updateVolumeSlider(percentage) {
    // Only updates the visual slider elements
    percentage = Math.max(0, Math.min(100, percentage));
    if (volumeSliderProgress) volumeSliderProgress.style.width = `${percentage}%`;
    if (volumeSliderThumb && volumeSliderContainer) {
        const containerWidth = volumeSliderContainer.offsetWidth;
        const thumbWidth = volumeSliderThumb.offsetWidth;
        const maxLeft = containerWidth - thumbWidth;
        const thumbLeft = Math.max(0, Math.min(maxLeft, (percentage / 100) * containerWidth - (thumbWidth / 2)));
        volumeSliderThumb.style.left = `${thumbLeft}px`;
    } else if (volumeSliderThumb) {
        // Fallback
        volumeSliderThumb.style.left = `calc(${percentage}% - ${volumeSliderThumb.offsetWidth / 2}px)`;
    }
}


// --- Sidebar Custom Scrollbar (Left Sidebar) ---
// No changes needed in this section for player state
function setupLeftSidebarScrollbar() {
    if (!leftSidebar || !leftScrollbar) return;

    function updateScrollbarVisibilityAndPosition() {
        const scrollableHeight = leftSidebar.scrollHeight - leftSidebar.clientHeight;
        if (scrollableHeight <= 0) {
            leftScrollbar.style.display = 'none';
        } else {
            leftScrollbar.style.display = '';
            const scrollPercentage = leftSidebar.scrollTop / scrollableHeight;
            const thumbHeightPercentage = (leftSidebar.clientHeight / leftSidebar.scrollHeight) * 100;
            const thumbTopPercentage = scrollPercentage * (100 - thumbHeightPercentage);
            leftScrollbar.style.height = `${thumbHeightPercentage}%`;
            leftScrollbar.style.top = `${thumbTopPercentage}%`;
        }
    }

    leftSidebar.addEventListener('scroll', updateScrollbarVisibilityAndPosition);
    let dragStartY, dragStartScrollTop;

    leftScrollbar.addEventListener('mousedown', function (e) {
        e.preventDefault(); e.stopPropagation(); isScrollbarDragging = true;
        dragStartY = e.clientY; dragStartScrollTop = leftSidebar.scrollTop;
        leftScrollbar.classList.add('is-dragging');
        document.addEventListener('mousemove', handleScrollbarDrag);
        document.addEventListener('mouseup', handleScrollbarDragEnd, { once: true });
    });

    function handleScrollbarDrag(e) {
        if (!isScrollbarDragging) return;
        const deltaY = e.clientY - dragStartY;
        const scrollableHeight = leftSidebar.scrollHeight - leftSidebar.clientHeight;
        if (scrollableHeight <= 0) return; // Avoid division by zero or negative ratios
        // Calculate scroll distance based on how far the mouse moved relative to the sidebar height
        const scrollRatio = scrollableHeight / leftSidebar.clientHeight;
        const newScrollTop = dragStartScrollTop + (deltaY * scrollRatio);
        leftSidebar.scrollTop = Math.max(0, Math.min(newScrollTop, scrollableHeight));
    }

    function handleScrollbarDragEnd() { // Renamed to avoid conflict
        if (!isScrollbarDragging) return; isScrollbarDragging = false;
        leftScrollbar.classList.remove('is-dragging');
        document.removeEventListener('mousemove', handleScrollbarDrag);
        // No need to remove mouseup here, {once: true} handles it
    }

    // Initial setup and responsiveness
    updateScrollbarVisibilityAndPosition();
    // Use ResizeObserver for better performance than 'resize' event if available
    if ('ResizeObserver' in window) {
        new ResizeObserver(updateScrollbarVisibilityAndPosition).observe(leftSidebar);
    } else {
        window.addEventListener('resize', updateScrollbarVisibilityAndPosition);
    }
}


// --- Sidebar Open/Close Toggle (Left Sidebar) ---
// No changes needed in this section for player state
function setupLeftSidebarToggle() {
    if (!leftSidebar || !closeSidebarButton || !openSidebarButton || !categoryTitles) return;

    const updateSidebarView = () => {
        const isClosed = leftSidebar.classList.contains('closed');
        closeSidebarButton.style.display = isClosed ? 'none' : 'flex';
        openSidebarButton.style.display = isClosed ? 'flex' : 'none';
        categoryTitles.forEach(title => { title.style.display = isClosed ? 'none' : 'block'; });
        // Update ARIA states for accessibility
        leftSidebar.setAttribute('aria-hidden', isClosed);
        closeSidebarButton.setAttribute('aria-expanded', !isClosed);
        openSidebarButton.setAttribute('aria-expanded', isClosed);
        // Focus management (optional but good for accessibility)
        // if (isClosed) openSidebarButton.focus(); else closeSidebarButton.focus();
    };

    closeSidebarButton.addEventListener('click', () => {
        leftSidebar.classList.add('closed');
        updateSidebarView();
        // Optional: save sidebar state in localStorage too
        // localStorage.setItem('sidebarState', 'closed');
    });
    openSidebarButton.addEventListener('click', () => {
        leftSidebar.classList.remove('closed');
        updateSidebarView();
        // Optional: save sidebar state
        // localStorage.setItem('sidebarState', 'open');
    });

    // Optional: Load initial sidebar state from localStorage
    // const savedSidebarState = localStorage.getItem('sidebarState');
    // if (savedSidebarState === 'closed') {
    //    leftSidebar.classList.add('closed');
    // }

    updateSidebarView(); // Set initial state based on current class
}


// --- Main Artist Carousel (Sliding Track) ---
// No changes needed in this section for player state
function setupMainArtistCarousel() {
    // Uses 'mainCarousel...' selectors
    if (!mainCarouselTrack || !mainCarouselDotsContainer || !mainCarouselArtistNameElement || !mainCarouselPrevButton || !mainCarouselNextButton || !mainArtistCarouselElement) {
        console.warn("Elementos do carrossel principal de artistas não encontrados. Pulando setup.");
        return;
    }

    // Placeholder - Assuming this carousel logic exists elsewhere or is simple
    console.log("Setup Main Artist Carousel - Funcionalidade assumida existente.");
    // Basic listeners to prevent errors if elements exist
    mainCarouselPrevButton.addEventListener('click', () => console.log("Main Prev Clicked"));
    mainCarouselNextButton.addEventListener('click', () => console.log("Main Next Clicked"));

    // Add minimal interaction handling if needed (like pausing on hover)
    mainArtistCarouselElement.addEventListener('mouseenter', () => {
        // stopAutoPlay(); // Assumes stopAutoPlay function exists for this carousel
        console.log("Main Carousel Hover Enter");
    });
    mainArtistCarouselElement.addEventListener('mouseleave', () => {
        // startAutoPlay(); // Assumes startAutoPlay function exists for this carousel
        console.log("Main Carousel Hover Leave");
    });

    // NOTE: The detailed implementation needs to be provided based on how
    // this specific carousel works (e.g., using transforms, slide indexes, etc.)
}

// --- Right Sidebar Artist Carousel (Image/Name Swap) ---
// No changes needed in this section for player state
function setupRightSidebarCarousel() {
    console.log("Setting up Right Sidebar Carousel");
    if (!rightSidebar) { console.warn("Right sidebar element (.right-sidebar) not found."); return; }

    const artistImageElement = rightSidebar.querySelector('.artist-image');
    const artistNameElement = rightSidebar.querySelector('.artist-name');
    const dotsContainer = rightSidebar.querySelector('.carousel-dots');
    const featuredArtistContainer = rightSidebar.querySelector('.featured-artist'); // Container for hover detection

    if (!artistImageElement || !artistNameElement || !dotsContainer || !featuredArtistContainer) {
        console.warn("Required elements (artist-image, artist-name, carousel-dots, featured-artist) not found within .right-sidebar.");
        return;
    }

    // Example data (replace with dynamic data if needed)
    const artistData = [
        { image: "https://i.guim.co.uk/img/media/2bbb941e971a80780e75c1ab9c5023a8e6a12361/0_93_3326_1996/master/3326.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=17b9bf94d69763c5e701ba9e76e8f585", name: "Yeat" },
        { image: "https://s2-g1.glbimg.com/4YCTQOs7a47qPX73Lm25vw3rows=/0x0:1600x1600/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2020/W/A/7wBV8eTXeqgitO5JASRg/capa-matue-mdt.jpg", name: "Matue" },
        { image: "https://cdn-images.dzcdn.net/images/artist/7f3c0956357c326b2db2cf436f1dc8c5/1900x1900-000000-80-0-0.jpg", name: "Bruno Mars" },
        { image: "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2024/03/Lady-Gaga-1-e1711653611367.jpg", name: "Lady Gaga" }
    ];
    let currentIndex = 0;
    const autoPlayInterval = 6000; // 6 seconds

    function createDots() {
        dotsContainer.innerHTML = ''; // Clear existing dots
        if (artistData.length <= 1) {
            dotsContainer.style.display = 'none'; // Hide dots if only one or zero artists
            return;
        }
        dotsContainer.style.display = ''; // Show dots container
        artistData.forEach((artist, index) => {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('aria-label', `Mostrar artista ${index + 1}: ${artist.name}`);
            if (index === currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true'); // Accessibility
            }
            dot.addEventListener('click', () => {
                stopAutoPlay();
                goToSlide(index);
                startAutoPlay(); // Restart timer after manual change
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarouselDisplay() {
        if (artistData.length === 0) return;
        const currentArtist = artistData[currentIndex];
        if (!currentArtist) return; // Should not happen if length > 0

        // Add transition effect (optional)
        featuredArtistContainer.style.opacity = '0'; // Fade out
        setTimeout(() => {
            artistImageElement.src = currentArtist.image;
            artistImageElement.alt = `Artista Destaque: ${currentArtist.name}`;
            artistNameElement.textContent = currentArtist.name;
            // Update dots
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                const isActive = index === currentIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
            featuredArtistContainer.style.opacity = '1'; // Fade in
        }, 150); // Match CSS transition duration


    }

    function goToSlide(index) {
        if (artistData.length === 0) return;
        // Ensure index wraps around correctly
        currentIndex = (index + artistData.length) % artistData.length;
        updateCarouselDisplay();
    }

    function nextSlide() {
        if (artistData.length === 0) return;
        currentIndex = (currentIndex + 1) % artistData.length;
        updateCarouselDisplay();
    }

    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval first
        if (artistData.length > 1) { // Only autoplay if more than one item
            rightSidebarCarouselIntervalId = setInterval(nextSlide, autoPlayInterval);
        }
    }

    function stopAutoPlay() {
        clearInterval(rightSidebarCarouselIntervalId);
        rightSidebarCarouselIntervalId = null;
    }

    // Initialization
    if (artistData.length > 0) {
        createDots();
        updateCarouselDisplay(); // Show the first artist immediately
        startAutoPlay(); // Start automatic cycling

        // Pause autoplay on hover
        featuredArtistContainer.addEventListener('mouseenter', stopAutoPlay);
        featuredArtistContainer.addEventListener('mouseleave', startAutoPlay);
        // Add focus handlers for accessibility (pause when focused)
        featuredArtistContainer.addEventListener('focusin', stopAutoPlay);
        featuredArtistContainer.addEventListener('focusout', startAutoPlay);

    } else {
        // Hide the carousel section if there's no data
        featuredArtistContainer.style.display = 'none';
        dotsContainer.style.display = 'none';
        console.log("No artist data for right sidebar carousel, hiding section.");
    }
}


// --- Data Loading Functions ---
// No changes needed in these for player state, but ensure playSong is called correctly
async function carregarMusicas() {
    if (!popularSongsContainer) return;
    try {
        const response = await fetch('/buscar-musicas/'); // Ensure this endpoint is correct
        if (!response.ok) throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Formato de resposta inválido (esperado array de músicas).");

        window.songsList = data; // Update global song list
        console.log(`Carregadas ${window.songsList.length} músicas.`);
        popularSongsContainer.innerHTML = ''; // Clear previous content

        // Sort by views (descending) and take top N
        const sortedData = [...data].sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0));
        const maxSongsToShow = 12;
        const musicasParaExibir = sortedData.slice(0, maxSongsToShow);

        if (musicasParaExibir.length === 0) {
            popularSongsContainer.innerHTML = '<p class="info-message">Nenhuma música popular encontrada.</p>';
            return;
        }

        musicasParaExibir.forEach((musica) => {
            // Basic validation for essential properties
            if (!musica || !musica.arquivo || !musica.titulo || !musica.artista || !musica.capa) {
                console.warn("Item de música inválido ou incompleto, pulando:", musica);
                return;
            }
            const musicaItem = document.createElement('div');
            musicaItem.classList.add('popular-item');
            musicaItem.setAttribute('role', 'button');
            musicaItem.setAttribute('tabindex', '0');
            musicaItem.setAttribute('aria-label', `Tocar ${musica.titulo} por ${musica.artista}`);
            const duracaoFormatada = formatTime(musica.duracao || 0); // Format duration safely

            // Use textContent for security where possible
            musicaItem.innerHTML = `
                <img src="${musica.capa}" alt="Capa de ${musica.titulo}" class="popular-cover" loading="lazy">
                <img src="https://i.postimg.cc/MZQ9dq49/favorito-icons.png" alt="Curtir ${musica.titulo}" class="heart-icon" role="button" aria-label="Curtir ${musica.titulo}" tabindex="0">
                <div class="song-info-popular">
                    <div class="song-title-popular"></div>
                    <div class="song-subtitle-popular"></div>
                </div>
                <div class="song-album-popular"></div>
                <div class="song-details-popular">
                    <div class="song-duration-popular">
                        <span>${duracaoFormatada}</span>
                        <img src="https://i.postimg.cc/FsXD6wXN/maisinfo-icons.png" alt="Mais opções para ${musica.titulo}" class="options-icon-popular" role="button" aria-label="Mais opções para ${musica.titulo}" tabindex="0">
                    </div>
                </div>`;

            // Set text content safely
            musicaItem.querySelector('.song-title-popular').textContent = musica.titulo;
            musicaItem.querySelector('.song-subtitle-popular').textContent = musica.artista;
            musicaItem.querySelector('.song-album-popular').textContent = musica.album || 'Single'; // Default to 'Single' if no album

            // Event listener for playing the song (on the main item, ignore clicks on icons)
            musicaItem.addEventListener('click', (e) => {
                // Only play if the click is not on an interactive icon inside the item
                if (e.target.closest('.heart-icon, .options-icon-popular')) {
                    console.log("Click on icon ignored for playback.");
                    return;
                }
                // Find the index in the GLOBAL list
                const globalIndex = window.songsList.findIndex(song => song.arquivo === musica.arquivo);
                if (globalIndex !== -1) {
                    window.playSong(musica.arquivo, musica.titulo, musica.artista, musica.capa, globalIndex);
                } else {
                    console.error("Música não encontrada na lista global:", musica.titulo);
                    // Fallback: play anyway but index might be wrong for next/prev
                    window.playSong(musica.arquivo, musica.titulo, musica.artista, musica.capa, -1);
                }
            });

            // Keyboard accessibility
            musicaItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { // Handle Enter and Spacebar
                    if (!e.target.closest('.heart-icon, .options-icon-popular')) {
                        e.preventDefault(); // Prevent scrolling on Spacebar
                        const globalIndex = window.songsList.findIndex(song => song.arquivo === musica.arquivo);
                        window.playSong(musica.arquivo, musica.titulo, musica.artista, musica.capa, globalIndex !== -1 ? globalIndex : -1);
                    }
                }
            });

            // Add listeners for heart/options icons if needed
            const heartIcon = musicaItem.querySelector('.heart-icon');
            const optionsIcon = musicaItem.querySelector('.options-icon-popular');
            if (heartIcon) heartIcon.addEventListener('click', () => console.log('Heart clicked:', musica.titulo));
            if (optionsIcon) optionsIcon.addEventListener('click', () => console.log('Options clicked:', musica.titulo));


            popularSongsContainer.appendChild(musicaItem);
        });

        // After loading songs, check if we need to restore player state
        // loadPlayerState(); // Moved to the end after all initial content loading

    } catch (error) {
        console.error('Erro ao carregar músicas populares:', error);
        popularSongsContainer.innerHTML = `<p class="error-message">Não foi possível carregar as músicas. ${error.message}</p>`;
    }
}

async function carregarAlbuns() {
    if (!albumGrid) return;
    try {
        const response = await fetch('/buscar-albuns/'); // Ensure endpoint is correct
        if (!response.ok) throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Formato de resposta inválido (esperado array de álbuns).");

        albumGrid.innerHTML = ''; // Clear previous content
        if (data.length === 0) {
            albumGrid.innerHTML = '<p class="info-message">Nenhum álbum encontrado.</p>';
            return;
        }

        data.forEach(album => {
            if (!album || !album.capa || !album.album || !album.artista) {
                console.warn("Item de álbum inválido ou incompleto, pulando:", album);
                return;
            }
            const albumItem = document.createElement('div');
            albumItem.classList.add('album-item');
            // Add role and tabindex for potential future interaction/accessibility
            albumItem.setAttribute('role', 'listitem'); // Or 'button' if clickable
            // albumItem.setAttribute('tabindex', '0');

            albumItem.innerHTML = `
                <img src="${album.capa}" alt="Capa do Álbum ${album.album}" class="album-cover" loading="lazy">
                <div class="album-details">
                    <div class="album-title"></div>
                    <div class="album-info"></div>
                </div>`;

            // Set text content safely
            albumItem.querySelector('.album-title').textContent = album.album;
            const albumInfoText = `${album.artista} • ${album.ano || 'Ano desc.'} • Álbum`;
            albumItem.querySelector('.album-info').textContent = albumInfoText;


            // Add click listener if albums should be interactive
            // albumItem.addEventListener('click', () => {
            //    console.log('Album clicked:', album.album);
            //    // Navigate to album page or load album songs, etc.
            // });

            albumGrid.appendChild(albumItem);
        });
    } catch (error) {
        console.error('Erro ao carregar álbuns:', error);
        albumGrid.innerHTML = `<p class="error-message">Não foi possível carregar os álbuns. ${error.message}</p>`;
    }
}

async function carregarArtistas() {
    if (!artistasContainer) return;
    try {
        const response = await fetch('/buscar-artistas/'); // Ensure endpoint is correct
        if (!response.ok) throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Formato de resposta inválido (esperado array de artistas).");

        console.log('Artistas recebidos:', data);
        artistasContainer.innerHTML = ''; // Clear previous content
        if (data.length === 0) {
            artistasContainer.innerHTML = '<p class="info-message">Nenhum artista encontrado.</p>';
            return;
        }

        data.forEach(artista => {
            if (!artista || !artista.capa_artista || !artista.artista) {
                console.warn("Item de artista inválido ou incompleto, pulando:", artista);
                return;
            }
            const artistaItem = document.createElement('div');
            artistaItem.classList.add('artista-item');
            artistaItem.setAttribute('role', 'listitem'); // Or 'button'
            // artistaItem.setAttribute('tabindex', '0');

            artistaItem.innerHTML = `
                <img src="${artista.capa_artista}" alt="Foto de ${artista.artista}" class="artista-imagem" loading="lazy">
                <div class="artista-details">
                    <div class="artista-title"></div>
                    <div class="artista-info">Artista</div>
                </div>`;

            // Set text content safely
            artistaItem.querySelector('.artista-title').textContent = artista.artista;

            // Add click listener if artists should be interactive
            // artistaItem.addEventListener('click', () => {
            //    console.log('Artista clicked:', artista.artista);
            //    // Navigate to artist page, etc.
            // });

            artistasContainer.appendChild(artistaItem);
        });
    } catch (error) {
        console.error('Erro ao carregar artistas:', error);
        artistasContainer.innerHTML = `<p class="error-message">Não foi possível carregar os artistas. ${error.message}</p>`;
    }
}

// --- Search Logic ---
function setupSearch() {
    if (!searchInput || !searchButton) {
        console.warn("Elementos de busca (input ou botão) não encontrados.");
        return;
    }

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // Ensure the URL is correctly formed for your backend/routing
            window.location.href = `/pesquisa_music/?q=${encodeURIComponent(query)}`;
        } else {
            // Optionally provide feedback if search is empty
            searchInput.focus(); // Focus the input if empty
            // searchInput.placeholder = "Digite algo para pesquisar...";
        }
    }

    // Use keydown for Enter key for better responsiveness than keypress
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    searchButton.addEventListener('click', performSearch);
}

// --- Event Listener Setup ---
function setupEventListeners() {
    // Player Controls
    if (playPauseContainer) {
        playPauseContainer.addEventListener('click', togglePlayPause);
    } else console.warn("Play/Pause container not found.");

    if (loopButton) {
        loopButton.addEventListener('click', toggleLoop);
    } else console.warn("Loop button not found.");

    if (shuffleButton) {
        shuffleButton.addEventListener('click', toggleShuffle);
    } else console.warn("Shuffle button not found.");

    if (proximaButton) {
        proximaButton.addEventListener('click', playNextSong);
    } else console.warn("Next button not found.");

    if (anteriorButton) {
        anteriorButton.addEventListener('click', playPreviousSong);
    } else console.warn("Previous button not found.");

    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', handleProgressBarSeek);
        // Add dragging support for progress bar thumb (optional but nice UX)
        // Requires adding mousedown on thumb, mousemove/mouseup on document
    } else console.warn("Progress bar container not found.");


    // Volume Controls
    if (volumeSliderContainer) {
        // Click on the volume bar (but not the thumb itself)
        volumeSliderContainer.addEventListener('click', (event) => {
            // Ensure the click wasn't directly on the thumb
            if (!event.target.closest('.volume-slider-thumb')) {
                updateVolumeFromEvent(event);
                savePlayerState(); // Save state after direct click adjustment
            }
        });

        // Start dragging the thumb
        const thumb = volumeSliderContainer.querySelector('.volume-slider-thumb');
        if (thumb) {
            thumb.addEventListener('mousedown', (event) => {
                event.stopPropagation(); // Prevent click listener on container firing
                isVolumeDragging = true;
                volumeSliderContainer.classList.add('is-dragging');
                // No need to update volume on mousedown, move will handle it
                document.addEventListener('mousemove', handleVolumeDragMove);
                document.addEventListener('mouseup', handleVolumeDragEnd, { once: true });
            });
        } else console.warn("Volume slider thumb not found.");

    } else console.warn("Volume slider container not found.");


    // Global listener for mouse leaving window during drag (to release drag state)
    document.addEventListener('mouseleave', () => {
        if (isVolumeDragging) {
            console.log("Mouse left window during volume drag, ending drag.");
            handleVolumeDragEnd(); // Trigger the end drag logic which includes saving state
        }
        if (isScrollbarDragging) { // Handle sidebar scroll drag end
            const dragEndFunc = handleScrollbarDragEnd; // Get ref to the function
            if (dragEndFunc) dragEndFunc(); // Defined in setupLeftSidebarScrollbar
        }
    });

    // ******** ADDED: Save state before unload (optional but can catch some edge cases) ********
    window.addEventListener('beforeunload', () => {
        console.log("beforeunload event: Saving final player state.");
        // Only save if audio is loaded and potentially playing/paused
        if (currentAudio && currentAudio.src) {
            // Update currentTime just before saving, in case it changed recently
            if (isPlaying) { // Get the very latest time if playing
                // No reliable way to get *exact* time here synchronously.
                // The state saved on last pause/seek/etc. is usually sufficient.
            }
            savePlayerState();
        }
    });
}

// --- Initialization Sequence ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Iniciando configuração e carregamento.");

    // 1. Setup UI interactions first (buttons, sliders, sidebars, carousels, search)
    console.log("Configurando listeners de eventos e UI...");
    setupEventListeners();         // Player controls, volume
    setupLeftSidebarScrollbar();   // Left sidebar custom scroll
    setupLeftSidebarToggle();      // Left sidebar open/close
    setupMainArtistCarousel();     // Main content carousel
    setupRightSidebarCarousel();   // Right sidebar featured artist carousel
    setupSearch();                 // Search input/button

    // 2. Load dynamic content (songs, albums, artists)
    console.log("Iniciando carregamento de dados (músicas, álbuns, artistas)...");
    Promise.allSettled([
        carregarMusicas(),
        carregarAlbuns(),
        carregarArtistas()
    ]).then(results => {
        console.log("Carregamento de conteúdo principal concluído (parcial ou total).");
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const contentName = ['músicas', 'álbuns', 'artistas'][index];
                console.error(`Falha ao carregar ${contentName}:`, result.reason);
            }
        });

        // 3. Load persistent states AFTER content is potentially loaded (especially songsList)
        console.log("Carregando estado do player e histórico de reprodução...");
        loadPlaybackHistory(); // Load history first
        loadPlayerState();     // ******** LOAD PLAYER STATE HERE ********

        // 4. Start periodic updates
        console.log("Iniciando timers periódicos (atualização de tempo do histórico)...");
        setInterval(updateRecentlyPlayedTimes, 60000); // Update history relative time every minute

        console.log("Aplicação Totalmente Inicializada e pronta.");

    }).catch(error => {
        // This catch might not be reached if individual promises handle errors
        console.error("Erro crítico durante a sequência de inicialização:", error);
    });
});



console.log("Script principal executado. Aguardando DOMContentLoaded.");