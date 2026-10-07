function updateScore(points) {
    let currentScore = localStorage.getItem("quizScore") || 0;
    currentScore = parseInt(currentScore) + points;
    
    if (currentScore > 100) {
        currentScore = 100;
    }

    localStorage.setItem("quizScore", currentScore);
}

function updateMultiScore(value) {
    let currentScore = localStorage.getItem("quizScore") || 0;
    currentScore = parseInt(currentScore) + value;
    
    if (currentScore > 100) {
        currentScore = 100;
    }

    localStorage.setItem("quizScore", currentScore);
}

function showResult() {
    let score = parseInt(localStorage.getItem("quizScore")) || 0;
    let resultText = "";

    if (score >= 80) {
        resultText = "Hij Heeft ook een crush op jou!! ( ˶ˆᗜˆ˵ ) ";
    } else if (score >= 60) {
        resultText = "Er zit hoop in deze relatie! (˶ᵔ ᵕ ᵔ˶) ";
    } else if (score >= 40) {
        resultText = "Probeer contact te maken. (˶˃⤙˂˶) ";
    } else {
        resultText = "Begin maar met goede vrienden te worden... (╥﹏╥) ";
    }

    document.getElementById("result").innerText = resultText + score + ("%");
    localStorage.removeItem("quizScore"); 
}