document.addEventListener("DOMContentLoaded", function() {
    if (!document.getElementById("resultText")) return;

    // Verkrijg de scores uit sessionStorage
    let scores = {
        'touch': sessionStorage.getItem('touch') || 0,
        'service': sessionStorage.getItem('service') || 0,
        'words': sessionStorage.getItem('words') || 0,
        'qualityTime': sessionStorage.getItem('qualityTime') || 0,
        'gift': sessionStorage.getItem('gift') || 0
    };

    // Bereken het totale aantal punten
    let totalPoints = Object.values(scores).reduce((total, score) => total + parseInt(score), 0);

    // Bereken de percentages voor elke love language
    let percentages = {};
    for (let language in scores) {
        if (totalPoints > 0) {
            percentages[language] = (scores[language] / totalPoints) * 100;
        } else {
            percentages[language] = 0;
        }
    }

    // Resultaten weergeven
    let resultText = `
        Fysieke aanraking: ${percentages['touch'].toFixed(2)}%<br>
        Daden van dienstbaarheid: ${percentages['service'].toFixed(2)}%<br>
        Woorden van bevestiging: ${percentages['words'].toFixed(2)}%<br>
        Kwaliteitstijd: ${percentages['qualityTime'].toFixed(2)}% <br>
        Cadeautjes: ${percentages['gift'].toFixed(2)}%
    `;

    // Toon de resultaten in de HTML
    document.getElementById("resultText").innerHTML = resultText;
    document.getElementById("result").style.display = "block"; // Maak het resultaat zichtbaar
});


function updateScore(language, points) {
    // Verkrijg de huidige score voor de love language uit sessionStorage, als die er is
    let currentScore = sessionStorage.getItem(language) || 0;

    // Verhoog de score met de aangegeven punten
    currentScore = parseInt(currentScore) + points;

    // Sla de nieuwe score op in sessionStorage
    sessionStorage.setItem(language, currentScore);
}
