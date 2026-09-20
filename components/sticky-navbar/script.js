const navbarElement = document.querySelector(".navbar");
const bottomContainerElement = document.querySelector(".bottom-container");
console.log(bottomContainerElement.offsetTop);

window.addEventListener("scroll", () => {
  //   console.log(window.scrollY);
  if (
    window.scrollY >
    bottomContainerElement.offsetTop - navbarElement.offsetHeight - 50
  ) {
    navbarElement.classList.add("active");
  } else {
    navbarElement.classList.remove("active");
  }
});
