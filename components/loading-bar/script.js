const counterElement = document.querySelector(".counter");
const barElement = document.querySelector(".loading-bar-front");

let index = 0;

updateNumber();

function updateNumber() {
  counterElement.innerText = index + "%";
  barElement.style.width = index + "%";
  index++;

  if (index < 101) {
    setTimeout(updateNumber, 20);
  }
}
