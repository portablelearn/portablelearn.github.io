const modal = document.getElementById('playerModal');
const previewFrame = document.getElementById('previewFrame');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const modalFs = document.getElementById('modalFullscreen');
document.querySelectorAll('.modal-open').forEach(b=>{
  b.addEventListener('click', e=>{
    const g = e.currentTarget.dataset.game;
    openPreview(g);
  });
});
function openPreview(gameId){
  modalTitle.textContent = 'Preview · ' + (gameId || 'Game');
  previewFrame.src = `games/${gameId}/index.html`;
  modal.setAttribute('aria-hidden','false');
}
modalClose.addEventListener('click', closeModal);
function closeModal(){
  previewFrame.src = '';
  modal.setAttribute('aria-hidden','true');
}
modalFs.addEventListener('click', async ()=>{
  const c = document.getElementById('iframeContainer');
  if(c.requestFullscreen) await c.requestFullscreen();
  else if(c.webkitRequestFullscreen) await c.webkitRequestFullscreen();
});
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape') closeModal();
});
