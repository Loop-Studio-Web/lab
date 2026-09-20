let items = document.querySelectorAll(".slider .item");
let prevBtn = document.querySelector("#prev");
let nextBtn = document.querySelector("#next");
let sliderEl = document.querySelector(".slider");
let active = 0;

const AUTOPLAY_DELAY = 6000;
let autoplayTimer = null;

const setSlider = () => {
  let oldActive = document.querySelector(".slider .item.active");
  if (oldActive) oldActive.classList.remove("active");
  items[active].classList.add("active");
};

const goNext = () => {
  active = (active + 1) % items.length;
  setSlider();
};

const goPrev = () => {
  active = (active - 1 + items.length) % items.length;
  setSlider();
};

const startAutoplay = () => {
  autoplayTimer = setInterval(goNext, AUTOPLAY_DELAY);
};

const restartAutoplay = () => {
  clearInterval(autoplayTimer);
  startAutoplay();
};

nextBtn.addEventListener("click", () => {
  goNext();
  restartAutoplay();
});

prevBtn.addEventListener("click", () => {
  goPrev();
  restartAutoplay();
});

sliderEl.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
sliderEl.addEventListener("mouseleave", startAutoplay);

setSlider();
startAutoplay();

const setDiameter = () => {
  let slider = document.querySelector(".slider");
  let widthSlider = slider.offsetWidth;
  let heightSlider = slider.offsetHeight;
  let diameter = Math.sqrt(
    Math.pow(widthSlider, 2) + Math.pow(heightSlider, 2)
  );
  document.documentElement.style.setProperty("--diameter", diameter + "px");
};

setDiameter();
window.addEventListener("resize", setDiameter);
