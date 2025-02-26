document.addEventListener("DOMContentLoaded", function () {
    // Wait for text animation (3s) + 1s buffer, then fade out preloader
    setTimeout(() => {
        document.getElementById("preloader").style.opacity = "0";
        setTimeout(() => {
            document.getElementById("preloader").style.display = "none";
            document.getElementById("main-content").style.display = "flex"; // Make it visible
        }, 1000); // Smooth fade-out
    }, 4000); // Ensure animation fully completes before hiding
});
document.addEventListener("DOMContentLoaded", function () {
    const quotes = [
        "Adventure awaits! 🚀",
        "Life is a journey, not a destination. 🌍",
        "Keep calm and travel on. ✈️",
        "Roads were made for journeys, not destinations. 🛣️",
        "The world is yours to explore. 🌎",
        "Travel far, live fully. 🌅",
        "Not all those who wander are lost. 🧭",
        "Collect moments, not things. 📸",
        "Happiness is planning a trip. 🗺️",
        "Explore more, worry less. 🌟"
    ];

    // Select a random quote and display it
    document.getElementById("quote").textContent = quotes[Math.floor(Math.random() * quotes.length)];

    // Preloader fade out
    setTimeout(() => {
        document.getElementById("preloader").style.opacity = "0";
        setTimeout(() => {
            document.getElementById("preloader").style.display = "none";
            document.getElementById("main-content").style.display = "flex"; // Make content visible
        }, 1000);
    }, 4000);
});

