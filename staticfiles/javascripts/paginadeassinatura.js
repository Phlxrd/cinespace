document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const parent = question.parentElement;
        parent.classList.toggle('active');
    });
});




document.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) { // Quando o scroll ultrapassar 50px
        header.classList.add("header-transparent");
    } else {
        header.classList.remove("header-transparent");
    }
});



const categorias = [
    { 
        nome: "Filmes", 
        imagens: [
            "https://m.media-amazon.com/images/S/pv-target-images/58c33a76d1bc1ee511adeb56d3f199ef754274d691f0dc6b2e22b163dee38164.jpg",
            "https://i0.wp.com/alangeek.com.br/wp-content/uploads/2024/08/img_8318-1.jpg?fit=1350%2C2000&ssl=1",  
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsfeR3wbNglsK9uxh9_01xvR4Nv6nvha8qDS3XUSmU4wYGa-ux", 
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRooVp3qWP5b803QGT3l0U95_epTKSbJ0-3XBh1HNZ7dRfm--ry", 
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQax4yvWJPrMB6UFJN8QAQ4_KcuBFn3yNsCtDtYCuaC2NU7PJYV", 
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSqF0hUMbyPjrgIxM52LWO2KPm9RW1r2ix3p4i48PEHr4yQ8vFt"
        ] 
    },
    { 
        nome: "Séries", 
        imagens: [
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTjXohtVux2wmoNvLgc3zehiHoe1judrE0mLP1-SCnSYXX46p1l",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTVDmGZ-NN1fvVK15mKa1aaQNKkq4bAX1YyWCh7ZDd7xf15kxi",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHpiX6QwgIOQkRv1NBQZL7x9b7t6QZiMiV83v4o-TIxBeA91CB",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0FkZ8a1kFBP9V4MOAbLRNjBtGyt1W66n6WTEYg5nPg4oiB0hy",
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQq0wpxcIA4hLY2_Lwfa51LtNK2sHrC-9AmrOhVgw6MjeOGSxpQ"
        ] 
    },
    { 
        nome: "Animes", 
        imagens: [
            "https://images.justwatch.com/poster/306057903/s718/naruto-shippuden.jpg", 
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS9PnRo-SKCdqKXntNxfV9cusz4C2m1IPhdJeEY1IK7VxFKO3_e", 
            "https://infinitasvidas.wordpress.com/wp-content/uploads/2018/11/my-hero-academia.png",
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQByGWUb1j4s7OQ7KHIXWoU755_SUZgSF2M5NHvBpiNFLprn7Y7",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQPNfsQ8VISTz7nSm8OqTZZn3EWHpLVonJnFTGnNorXAWqNHpSu",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTIltyVoUvczPxHWE19GxFrctsvzcIVWaOr4grKShAYu5brS3NY"
        ] 
    },
    { 
        nome: "Doramas", 
        imagens: [
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTbmFqltwgvrcgut5SXbPRGJ3FB11O14KjW-FlGVAH0qRhPAm7Y",
            "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQYFCS-4sX2yu-h3J5MxRThqg_73xyfycIL6_870zneERMTLhwJ",
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQai2LCK-u9-1r8cz20vVpr_Y2uO5dXRbtpkkAiv8qczReFTsmq",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRKGyYdduG1Yv5nVcrgfFgAyT_VmEEZJdp8RZ2AqT0Z3Mcvly-6",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRFCKeSPKs9gUsmua7VYTmqMw7y1waivcn5l8Fv2_fT5W7r4H1T",
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ-1O915uEI0m-Vcdr-x9gL-646OfYlQGzQLTDBHokQnVG87zP3"
        ] 
    },
    { 
        nome: "Docs", 
        imagens: [
            "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQWOVR7fo4GAlHZntJ1mHKkA-vayIOpFllvx-0WFrIemcGr7Emt",
            "https://image.tmdb.org/t/p/original/xsdFO3wx2xOSfo4pbJ5oA9xUpFj.jpg",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQQTcU0YWUl2mVm2KPtHOHHzGSPtUd7Q_M4hgxjQmKuzPf7--S8",
            "https://images.justwatch.com/poster/313470087/s718/the-13th.jpg",
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRb3gSou9tUqlnXtliExR-LpNOnD-vf9daXnHUkhe14KOjepra_",
            "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRb_mGQlrvEKrWiiTNEf3sU1M7ogqEw27msUF51ecBL-08I4hgH"
        ] 
    },
    { 
        nome: "Infantil", 
        imagens: [
            "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQibI4bWhWgHKSYGic70FJDt3fYBDUrANt_j5x4g9mK-wIoLxz1",
            "https://play-lh.googleusercontent.com/lWUcaZstS31n2IaIKHE-R9ABoTJffxxo2pTZ8QoYoeia4BR_-gAFMfP2yJ013u5A5p8k5Q",
            "https://m.media-amazon.com/images/M/MV5BYmZjZWQ0OTktODdlYy00ZjA1LWJlNzYtNmYwMDc4YzQzZmQwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQZg8Z2KmzuzDkV40IGoyirmEjj5kwxrqzI7qOd9vWtl79-IOW4",
            "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRPfzXxwfcHt0x6VmlJGZOyD40czoumgws52kXgqC6DGtwxlMpB", 
            "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQDUUwahAJPqE2TIfuRQwwcmpXU6hnhyIv0BGqzXRzFv0fPCbN1"
        ] 
    }
];

const carrosselImagens = document.querySelector(".carrossel-imagens");
const setaEsquerda = document.querySelector(".seta-esquerda");
const setaDireita = document.querySelector(".seta-direita");
const categoriasFixa = document.querySelector(".categorias-fixa");

let categoriaAtual = 0;
let imagemCentralIndex = 0;

function atualizarCarrossel(direcao) {
    const imagens = categorias[categoriaAtual].imagens;
    carrosselImagens.innerHTML = '';

    for (let i = -2; i <= 2; i++) {
        const index = (imagemCentralIndex + i + imagens.length) % imagens.length;
        const img = document.createElement('img');
        img.src = imagens[index];
        img.alt = `Imagem ${index + 1}`;

        if (i === 0) {
            img.classList.add('central');
        } else if (i === -1 || i === 1) {
            img.classList.add('lado', i === -1 ? 'esquerda' : 'direita');
        } else if (i === -2 || i === 2) {
            img.classList.add('penultima', i === -2 ? 'esquerda' : 'direita');
        } else if (i === -3 || i === 3) {
            img.classList.add('externa', i === -3 ? 'esquerda' : 'direita');
        }

        if (direcao === 'direita') {
            img.classList.add('surgir-direita');
        } else if (direcao === 'esquerda') {
            img.classList.add('surgir-esquerda');
        }

        img.addEventListener('click', () => {
            imagemCentralIndex = index;
            atualizarCarrossel();
        });

        carrosselImagens.appendChild(img);
    }
}

function atualizarCategorias() {
    categoriasFixa.innerHTML = categorias.map((categoria, index) => {
        const classe = index === categoriaAtual ? "selecionada" : "lateral";
        return `<span class="categoria-item ${classe}" data-index="${index}">${categoria.nome}</span>`;
    }).join("");

    document.querySelectorAll('.categoria-item').forEach(item => {
        item.addEventListener('click', () => {
            categoriaAtual = parseInt(item.getAttribute('data-index'));
            imagemCentralIndex = 0;
            atualizarCarrossel();
            atualizarCategorias();
        });
    });
}

atualizarCarrossel();
atualizarCategorias();

setaEsquerda.addEventListener("click", () => {
    categoriaAtual = (categoriaAtual - 1 + categorias.length) % categorias.length;
    imagemCentralIndex = 0;
    atualizarCarrossel('esquerda');
    atualizarCategorias();
});

setaDireita.addEventListener("click", () => {
    categoriaAtual = (categoriaAtual + 1) % categorias.length;
    imagemCentralIndex = 0;
    atualizarCarrossel('direita');
    atualizarCategorias();
});

// // Desabilita o clique com o botão direito em toda a página
// document.addEventListener("contextmenu", (event) => {
//     event.preventDefault(); // Impede o menu de contexto padrão
// });  

// Impede a seleção de texto com o mouse
document.addEventListener("selectstart", (event) => {
    event.preventDefault(); // Impede a seleção de texto
});

// Impede o arrasto de imagens e outros elementos
document.addEventListener("dragstart", (event) => {
    event.preventDefault(); // Impede o arrasto
});

// Adiciona estilo CSS para desativar a seleção visualmente
const style = document.createElement("style");
style.textContent = `
    * {
        user-select: none; /* Desativa a seleção de texto */
        -webkit-user-select: none; /* Compatibilidade com navegadores baseados em Webkit */
        -ms-user-select: none; /* Compatibilidade com IE */
    }
`;
document.head.appendChild(style);




  document.addEventListener("DOMContentLoaded", function () {
    const rocketButton = document.getElementById('rocket-button');

    // Mostra o botão quando o usuário rola a página
    window.addEventListener('scroll', function () {
        if (window.scrollY > 1700) {
            rocketButton.classList.add('visible');
        } else {
            rocketButton.classList.remove('visible');
        }
    });

    // Animação de subida ao clicar no botão
    rocketButton.addEventListener('click', function () {
        rocketButton.classList.add('launch');
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            rocketButton.classList.remove('launch');
        }, 1000); // Tempo da animação
    });
});  document.addEventListener("DOMContentLoaded", function () {
    const rocketButton = document.getElementById('rocket-button');

    // Mostra o botão quando o usuário rola a página
    window.addEventListener('scroll', function () {
        if (window.scrollY > 1700) {
            rocketButton.classList.add('visible');
        } else {
            rocketButton.classList.remove('visible');
        }
    });

    // Animação de subida ao clicar no botão
    rocketButton.addEventListener('click', function () {
        rocketButton.classList.add('launch');
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            rocketButton.classList.remove('launch');
        }, 1000); // Tempo da animação
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sportsImages = document.querySelectorAll('.sports-image');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show'); // Adiciona a classe 'show' quando visível
            }
        });
    }, {
        threshold: 0.1, // Quanto do elemento precisa estar visível (10%)
    });

    sportsImages.forEach((image) => {
        observer.observe(image); // Observa cada imagem
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const funcionaItems = document.querySelectorAll('.funciona-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show'); // Adiciona a classe 'show' ao entrar no viewport
            }
        });
    }, {
        threshold: 0.1, // Quanto do elemento precisa estar visível (10%)
    });

    funcionaItems.forEach((item) => {
        observer.observe(item); // Observa cada item
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const planosCards = document.querySelectorAll('.plano-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show'); // Adiciona a classe 'show'
            }
        });
    }, {
        threshold: 0.3, // Quanto do elemento precisa estar visível (10%)
    });

    planosCards.forEach((card) => {
        observer.observe(card); // Observa cada card
    });
});
