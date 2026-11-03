# Legacy of Goku 4 — démo jouable en ligne

Page web qui fait tourner la démo du fan game GBA *Legacy of Goku 4* dans le navigateur, avec
[EmulatorJS](https://emulatorjs.org/) (cœur mGBA, chargé depuis son CDN). Aucun serveur n'est nécessaire : c'est un
site statique (HTML, CSS, JavaScript), hébergeable gratuitement sur GitHub Pages.

## Fichiers

- `index.html`, `style.css` : la page (lecteur, touches, sauvegardes, images).
- `play.js` : lance l'émulateur. Si `rom/legacy-of-goku-4.gba` est publié avec le site, un bouton « Lancer la démo »
  apparaît ; sinon, le joueur glisse le fichier `.gba` qu'on lui a donné (il reste sur son ordinateur).
- `img/` : écran titre et captures du jeu.

## Essayer en local

```
python -m http.server 8000
```

puis ouvrir <http://localhost:8000>. (Ouvrir `index.html` directement depuis le disque ne suffit pas : l'émulateur
doit être servi en HTTP.)

## Publier sur GitHub Pages

1. Créer un dépôt sur GitHub (par exemple `legacy-of-goku-4`) et y envoyer ce dossier (GitHub Desktop : *Add local
   repository*, puis *Publish repository*).
2. Sur GitHub : *Settings* → *Pages* → *Build and deployment* → *Deploy from a branch*, branche `main`, dossier
   `/ (root)`.
3. Le site est en ligne quelques minutes plus tard à l'adresse `https://<pseudo>.github.io/<dépôt>/`.

Mettre à jour la démo : remplacer les fichiers, puis *Commit* et *Push*.
