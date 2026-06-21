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

    //přidání pohybu srdíček "do V"
    const xMove = (Math.random() * 160 - 80);
    const yMove = -(Math.random() * 220 + 150);

    heart.style.fontSize = (Math.random() * 10 + 14) + "px";

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

function toggleMemory(memory) {
    memory.classList.toggle("active");
}

const supabaseUrl = "https://gadvmgbzfliexigiljke.supabase.co";
const supabaseKey = "sb_publishable_x4nWnzyOAWhbPAlrCIuM5g_JBMdf6yx";

let supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    loadMessages();
});

//ODESLÁNÍ
async function sendMessage() {
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    if (!name || !message) return;

    await supabaseClient
        .from("messages")
        .insert([{ name, message }]);

    document.getElementById("message").value = "";

    loadMessages();
}

//NAHRÁNÍ
async function loadMessages() {
    console.log("Loading messages")
    const { data } = await supabaseClient
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

    const container = document.getElementById("messages");
    container.innerHTML = "";

    data.forEach(m => {
        const div = document.createElement("div");
        div.classList.add("message");

        div.innerHTML = `<strong>${m.name}</strong> <p>${m.message}</p>`;

        container.appendChild(div);
    });
}
