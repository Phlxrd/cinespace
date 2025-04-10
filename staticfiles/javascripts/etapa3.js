document.addEventListener("DOMContentLoaded", () => {
    const numeroCartaoInput = document.getElementById("numero_cartao");
    const nomeCartaoInput = document.getElementById("nome");
    const validadeInput = document.getElementById("validade");
    const cvvInput = document.getElementById("cvv");
    const bandeiraCartao = document.getElementById("bandeira-cartao");
    const cartaoSimulacao = document.querySelector(".cartao-simulacao");
    const tipoPagamentoInputs = document.querySelectorAll('input[name="tipo_pagamento"]');
    const opcoesDetalhadas = document.getElementById("opcoes-detalhadas");
    const botaoConcluir = document.querySelector(".botao-entrar");

    const numeroCartao = document.getElementById("numero-cartao");
    const nomeCartao = document.getElementById("nome-cartao");
    const validadeCartao = document.getElementById("validade-cartao");
    const cvvCartao = document.getElementById("cvv-cartao");

    const padroesCartao = {
        "1234": { banco: "nubank", imagem: "https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-8.png", cor: "#8a05be" },
        "5678": { banco: "mastercard", imagem: "https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-8.png", cor: "#ff7f00" },
        "9012": { banco: "itau", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#ff6600" },
        "3456": { banco: "bradesco", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#e60026" },
        "4321": { banco: "santander", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#c80b1e" },
        "8765": { banco: "caixa", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#0033a0" },
        "1111": { banco: "banco_do_brasil", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#f5d130" },
        "2222": { banco: "american_express", imagem: "https://th.bing.com/th/id/OIP.iaYumwI96Gd8b0nAE7m27QHaDA?rs=1&pid=ImgDetMain", cor: "#4a90e2" },
        "3333": { banco: "visa", imagem: "https://purediamond.ca/cdn/shop/t/4/assets/visa-logo.png?v=45714302755795351451603492202", cor: "#1a1f71" },
        "4444": { banco: "inter", imagem: "https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-8.png", cor: "#ff5f00" },
    };

    const corPadrao = "#333";

    // Função para verificar se todos os campos estão preenchidos
    function verificarCamposPreenchidos() {
        let numeroCartaoPreenchido = false;
        let nomeCartaoPreenchido = false;
        let validadePreenchida = false;
        let cvvPreenchido = false;
        let tipoPagamentoSelecionado = false;

        // Verifica se um tipo de pagamento foi selecionado
        tipoPagamentoInputs.forEach(input => {
            if (input.checked) {
                tipoPagamentoSelecionado = true;
            }
        });

        // Se um tipo de pagamento foi selecionado, verifica se os campos do cartão estão preenchidos
        if (tipoPagamentoSelecionado && opcoesDetalhadas.style.display === 'block') {
            numeroCartaoPreenchido = numeroCartaoInput.value.trim().length === 19;
            nomeCartaoPreenchido = nomeCartaoInput.value.trim().length > 0;
            validadePreenchida = validadeInput.value.trim().length === 5;
            cvvPreenchido = cvvInput.value.trim().length === 3;
        }

        if (numeroCartaoPreenchido && nomeCartaoPreenchido && validadePreenchida && cvvPreenchido && tipoPagamentoSelecionado) {
            botaoConcluir.style.display = "block";
        } else {
            botaoConcluir.style.display = "none";
        }
    }

    // Atualizar número do cartão com espaços
    numeroCartaoInput.addEventListener("input", () => {
        let value = numeroCartaoInput.value.replace(/\D/g, "");
        value = value.replace(/(.{4})/g, "$1 ");
        numeroCartaoInput.value = value.trim();
        numeroCartao.textContent = value.padEnd(19, "#");
        atualizarCartao(value.slice(0, 4).replace(/\s/g, ""));
        verificarCamposPreenchidos();
    });

    nomeCartaoInput.addEventListener("input", () => {
        nomeCartao.textContent = nomeCartaoInput.value.toUpperCase() || "NOME NO CARTÃO";
        verificarCamposPreenchidos();
    });

    // Atualização automática no campo validade
    validadeInput.addEventListener("input", () => {
        let value = validadeInput.value.replace(/\D/g, "");
        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        validadeInput.value = value;
        validadeCartao.textContent = value || "MM/AA";
        verificarCamposPreenchidos();
    });

    cvvInput.addEventListener("input", () => {
        const value = cvvInput.value.replace(/\D/g, "");
        cvvCartao.textContent = value.padEnd(3, "#").slice(0, 3) || "CVV";
        verificarCamposPreenchidos();
    });

    // Atualiza informações do cartão com base no número
    function atualizarCartao(primeirosNumeros) {
        if (padroesCartao[primeirosNumeros]) {
            const { banco, imagem, cor } = padroesCartao[primeirosNumeros];
            cartaoSimulacao.style.background = cor;
            bandeiraCartao.style.backgroundImage = `url(${imagem})`;
            cartaoSimulacao.className = `cartao-simulacao ${banco}`;
        } else {
            cartaoSimulacao.style.background = corPadrao;
            bandeiraCartao.style.backgroundImage = "none";
            cartaoSimulacao.className = "cartao-simulacao";
        }
    }

    // Mostra ou oculta campos de pagamento com base no tipo selecionado
    tipoPagamentoInputs.forEach((input) => {
        input.addEventListener("change", () => {
            opcoesDetalhadas.style.display = "block";
            verificarCamposPreenchidos();
        });
    });

    // Inicializa o botão como oculto
    botaoConcluir.style.display = "none";

    // Chama a função para verificar os campos inicialmente
    verificarCamposPreenchidos();
});