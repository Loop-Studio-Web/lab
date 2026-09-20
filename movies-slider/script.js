// getting document object model
let nextDom = document.getElementById("next");
let previewDom = document.getElementById("preview");

let sliderDom = document.querySelector(".slider");
let SliderDom = sliderDom.querySelector(".slider .sliderlist");
let thumbnailBorderDom = document.querySelector(".slider .thumbnail-img");
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll(".slideritem");
let timeDom = document.querySelector(".slider");

thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
let timeRunning = 3000;
let timeAutoNext = 6000;

nextDom.onclick = function () {
  showSlider("next");
};

previewDom.onclick = function () {
  showSlider("preview");
};
let runTimeOut;
let runNextAuto = setTimeout(() => {
  next.click();
}, timeAutoNext);
function showSlider(type) {
  let SliderItemsDom = SliderDom.querySelectorAll(
    ".slider .sliderlist .slideritem"
  );
  let thumbnailItemsDom = document.querySelectorAll(
    ".slider .thumbnail-img .slideritem"
  );

  if (type === "next") {
    SliderDom.appendChild(SliderItemsDom[0]);
    thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
    sliderDom.classList.add("next");
  } else {
    SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
    thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
    sliderDom.classList.add("preview");
  }
  clearTimeout(runTimeOut);
  runTimeOut = setTimeout(() => {
    sliderDom.classList.remove("next");
    sliderDom.classList.remove("preview");
  }, timeRunning);

  clearTimeout(runNextAuto);
  runNextAuto = setTimeout(() => {
    next.click();
  }, timeAutoNext);
}
