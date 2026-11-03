# Legacy of Goku 4 — démo jouable en ligne

Page web qui fait tourner la démo du fan game GBA *Legacy of Goku 4* dans le navigateur, avec
[EmulatorJS](https://emulatorjs.org/) (cœur mGBA, chargé depuis son CDN). C'est un site statique (HTML, CSS,
JavaScript), hébergé gratuitement sur GitHub Pages. Seul le jeu compilé est publié, jamais ses sources.

## Fichiers

- `index.html`, `style.css` : la page (lecteur, touches, sauvegardes, images).
- `play.js` : reconstitue la démo en mémoire et lance l'émulateur.
- `data/demo.bin` : la ROM compressée puis brouillée ; `data/demo.json` : sa taille et son empreinte SHA-256.
- `img/` : écran titre et captures du jeu.

## La ROM n'est pas téléchargeable

Aucun fichier `.gba` n'est servi. `demo.bin` n'est lisible par aucun émulateur : le navigateur le débrouille et le
décompresse en mémoire, vérifie son empreinte, le confie à l'émulateur par une adresse temporaire détruite dès que le
jeu démarre, et ne le garde pas dans son cache (seules les sauvegardes du joueur sont conservées). Ce que le
navigateur exécute, il doit le recevoir : c'est un frein efficace contre le téléchargement, pas une protection
absolue contre quelqu'un de très déterminé.

## Mettre à jour la démo

Dans le projet du jeu, après la compilation :

```
python tools/web/pack_demo.py
```

(écrit `data/demo.bin` et `data/demo.json` ici), puis *Commit* et *Push*.

## Essayer en local

```
python -m http.server 8000
```

puis ouvrir <http://localhost:8000> (ouvrir `index.html` directement depuis le disque ne suffit pas).

## Publier sur GitHub Pages

1. Créer le dépôt sur GitHub et y envoyer ce dossier (GitHub Desktop : *Add local repository*, puis *Publish
   repository*, en décochant *Keep this code private* : GitHub Pages gratuit demande un dépôt public).
2. Sur github.com : *Settings* → *Pages* → *Build and deployment* → *Deploy from a branch*, branche `main`, dossier
   `/ (root)`, *Save*.
3. Le site est en ligne quelques minutes plus tard à l'adresse `https://<pseudo>.github.io/<dépôt>/`.
