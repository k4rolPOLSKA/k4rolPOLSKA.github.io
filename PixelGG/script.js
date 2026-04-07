const text = document.querySelector('.typewriter');
if (text) {
    const content = text.textContent;
    text.textContent = '';
    let i = 0;

    function typing() {
        if (i < content.length) {
            text.textContent += content.charAt(i);
            i++;
            setTimeout(typing, 50);
        }
    }
    typing();
}
