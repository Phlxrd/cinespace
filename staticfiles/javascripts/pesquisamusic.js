document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    let currentResultado = null; // Variável para armazenar o resultado atual

    // --- FUNÇÃO PARA ATUALIZAR O ÍCONE ---
    function updatePlayPauseIconResultado(isPlaying) {
        const playIcon = document.querySelector('.play-icon-resultado');
        const pauseIcon = document.querySelector('.pause-icon-resultado');

        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }

    // --- OUVINTE DO EVENTO PERSONALIZADO ---
    window.addEventListener('playerStateChanged', (event) => {
        const playerState = event.detail;
        // Atualiza o ícone SOMENTE se for a música atualmente exibida
        if (currentResultado && playerState.url === currentResultado.arquivo) {
            updatePlayPauseIconResultado(playerState.isPlaying);
        }
        console.log("Evento playerStateChanged recebido na página de pesquisa:", playerState);
    });

    async function loadSearchResults(query) {
        try {
            // Exibe um indicador de carregamento
            const searchTitle = document.getElementById('search-results-title-pesquisa');
            searchTitle.textContent = `Buscando por "${query}"...`;
    
            // Busca músicas (agora inclui artistas e álbuns)
            const responseMusicas = await fetch(`/search-music/?q=${encodeURIComponent(query)}`);
            if (!responseMusicas.ok) {
                throw new Error(`Erro na requisição de músicas: ${responseMusicas.status} ${responseMusicas.statusText}`);
            }
            const data = await responseMusicas.json(); // Usamos 'data' para o objeto completo
            const dataMusicas = data.data; // 'data.data' contém as músicas
            const dataArtistas = data.artistas; // 'data.artistas' contém os artistas
            const dataAlbuns = data.albuns;  // 'data.albuns' contém os álbuns
    
    
            // --- Restante do código para exibir músicas (mantido, com pequenos ajustes) ---
            searchTitle.textContent = `Resultados para "${query}"`;
    
            const resultadoContainer = document.querySelector('.resultado-container');
            if (dataMusicas.length > 0) {
                resultadoContainer.style.display = 'block';
                const primeiroResultado = dataMusicas[0];
                currentResultado = primeiroResultado;
    
                resultadoContainer.innerHTML = `
                    <img src="${primeiroResultado.banner_artista}" alt="Banner do Artista" class="resultado-imagem">
                    <div class="resultado-info">
                        <div class="resultado-titulo">${primeiroResultado.titulo}</div>
                        <div class="resultado-subtitulo">Música | ${primeiroResultado.artista}</div>
                    </div>
                    <div class="play-pause-container-resultado">
                        <img src="https://i.postimg.cc/Qd368qxM/play-music.png" alt="Play" class="play-icon-resultado">
                        <img src="https://i.postimg.cc/WbrWcyVK/pause-music.png" alt="Pause" class="pause-icon-resultado" style="display: none;">
                    </div>
                `;
    
                const playPauseContainer = resultadoContainer.querySelector('.play-pause-container-resultado');
    
                playPauseContainer.addEventListener('click', () => {
                    const savedState = localStorage.getItem('playerState');
                    let isPlaying = false;
    
                    if (savedState) {
                        const playerState = JSON.parse(savedState);
                        if (playerState.url === primeiroResultado.arquivo) {
                            isPlaying = playerState.isPlaying;
                        }
                    }
    
                    isPlaying = !isPlaying;
                    updatePlayPauseIconResultado(isPlaying);
    
                    if (isPlaying) {
                        if (savedState && JSON.parse(savedState).url === primeiroResultado.arquivo) {
                            const eventToggle = new CustomEvent('togglePlayPause');
                            window.dispatchEvent(eventToggle);
                        } else {
                            window.playSong(primeiroResultado.arquivo, primeiroResultado.titulo, primeiroResultado.artista, primeiroResultado.capa, 0);
                        }
                    } else {
                        const eventToggle = new CustomEvent('togglePlayPause');
                        window.dispatchEvent(eventToggle);
                    }
                });
    
                const savedState = localStorage.getItem('playerState');
                if (savedState) {
                    const playerState = JSON.parse(savedState);
                    if (currentResultado && playerState.url === currentResultado.arquivo) {
                        updatePlayPauseIconResultado(playerState.isPlaying);
                    }
                } else {
                    updatePlayPauseIconResultado(false);
                }
    
            } else {
                resultadoContainer.style.display = 'none';
                resultadoContainer.innerHTML = '';
                searchTitle.textContent = `Nenhum resultado encontrado para "${query}"`;
                currentResultado = null;
            }
            window.songsList = dataMusicas; // Atualiza a lista global de músicas
    
    
    
        // --- Exibir Músicas (mantido, com ajustes) ---
        const popularSongsContainer = document.getElementById('popular-songs-pesquisa');
        if (dataMusicas.length > 0) {
            popularSongsContainer.innerHTML = ''; // Limpa o conteúdo anterior
            dataMusicas.forEach((song, index) => { // Usa dataMusicas
                const songItem = document.createElement('div');
                songItem.classList.add('popular-item-pesquisa');
    
                const tituloLimitado = song.titulo.length > 15 ? song.titulo.slice(0, 15) + '...' : song.titulo;
    
                songItem.innerHTML = `
                    <img src="${song.capa}" alt="Capa da música" class="popular-cover-pesquisa">
                    <img src="https://i.postimg.cc/MZQ9dq49/favorito-icons.png" alt="Curtir" class="heart-icon">
                    
                    <div class="song-info-popular-pesquisa">
                        <div class="song-title-popular-pesquisa">${tituloLimitado}</div>
                        <div class="song-subtitle-popular-pesquisa">${song.artista}</div>
                    </div>
                    <div class="song-album-popular-pesquisa">${song.album || 'N/A'}</div>
    
                    <div class="song-details-popular-pesquisa">
                        <div class="song-duration-popular-pesquisa">
                            <span>${formatTime(song.duracao)}</span>
                            <img src="https://i.postimg.cc/FsXD6wXN/maisinfo-icons.png" alt="Mais opções" class="options-icon-popular-pesquisa">
                        </div>
                    </div>
                `;
    
                songItem.addEventListener('click', () => {
                    window.playSong(song.arquivo, song.titulo, song.artista, song.capa, index);
                });
    
                popularSongsContainer.appendChild(songItem);
            });
        } else {
            document.getElementById('section-title-musicas').textContent = 'Você também pode gostar de';
            loadRecomendacoes();
        }
    
        // --- Exibir Artistas (Modificado para usar dataArtistas) ---
        const artistaGrid = document.getElementById('artista-grid-pesquisa');
        artistaGrid.innerHTML = '';
        if (dataArtistas.length > 0) { // Usa dataArtistas
            dataArtistas.forEach(artista => {
                const artistaItem = document.createElement('div');
                artistaItem.classList.add('artista-item-pesquisa');
    
                artistaItem.innerHTML = `
                    <img src="${artista.capa_artista}" alt="Foto do Artista" class="artista-imagem-pesquisa">
                    <div class="artista-details-pesquisa">
                        <div class="artista-title-pesquisa">${artista.artista}</div>
                        <div class="artista-info-pesquisa">Artista</div>
                    </div>
                `;
                artistaGrid.appendChild(artistaItem);
            });
        } else {
            artistaGrid.innerHTML = `<p>Nenhum artista encontrado para "${query}"</p>`;
        }
    
        // --- Exibir Álbuns (Modificado para usar dataAlbuns) ---
        const albumGrid = document.getElementById('album-grid-pesquisa');
        albumGrid.innerHTML = '';
        if (dataAlbuns.length > 0) { // Usa dataAlbuns
            dataAlbuns.forEach(album => {
                const albumItem = document.createElement('div');
                albumItem.classList.add('album-item-pesquisa');
    
                const tituloAlbumLimitado = album.album.length > 12 ? album.album.slice(0, 12) + '...' : album.album;
    
                albumItem.innerHTML = `
                    <img src="${album.capa}" alt="Capa do Álbum" class="album-cover-pesquisa">
                    <div class="album-details-pesquisa">
                        <div class="album-title-pesquisa">${tituloAlbumLimitado}</div>
                        <div class="album-info-pesquisa">${album.artista} • ${album.ano} • Álbum</div>
                    </div>
                `;
                albumGrid.appendChild(albumItem);
            });
        } else {
            albumGrid.innerHTML = `<p>Nenhum álbum encontrado para "${query}"</p>`;
        }
    
    } catch (error) {
        console.error('Erro ao buscar resultados da pesquisa:', error);
        alert('Erro ao buscar resultados. Verifique o console para mais detalhes.');
    }
    }
    // Função para carregar recomendações
    async function loadRecomendacoes() {
        try {
            // Busca músicas, artistas e álbuns aleatórios
            const responseRecomendacoes = await fetch('/buscar-recomendacoes/');
            if (!responseRecomendacoes.ok) {
                throw new Error(`Erro na requisição de recomendações: ${responseRecomendacoes.status} ${responseRecomendacoes.statusText}`);
            }
            const dataRecomendacoes = await responseRecomendacoes.json();

            // Adiciona as recomendações
            const popularSongsContainer = document.getElementById('popular-songs-pesquisa');
            const artistaGrid = document.getElementById('artista-grid-pesquisa');
            const albumGrid = document.getElementById('album-grid-pesquisa');

            // Limpa o conteúdo anterior
            popularSongsContainer.innerHTML = '';
            artistaGrid.innerHTML = '';
            albumGrid.innerHTML = '';

            // Adiciona 5 músicas aleatórias
            dataRecomendacoes.musicas.forEach(musica => {
                const songItem = document.createElement('div');
                songItem.classList.add('popular-item-pesquisa');

                songItem.innerHTML = `
                    <img src="${musica.capa}" alt="Capa da música" class="popular-cover-pesquisa">
                    <img src="https://i.postimg.cc/MZQ9dq49/favorito-icons.png" alt="Curtir" class="heart-icon">
                    
                    <div class="song-info-popular-pesquisa">
                        <div class="song-title-popular-pesquisa">${musica.titulo}</div>
                        <div class="song-subtitle-popular-pesquisa">${musica.artista}</div>
                    </div>
                    <div class="song-album-popular-pesquisa">${musica.album || 'N/A'}</div>

                    <div class="song-details-popular-pesquisa">
                        <div class="song-duration-popular-pesquisa">
                            <span>${formatTime(musica.duracao)}</span>
                            <img src="https://i.postimg.cc/FsXD6wXN/maisinfo-icons.png" alt="Mais opções" class="options-icon-popular-pesquisa">
                        </div>
                    </div>
                `;
                popularSongsContainer.appendChild(songItem);
            });

            // Adiciona 5 artistas aleatórios
            dataRecomendacoes.artistas.forEach(artista => {
                const artistaItem = document.createElement('div');
                artistaItem.classList.add('artista-item-pesquisa');

                artistaItem.innerHTML = `
                    <img src="${artista.capa}" alt="Foto do Artista" class="artista-imagem-pesquisa">
                    <div class="artista-details-pesquisa">
                        <div class="artista-title-pesquisa">${artista.artista}</div>
                        <div class="artista-info-pesquisa">Artista</div>
                    </div>
                `;
                artistaGrid.appendChild(artistaItem);
            });

            // Adiciona 5 álbuns aleatórios
            dataRecomendacoes.albuns.forEach(album => {
                const albumItem = document.createElement('div');
                albumItem.classList.add('album-item-pesquisa');

                albumItem.innerHTML = `
                    <img src="${album.capa}" alt="Capa do Álbum" class="album-cover-pesquisa">
                    <div class="album-details-pesquisa">
                        <div class="album-title-pesquisa">${album.album}</div>
                        <div class="album-info-pesquisa">${album.artista} • ${album.ano} • Álbum</div>
                    </div>
                `;
                albumGrid.appendChild(albumItem);
            });
        } catch (error) {
            console.error('Erro ao carregar recomendações:', error);
        }
    }

    // Função para formatar o tempo (segundos para mm:ss)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Evento de digitação no campo de pesquisa (pesquisa automática)
    let timeoutId;
    searchInput.addEventListener('input', function (e) {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();
        if (query) {
            timeoutId = setTimeout(() => {
                loadSearchResults(query);
            }, 300); // Aguarda 300ms após a última digitação
        }
    });
    // Evento de pressionar "Enter" no campo de pesquisa
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                loadSearchResults(query);
            }
        }
    });

    // Evento de clique no botão de pesquisa
    searchButton.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query) {
            loadSearchResults(query);
        }
    });

    // Carrega os resultados da pesquisa ao carregar a página
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        loadSearchResults(query);
    }
});