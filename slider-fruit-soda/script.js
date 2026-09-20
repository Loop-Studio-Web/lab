let list = document.querySelectorAll(".list .item");
let carousel = document.querySelector(".carousel");
let next = document.querySelector("#next");
let prev = document.querySelector("#prev");
let mockup = document.querySelector(".mockup");

let count = list.length;
let active = 0;

// Calcolo dello spostamento (--left) in base alle dimensioni REALI delle immagini,
// invece di percentuali fisse "a occhio" (che causavano lo sconfinamento tra un gusto e l'altro).
//
// Box della lattina (da style.css): 371px / 1.5 = 247.33px
// listSoda.jpg è 1191x720px. Con "background-size: auto 100%" viene scalata
// a un'altezza di 247.33px -> larghezza scalata ≈ 409.13px
// Ogni banda di gusto (1/3 dell'immagine) scalata è quindi ≈ 136.38px
const MOCKUP_BOX = 371 / 1.5;
const LISTSODA_W = 1191;
const LISTSODA_H = 720;

const bgScaledWidth = LISTSODA_W * (MOCKUP_BOX / LISTSODA_H);
const bandWidth = bgScaledWidth / count;
const left_each_item = (bandWidth / (bgScaledWidth - MOCKUP_BOX)) * 100;
const leftMockupStart = 0;

next.addEventListener("click", () => {
  active = active >= count - 1 ? 0 : active + 1;
  carousel.classList.remove("right");
  changeCarousel();
});

prev.addEventListener("click", () => {
  active = active <= 0 ? count - 1 : active - 1;
  carousel.classList.add("right");
  changeCarousel();
});

function changeCarousel() {
  let hiddenOld = document.querySelector(".item.hidden");
  if (hiddenOld) hiddenOld.classList.remove("hidden");

  let activeOld = document.querySelector(".item.active");
  activeOld.classList.remove("active");
  activeOld.classList.add("hidden");

  list[active].classList.add("active");

  let leftMockup = leftMockupStart + active * left_each_item;
  mockup.style.setProperty("--left", leftMockup + "%");

  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => next.click(), 5000);
}

let refreshInterval = setInterval(() => next.click(), 5000);

// Swipe touch (mobile): scorrimento orizzontale in aggiunta ai bottoni prev/next
let touchStartX = 0;
const SWIPE_THRESHOLD = 40;

carousel.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].clientX;
  },
  { passive: true },
);

carousel.addEventListener(
  "touchend",
  (e) => {
    let delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next.click();
    else prev.click();
  },
  { passive: true },
);
