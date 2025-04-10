
    function initFaq() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            item.querySelector('.faq-question').addEventListener('click', () => {
                toggleFaqAnswer(item);
            });
        });
    }

    function toggleFaqAnswer(item) {
        item.classList.toggle('active'); // Adiciona ou remove a classe 'active'
    }

    // Chama a função initFaq após o carregamento do DOM
    document.addEventListener('DOMContentLoaded', initFaq);
