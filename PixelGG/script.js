document.addEventListener('DOMContentLoaded', () => {
    // 1. Efekt Maszyny do Pisania (Typewriter)
    const typewriterElement = document.querySelector('.typewriter');
    
    if (typewriterElement) {
        const text = typewriterElement.innerHTML;
        typewriterElement.innerHTML = '';
        let i = 0;

        function type() {
            if (i < text.length) {
                typewriterElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 40);
            }
        }
        type();
    }

    // 2. Animacja kart przy przewijaniu
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = '0.6s ease-out';
        observer.observe(card);
    });
});
