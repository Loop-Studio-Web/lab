const containerElement = document.querySelector(".container");

const careers = [
  { text: "Designer", article: true },
  { text: "Developer", article: true },
  { text: "Creative", article: false },
  { text: "Loop Studio", article: false },
];

let careerIndex = 0;
let characterIndex = 0;

function updateText() {
  characterIndex++;
  const currentCareer = careers[careerIndex];
  const prefix = currentCareer.article ? "a " : "";
  containerElement.innerHTML = `
    <h1>I am ${prefix}${currentCareer.text.slice(0, characterIndex)}</h1>`;

  if (characterIndex === currentCareer.text.length) {
    careerIndex++;
    characterIndex = 0;
  }

  if (careerIndex === careers.length) {
    careerIndex = 0;
  }

  setTimeout(updateText, 400);
}

updateText();
