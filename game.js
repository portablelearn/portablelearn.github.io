function qs(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}
const gameId = qs('game') || 'game1';
const frame = document.getElementById('gameFrame');
frame.src = `games/${gameId}/index.html`;
const btnFs = document.getElementById('openFullscreen');
const openNew = document.getElementById('openNewTab');
openNew.href = frame.src;
btnFs.addEventListener('click', async ()=>{
  const parent = document.getElementById('playerArea');
  if(parent.requestFullscreen) await parent.requestFullscreen();
  else if(parent.webkitRequestFullscreen) await parent.webkitRequestFullscreen();
});
document.addEventListener('keydown', e=>{
  if(e.key === 'f') btnFs.click();
});
