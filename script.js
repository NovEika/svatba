const song = document.getElementById("song");
const icon = document.getElementById("musicIcon");

function toggleMusic() {
    if (song.paused) {
        song.play();
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");

        //spuštění srdíček při kliknutí
        burstHearts();
    } else {
        song.pause();
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }
}

function burstHearts() {
    //funkce pro spuštění srdíček po kliknutí na ikonu hudby
    for (let i = 0; i < 12; i++) {
        createHeart();
    }
}

function createHeart() {
    //vytvoření srdíčka pro burtsHearts() fci
    const heart = document.createElement("div");
    heart.classList.add("floating-heart");
    heart.innerHTML = "❤";

    document.body.appendChild(heart);

    //hledá tlačítko pro spuštění hudby
    const btn = document.querySelector(".music-btn");
    const rect = btn.getBoundingClientRect();

    //startovní pozice pro srdíčka
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    heart.style.left = startX + "px";
    heart.style.top = startY + "px";

    //přidání pohybu srdíček "do V", ne jen nahoru
    const xMove = (Math.random() * 160 - 80);
    const yMove = -(Math.random() * 220 + 150);

    heart.style.fontSize = (Math.random() * 10 + 14) + "px";

    //přidání pohybu srdíček "do V", ne jen nahoru
    //const xMove = (Math.random() * 120 - 60);
    //const yMove = -(Math.random() * 200 + 150);

    const duration = Math.random() * 1.5 + 1.5;

    heart.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;

    requestAnimationFrame(() => {
        heart.style.transform = `translate(${xMove}px, ${yMove}px) scale(1.4)`;
        heart.style.opacity = "0";
    });

    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

