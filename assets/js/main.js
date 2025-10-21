document.addEventListener("DOMContentLoaded", () => {

// size selection
  const sizeCards = document.querySelectorAll(".card--size");
  sizeCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedSize = card.getAttribute("data-size");
      localStorage.setItem("size", selectedSize);
      console.log("Saved size:", selectedSize);
    });
  });

  // theme selection
  const themeCards = document.querySelectorAll(".card--theme");
  themeCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedTheme = card.getAttribute("data-theme");
      localStorage.setItem("theme", selectedTheme);
      console.log("Saved theme:", selectedTheme);
    });
  });

  // speed selection
  const speedCards = document.querySelectorAll(".card--speed");
  speedCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedSpeed = card.getAttribute("data-speed");
      localStorage.setItem("speed", selectedSpeed);
      console.log("Saved speed:", selectedSpeed);

      const size = localStorage.getItem("size") || "4";
      window.location.href = `${size}x${size}.html`;
    });
  });

});
