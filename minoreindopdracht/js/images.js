// pad naar de ontwerpen: ai-01.png ... ai-10.png en human-01.jpg ... human-10.jpg
const IMGS = {};

for (let i = 1; i <= 10; i++) {
  const nr = String(i).padStart(2, "0");
  IMGS["ai" + i]   = `assets/images/ai/ai-${nr}.png`;
  IMGS["real" + i] = `assets/images/human/human-${nr}.jpg`;
}
