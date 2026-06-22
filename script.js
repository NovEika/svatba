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

//barevné stopy gradientu pozadí .story, musí odpovídat CSS:
//background: linear-gradient(180deg, #6B4445 0%, #9A7374 25%, #C9A8A8 60%, #ffffff 100%)
const gradientStops = [
    { pos: 0, r: 107, g: 68, b: 69 },      // #6B4445
    { pos: 0.25, r: 154, g: 115, b: 116 }, // #9A7374
    { pos: 0.60, r: 201, g: 168, b: 168 }, // #C9A8A8
    { pos: 1, r: 255, g: 255, b: 255 }     // #ffffff
];

function colorAtBackground(progress) {
    //najde mezi kterými dvěma stopy progress leží a interpoluje barvu POZADÍ na tom místě
    for (let i = 0; i < gradientStops.length - 1; i++) {
        const a = gradientStops[i];
        const b = gradientStops[i + 1];
        if (progress >= a.pos && progress <= b.pos) {
            const localT = (progress - a.pos) / (b.pos - a.pos);
            return {
                r: a.r + (b.r - a.r) * localT,
                g: a.g + (b.g - a.g) * localT,
                b: a.b + (b.b - a.b) * localT
            };
        }
    }
    return gradientStops[gradientStops.length - 1];
}

//vybere pro daný element kontrastní barvu (bílá/tmavá) podle pozice na gradientu .story
function setContrastColor(el, storyHeight) {
    const elTop = el.offsetTop;
    let progress = elTop / storyHeight;
    progress = Math.min(Math.max(progress, 0), 1);

    const bg = colorAtBackground(progress);

    //vypočítá vnímaný jas pozadí (luma) a podle toho zvolí bílý nebo tmavý text
    const luma = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;

    el.style.color = luma > 150 ? "#6B4445" : "#ffffff";
}

function updateHeadingColors() {
    //kontroluje barvu pozadí a podle toho vybírá kontrastní barvu pro texty v timeline
    //(h2 data, h3/h4/p uvnitř memory-text) – text musí být VŽDY čitelný
    const story = document.querySelector(".story");
    const storyHeight = story.offsetHeight;

    //offsetTop se počítá vůči nejbližšímu positioned předkovi.
    //u h2.story-date je to přímo .story, ale u h3/h4/p uvnitř .memory-text
    //je potřeba k jejich offsetTop přičíst offsetTop jejich .memory-wrap předka,
    //protože .memory má position: relative a stává se novým "kotvícím" prvkem.
    const headings = story.querySelectorAll("h2");
    headings.forEach(h2 => setContrastColor(h2, storyHeight));

    const wraps = story.querySelectorAll(".memory-wrap");
    wraps.forEach(wrap => {
        const wrapTop = wrap.offsetTop;
        const textEls = wrap.querySelectorAll(".memory-text h3, .memory-text h4, .memory-text p");

        textEls.forEach(el => {
            //el.offsetTop je relativní k .memory (nejbližší positioned předek),
            //proto k němu přičteme wrapTop, abychom dostali pozici vůči .story
            const elTop = wrapTop + el.offsetTop;
            let progress = elTop / storyHeight;
            progress = Math.min(Math.max(progress, 0), 1);

            const bg = colorAtBackground(progress);
            const luma = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;

            el.style.color = luma > 150 ? "#6B4445" : "#ffffff";
        });
    });
}

window.addEventListener('load', () => {
    updateHeadingColors();
    setTimeout(updateHeadingColors, 500);
});
window.addEventListener('resize', updateHeadingColors);

function toggleMemory(memory) {
    //přepíná mezi aktivní a neaktivní vzpomínkou, aktivní odsouvá fotku a zobrazuje text, neaktivní zůstává uprostřed stránky
    memory.classList.toggle("active");

    //po otevření/zavření karty se může změnit výška .story (text se zobrazí/skryje),
    //takže přepočítáme barvy po doběhnutí CSS transition (0.6s)
    setTimeout(updateHeadingColors, 650);
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

        div.innerHTML = `<strong>${m.name}</strong><p>${m.message}</p>`;

        container.appendChild(div);
    });
}

//NAVIGACE PŘI SCROLLU + pohyb myši nahoře
const unitSwitch = document.getElementById('unitSwitch');

function formatNumber(n) {
    const rounded = Math.round(n * 10) / 10;
    return rounded.toString().replace('.', ',');
}

function updateNutriValues(unit) {
    document.querySelectorAll('.nutri-table').forEach(table => {
        const weight = parseFloat(table.dataset.weight);

        table.querySelectorAll('.nutri-value').forEach(span => {
            const value100 = parseFloat(span.dataset.value100);

            if (unit === '100g' || isNaN(weight)) {
                span.textContent = formatNumber(value100);
            } else {
                const valuePerPiece = value100 * (weight / 100);
                span.textContent = formatNumber(valuePerPiece);
            }
        });
    });
}

if (unitSwitch) {
    unitSwitch.addEventListener('click', () => {
        const isKs = unitSwitch.getAttribute('aria-checked') === 'true';
        const newUnit = isKs ? '100g' : 'ks';

        unitSwitch.setAttribute('aria-checked', String(!isKs));
        updateNutriValues(newUnit);
    });
}