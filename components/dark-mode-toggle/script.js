const inputElement = document.querySelector(".input");

const bodyElement = document.querySelector("body");

const modeText = document.querySelector("#mode-text");

inputElement.checked = JSON.parse(localStorage.getItem("mode"));

console.log(inputElement.checked);

updateBody();

function updateBody() {
  if (inputElement.checked) {
    bodyElement.style.background = "black";
    modeText.textContent = "Dark Mode";
    modeText.style.color = "white";
  } else {
    bodyElement.style.background = "white";
    modeText.textContent = "Light Mode";
    modeText.style.color = "black";
  }
}

inputElement.addEventListener("input", () => {
  updateBody();
  updateLocalStorage();
});

function updateLocalStorage() {
  localStorage.setItem("mode", JSON.stringify(inputElement.checked));
}
