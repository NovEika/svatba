const song = document.getElementById("song");

function toggleMusic() {
    if (song.paused) {
        song.play();
    } else {
        song.pause();
    }
}