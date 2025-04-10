document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        pt: {
            themeToggle: "🌙 Trocar Tema",
            closeMenu: "✖",
            home: "Início",
            movies: "Filmes",
            series: "Séries",
            animes: "Animes",
            drawings: "Desenhos",
            doramas: "Doramas",
            cartaz: "Em Cartaz Cinema",
            about: "Sobre mim",
            bestMovies: "Melhores Filmes",
            hollywoodProductions: "Produções de Hollywood Famosas",
            comingSoon: "Em Breve!",
            searchingForHappiness: "A procura da felicidade",
            spiderMan: "Homem Aranha Sem Volta Pra Casa",
            aliceInBorderland: "Alice In Borderland",
            sweetHome: "Sweet Home",
            allOfUsAreDead: "All of Us Are Dead",
            myDemon: "My Demon",
            round6: "Round 6",
            bloodhounds: "Bloodhounds"
        },
        en: {
            themeToggle: "🌙 Toggle Theme",
            closeMenu: "✖",
            home: "Home",
            movies: "Movies",
            series: "Series",
            animes: "Animes",
            drawings: "Drawings",
            doramas: "Doramas",
            cartaz: "In Theaters",
            about: "About Me",
            bestMovies: "Best Movies",
            hollywoodProductions: "Famous Hollywood Productions",
            comingSoon: "Coming Soon!",
            searchingForHappiness: "The Pursuit of Happyness",
            spiderMan: "Spider-Man No Way Home",
            aliceInBorderland: "Alice In Borderland",
            sweetHome: "Sweet Home",
            allOfUsAreDead: "All of Us Are Dead",
            myDemon: "My Demon",
            round6: "Round 6",
            bloodhounds: "Bloodhounds"
        },
        es: {
            themeToggle: "🌙 Cambiar Tema",
            closeMenu: "✖",
            home: "Inicio",
            movies: "Películas",
            series: "Series",
            animes: "Animes",
            drawings: "Dibujos",
            doramas: "Doramas",
            cartaz: "En Cartelera",
            about: "Sobre mí",
            bestMovies: "Mejores Películas",
            hollywoodProductions: "Producciones Famosas de Hollywood",
            comingSoon: "¡Próximamente!",
            searchingForHappiness: "En busca de la felicidad",
            spiderMan: "Spider-Man Sin Camino a Casa",
            aliceInBorderland: "Alice en Borderland",
            sweetHome: "Sweet Home",
            allOfUsAreDead: "Todos Estamos Muertos",
            myDemon: "Mi Demonio",
            round6: "Round 6",
            bloodhounds: "Bloodhounds"
        },
        fr: {
            themeToggle: "🌙 Changer de Thème",
            closeMenu: "✖",
            home: "Accueil",
            movies: "Films",
            series: "Séries",
            animes: "Animes",
            drawings: "Dessins",
            doramas: "Doramas",
            cartaz: "En Salle",
            about: "À Propos de Moi",
            bestMovies: "Meilleurs Films",
            hollywoodProductions: "Productions Célèbres d'Hollywood",
            comingSoon: "Bientôt!",
            searchingForHappiness: "À la recherche du bonheur",
            spiderMan: "Spider-Man : Pas de Retour à la Maison",
            aliceInBorderland: "Alice in Borderland",
            sweetHome: "Sweet Home",
            allOfUsAreDead: "Tous Nos Morts",
            myDemon: "Mon Démon",
            round6: "Round 6",
            bloodhounds: "Bloodhounds"
        }
    };

    const languageSwitcher = document.getElementById('language-switcher');
    const translateElements = document.querySelectorAll('[data-translate]');

    function applyTranslations(language) {
        translateElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[language] && translations[language][key]) {
                element.textContent = translations[language][key];
            }
        });
    }

    languageSwitcher.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        applyTranslations(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
    });

    // Load saved language or default to Portuguese
    const savedLanguage = localStorage.getItem('language') || 'pt';
    languageSwitcher.value = savedLanguage;
    applyTranslations(savedLanguage);
});
