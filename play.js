// Lecteur de la démo : EmulatorJS (cœur mGBA), chargé depuis son CDN au moment de jouer.
//
// Deux façons de lancer le jeu :
// - la ROM est publiée avec le site (rom/legacy-of-goku-4.gba) : un bouton la lance ;
// - sinon, le joueur glisse le fichier .gba qu'on lui a donné : il reste sur son ordinateur (URL blob locale).
"use strict";

const ROM_URL = "rom/legacy-of-goku-4.gba";
const EJS_DATA = "https://cdn.emulatorjs.org/stable/data/";

const chooser = document.getElementById("chooser");
const hosted = document.getElementById("play-hosted");
const drop = document.getElementById("drop");
const input = document.getElementById("file");
const status = document.getElementById("status");
let started = false;

function start(url) {
    if (started) {
        return;
    }
    started = true;
    chooser.hidden = true;

    window.EJS_player = "#game";
    window.EJS_core = "gba";
    // Même nom de jeu quelle que soit la source : la sauvegarde du navigateur est retrouvée d'une visite à l'autre.
    window.EJS_gameName = "Legacy of Goku 4";
    window.EJS_gameUrl = url;
    window.EJS_pathtodata = EJS_DATA;
    // La traduction française du CDN porte ce nom.
    window.EJS_language = "af-FR";
    window.EJS_color = "#f08c18";
    window.EJS_backgroundColor = "#101018";
    window.EJS_startOnLoaded = true;
    // Mémoire de la cartouche (cercles C) recopiée dans le navigateur toutes les 30 secondes.
    window.EJS_defaultOptions = { "save-save-interval": "30" };
    // Touches de mGBA : X = A, Z = B, A = L, S = R, Entrée = START, Retour arrière = SELECT. Les numéros sont ceux
    // de RetroArch (0 B, 2 SELECT, 3 START, 4 à 7 croix, 8 A, 10 L, 11 R) ; value2 : la manette.
    window.EJS_defaultControls = {
        0: {
            0: { value: "z", value2: "BUTTON_2" },
            1: { value: "", value2: "BUTTON_4" },
            2: { value: "backspace", value2: "SELECT" },
            3: { value: "enter", value2: "START" },
            4: { value: "up arrow", value2: "DPAD_UP" },
            5: { value: "down arrow", value2: "DPAD_DOWN" },
            6: { value: "left arrow", value2: "DPAD_LEFT" },
            7: { value: "right arrow", value2: "DPAD_RIGHT" },
            8: { value: "x", value2: "BUTTON_1" },
            9: { value: "", value2: "BUTTON_3" },
            10: { value: "a", value2: "LEFT_TOP_SHOULDER" },
            11: { value: "s", value2: "RIGHT_TOP_SHOULDER" }
        },
        1: {},
        2: {},
        3: {}
    };

    const script = document.createElement("script");
    script.src = EJS_DATA + "loader.js";
    script.onerror = () => {
        status.textContent = "Impossible de charger l'émulateur (connexion internet ?). Recharge la page pour réessayer.";
        chooser.hidden = false;
        started = false;
    };
    document.body.appendChild(script);
}

function startFromFile(file) {
    if (!file) {
        return;
    }
    if (!/\.gba$/i.test(file.name)) {
        status.textContent = "Ce n'est pas un fichier .gba.";
        return;
    }
    start(URL.createObjectURL(file));
}

drop.addEventListener("click", () => input.click());
drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
    }
});
input.addEventListener("change", () => startFromFile(input.files[0]));
drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("over");
});
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("over");
    startFromFile(event.dataTransfer.files[0]);
});

// La ROM est-elle publiée avec le site ? Alors le bouton suffit, le dépôt de fichier reste possible.
fetch(ROM_URL, { method: "HEAD" })
    .then((response) => {
        if (response.ok) {
            hosted.hidden = false;
            hosted.addEventListener("click", () => start(ROM_URL));
            drop.querySelector("strong").textContent = "Ou glisse ici ton propre fichier .gba";
        }
    })
    .catch(() => {});
