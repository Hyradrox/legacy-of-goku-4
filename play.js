// Lecteur de la démo : EmulatorJS (cœur mGBA), chargé depuis son CDN au moment de jouer.
//
// La ROM n'est pas publiée telle quelle : data/demo.bin est la ROM compressée (gzip) puis brouillée
// (tools/web/pack_demo.py du projet). Elle n'est reconstituée qu'en mémoire, vérifiée (taille, SHA-256), confiée à
// l'émulateur par une adresse temporaire détruite dès que le jeu démarre, et jamais gardée dans le cache du
// navigateur. Rien n'est proposé au téléchargement.
"use strict";

const DEMO = "data/demo.bin";
const DEMO_INFO = "data/demo.json";
const DEMO_SEED = 0x4C344744;   // le même que dans pack_demo.py
const EJS_DATA = "https://cdn.emulatorjs.org/stable/data/";

const chooser = document.getElementById("chooser");
const button = document.getElementById("play");
const status = document.getElementById("status");
let started = false;

function unscramble(bytes) {
    let x = DEMO_SEED >>> 0;
    const next = () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        x >>>= 0;
        return x;
    };
    const full = bytes.length - bytes.length % 4;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < full; i += 4) {
        view.setUint32(i, view.getUint32(i, true) ^ next(), true);
    }
    if (full < bytes.length) {
        const k = next();
        for (let i = full; i < bytes.length; i++) {
            bytes[i] ^= (k >>> (8 * (i - full))) & 0xFF;
        }
    }
    return bytes;
}

async function fetchWithProgress(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("démo introuvable (" + response.status + ")");
    }
    const total = Number(response.headers.get("Content-Length")) || 0;
    const reader = response.body.getReader();
    const parts = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        parts.push(value);
        received += value.length;
        if (total) {
            status.textContent = "Chargement de la démo… " + Math.floor(100 * received / total) + " %";
        }
    }
    const bytes = new Uint8Array(received);
    let at = 0;
    for (const part of parts) {
        bytes.set(part, at);
        at += part.length;
    }
    return bytes;
}

async function prepareRom() {
    if (typeof DecompressionStream === "undefined" || !window.crypto || !crypto.subtle) {
        throw new Error("navigateur trop ancien : utilise une version récente de Chrome, Edge, Firefox ou Safari");
    }
    const info = await (await fetch(DEMO_INFO, { cache: "no-store" })).json();
    const packed = unscramble(await fetchWithProgress(DEMO));
    status.textContent = "Préparation de la démo…";
    const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream("gzip"));
    const rom = await new Response(stream).arrayBuffer();
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", rom)))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
    if (rom.byteLength !== info.bytes || digest !== info.sha256) {
        throw new Error("démo abîmée pendant le chargement : recharge la page");
    }
    return URL.createObjectURL(new Blob([rom], { type: "application/octet-stream" }));
}

function launch(url) {
    window.EJS_player = "#game";
    window.EJS_core = "gba";
    // Nom fixe : la sauvegarde du navigateur est retrouvée d'une visite à l'autre.
    window.EJS_gameName = "Legacy of Goku 4";
    window.EJS_gameUrl = url;
    window.EJS_pathtodata = EJS_DATA;
    // La traduction française du CDN porte ce nom.
    window.EJS_language = "af-FR";
    window.EJS_color = "#f08c18";
    window.EJS_backgroundColor = "#101018";
    window.EJS_startOnLoaded = true;
    // La ROM n'est pas gardée dans le cache du navigateur (les sauvegardes, elles, sont conservées).
    window.EJS_disableDatabases = true;
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
    // Une fois le jeu en route, l'adresse temporaire de la ROM est détruite.
    window.EJS_onGameStart = () => URL.revokeObjectURL(url);

    const script = document.createElement("script");
    script.src = EJS_DATA + "loader.js";
    script.onerror = () => {
        status.textContent = "Impossible de charger l'émulateur (connexion internet ?). Recharge la page.";
    };
    document.body.appendChild(script);
}

button.addEventListener("click", async () => {
    if (started) {
        return;
    }
    started = true;
    button.disabled = true;
    try {
        const url = await prepareRom();
        chooser.hidden = true;
        launch(url);
    } catch (error) {
        status.textContent = "Erreur : " + error.message + ".";
        started = false;
        button.disabled = false;
    }
});
