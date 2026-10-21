// Apre e chiude il <dialog> del video. Alla chiusura (anche con Esc) il video
// si ferma e riparte da capo; il clic sullo sfondo scuro chiude.
const dialog = document.querySelector('[data-dialog]');
const video = dialog.querySelector('[data-video]');
let opener = null;

document.querySelector('[data-open]').addEventListener('click', (e) => {
	opener = e.currentTarget;
	dialog.showModal();
	video.play().catch(() => {}); // se il browser blocca l'autoplay resta il pulsante Play
});

dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());

// Un clic sul ::backdrop arriva sul <dialog> stesso, non su un figlio.
dialog.addEventListener('click', (e) => {
	if (e.target === dialog) dialog.close();
});

dialog.addEventListener('close', () => {
	video.pause();
	video.currentTime = 0;
	opener?.focus();
});
