// Licznik pogłaskania kota
let mrukniencia = 0;
function poglaszcz() {
    mrukniencia++;
    const counterElement = document.getElementById('counter');
    counterElement.innerText = mrukniencia;
    
    // Mały efekt wizualny przy kliknięciu
    counterElement.style.color = "#f06292";
    setTimeout(() => {
        counterElement.style.color = "#4a4a4a";
    }, 200);

    if(mrukniencia === 50) {
        alert("Twój kot mruczy tak głośno, że słychać go w całym internecie!");
    }
}
