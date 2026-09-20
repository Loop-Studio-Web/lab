const ratingElements = document.querySelectorAll(".rating");
const btnElement = document.querySelector("#btn");
const containerElement = document.querySelector("#container");

let selectedRating = "";

ratingElements.forEach((ratingElement) => {
  ratingElement.addEventListener("click", (event) => {
    removeActiveClass();
    selectedRating =
      event.target.innerText || event.target.parentNode.innerText;
    event.target.classList.add("active");
    event.target.parentNode.classList.add("active");
  });
});

btnElement.addEventListener("click", () => {
  if (selectedRating !== "") {
    containerElement.innerHTML = `
        <strong>Thank you!</strong>
        <br>
        <br>
        <strong>Feedback: ${selectedRating}</strong>
        <p>We'll use your feedback to improve our customer support.</p>
        `;
  }
});

function removeActiveClass() {
  ratingElements.forEach((ratingElement) => {
    ratingElement.classList.remove("active");
  });
}
