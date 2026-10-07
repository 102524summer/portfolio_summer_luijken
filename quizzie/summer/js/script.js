function updateScore(points) {
    let currentScore = localStorage.getItem("quizScore") || 0;
    currentScore = parseInt(currentScore) + points;
    
    if (currentScore > 300) {
        currentScore = 300;
    }

    localStorage.setItem("quizScore", currentScore);
}

function updateMultiScore(value) {
    let currentScore = localStorage.getItem("quizScore") || 0;
    currentScore = parseInt(currentScore) + value;
    
    if (currentScore > 300) {
        currentScore = 300;
    }

    localStorage.setItem("quizScore", currentScore);
}

function showResult() {
    let score = parseInt(localStorage.getItem("quizScore")) || 0;
    let resultText = "";

    if (score >= 280) {
        resultText = "Yayyy! Hij is zeker 'the right one'!!!! (˶ˆᗜˆ˵)";
    } else if (score >= 190) {
        resultText = "Goed op weg! Jullie passen goed bij elkaar! (˶ᵔ ᵕ ᵔ˶)";
    } else if (score >= 120) {
        resultText = "Twijfelachtig! Misschien een gesprek aangaan? (˶˃⤙˂˶)";
    } else {
        resultText = "Aww! Misschien is hij niet 'the right one'... (╥﹏╥)";
    }

    document.getElementById("result").innerText = resultText;
    localStorage.removeItem("quizScore"); 
}
