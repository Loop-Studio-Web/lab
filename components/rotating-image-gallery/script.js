const imageContainerElement = document.querySelector(".image-container");
const prevBtnElement = document.querySelector("#prev");
const nextBtnElement = document.querySelector("#next");
let x = 0;
let timer;

prevBtnElement.addEventListener("click", () => {
  x = x + 45;
  clearTimeout(timer);
  updateGallery();
});

nextBtnElement.addEventListener("click", () => {
  x = x - 45;
  clearTimeout(timer);
  updateGallery();
});

function updateGallery() {
  imageContainerElement.style.transform = `perspective(1000px) rotateY(${x}deg)`;
  timer = setTimeout(() => {
    x = x - 45;
    updateGallery();
  }, 3000);
}

updateGallery();
