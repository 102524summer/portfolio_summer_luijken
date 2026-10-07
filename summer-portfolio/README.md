# Summer Luijken - portfolio

Plain HTML, CSS and JavaScript. No build step, no framework, no server needed.
Three.js (3D chrome objects) and GSAP (animation) are included in `assets/vendor/`, so everything works offline and on GitHub Pages.

## Put it online with GitHub Pages
1. Create a new repository on GitHub (for example `portfolio`). Public is easiest.
2. Upload **everything in this folder** (the files themselves, not a folder containing them). `index.html` must sit at the top level. Keep the `.nojekyll` file.
3. In the repo go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. After a minute your site is live at `https://YOUR-USERNAME.github.io/portfolio/`.
   For `https://YOUR-USERNAME.github.io/` name the repo exactly `YOUR-USERNAME.github.io`.

All links are relative, so it works at either address (and on a custom domain).

## Look at it on your own computer
The 3D objects need `http://`, not `file://`. In this folder run either:
```
python -m http.server 8000
npx serve
```
then open http://localhost:8000. Add `?no3d` to any URL to turn the 3D off while testing.

## Make it yours
- **Photos**: put images in `assets/img/photos/` and paste their paths into `assets/js/content.js`. Every empty frame on the site (project sketches/results, outfits, bakes, About drawers) has a key there.
- **Films and series lists**: edit the `FILMS` and `SERIES` lists in `curiosities.html` (search for `cl__t`).
- **CV**: put your PDF in the top-level folder (next to `index.html`) named exactly `SummerLuijken_CV.pdf`. The Contact page button opens it.
- **Contact details**: email and Instagram are in `contact.html`.
- **Coordinates** in the footers, Home and Contact are the Pathé De Kuip cinema, as an easter egg. Search for `51.8969` to change them.
- **Project text** (Work and the six project pages) is an honest draft. Replace it with your real details, numbers and quotes.
- **Colours** are CSS variables at the top of `assets/css/base.css`.

## Files
```
index.html  work.html  about.html  curiosities.html  contact.html  404.html
ai-or-human.html  iridescent-tide.html  momentary.html  threejs-experiments.html  quizzie.html  bakary.html
assets/css  assets/js  assets/fonts  assets/vendor  assets/img
```

## Credits
Fonts: UnifrakturMaguntia, Grenze Gotisch, Instrument Serif, Space Mono, Caveat, Pinyon Script, IM Fell English (all open licence, self-hosted).
Pictures in `assets/img/ref/` are other people's inspiration references and are labelled "reference, not mine" on the site. Replace or credit them before sharing widely.
