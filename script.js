const DEFAULT_MENUS = ["김치찌개", "돈까스", "초밥", "쌀국수", "제육볶음", "파스타"];
const COLORS = ["#FF826C", "#F5D35E", "#B7D767", "#77C9B1", "#74A9D8", "#A58BD4", "#EF91B1", "#E6A968", "#8DCFD6", "#C7D96F"];

const wheel = document.querySelector("#wheel");
const canvas = document.querySelector("#wheel-canvas");
const ctx = canvas.getContext("2d");
const spinButton = document.querySelector("#spin-button");
const menuList = document.querySelector("#menu-list");
const menuCount = document.querySelector("#menu-count");
const addForm = document.querySelector("#add-form");
const menuInput = document.querySelector("#menu-input");
const resultCard = document.querySelector("#result-card");
const resultText = document.querySelector("#result-text");
const resultSub = document.querySelector("#result-sub");

document.body.insertAdjacentHTML("beforeend", `
  <div id="winner-overlay" class="winner-overlay" aria-hidden="true">
    <div class="winner-popup" role="dialog" aria-modal="true" aria-labelledby="winner-title">
      <button class="popup-close" type="button" aria-label="결과 팝업 닫기">×</button>
      <span class="popup-badge">TODAY'S PICK</span>
      <p>오늘의 점심은</p>
      <strong id="winner-title"></strong>
      <span class="popup-message">맛있는 점심시간 보내세요!</span>
      <button class="spin-again" type="button">한 번 더 돌리기</button>
    </div>
  </div>
  <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
`);

const winnerOverlay = document.querySelector("#winner-overlay");
const winnerPopup = winnerOverlay.querySelector(".winner-popup");
const winnerTitle = document.querySelector("#winner-title");
const popupClose = winnerOverlay.querySelector(".popup-close");
const spinAgain = winnerOverlay.querySelector(".spin-again");
const confettiLayer = document.querySelector("#confetti-layer");

let menus = [...DEFAULT_MENUS];
let currentRotation = 0;
let spinning = false;

function fitCanvas() {
  const rect = wheel.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel(rect.width);
}

function drawWheel(size = wheel.clientWidth) {
  const center = size / 2;
  const radius = center - 2;
  const slice = (Math.PI * 2) / menus.length;

  ctx.clearRect(0, 0, size, size);

  menus.forEach((menu, index) => {
    const start = -Math.PI / 2 + index * slice;
    const end = start + slice;
    const mid = start + slice / 2;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fffdf7";
    ctx.stroke();

    const textRadius = radius * (menus.length >= 8 ? 0.67 : 0.62);
    const x = center + Math.cos(mid) * textRadius;
    const y = center + Math.sin(mid) * textRadius;

    ctx.save();
    ctx.translate(x, y);
    let rotation = mid + Math.PI / 2;
    if (rotation > Math.PI / 2 && rotation < Math.PI * 1.5) rotation += Math.PI;
    ctx.rotate(rotation);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = menus.length >= 9 ? 18 : menus.length >= 7 ? 21 : 25;
    const maxTextWidth = Math.max(94, radius * 0.39);
    ctx.font = `${fontSize}px Jua, sans-serif`;
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 253, 247, 0.94)";
    ctx.shadowColor = "rgba(39, 49, 40, 0.2)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.strokeText(menu, 0, 0, maxTextWidth);
    ctx.fillStyle = "#273128";
    ctx.fillText(menu, 0, 0, maxTextWidth);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(39,49,40,.16)";
  ctx.stroke();
}

function renderMenus() {
  menuList.innerHTML = "";
  menus.forEach((menu, index) => {
    const item = document.createElement("li");
    item.className = "menu-chip";
    item.innerHTML = `<span>${escapeHtml(menu)}</span><button type="button" aria-label="${escapeHtml(menu)} 삭제" data-index="${index}">×</button>`;
    menuList.appendChild(item);
  });
  menuCount.textContent = `${menus.length}개 선택`;
  fitCanvas();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function showMessage(title, sub) {
  resultText.textContent = title;
  resultSub.textContent = sub;
  gsap.fromTo(resultCard, { y: 8, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
}

function fireConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  for (let index = 0; index < 76; index += 1) {
    const piece = document.createElement("i");
    const angle = gsap.utils.random(-165, -15) * (Math.PI / 180);
    const distance = gsap.utils.random(160, Math.min(520, window.innerWidth * 0.48));
    const size = gsap.utils.random(7, 13, 1);
    piece.className = "confetti-piece";
    piece.style.backgroundColor = COLORS[index % COLORS.length];
    piece.style.width = `${size}px`;
    piece.style.height = `${gsap.utils.random(4, 12, 1)}px`;
    confettiLayer.appendChild(piece);
    gsap.set(piece, { x: originX, y: originY + 70, rotation: gsap.utils.random(0, 180) });
    gsap.to(piece, { x: originX + Math.cos(angle) * distance, y: originY + Math.sin(angle) * distance + gsap.utils.random(100, 230), rotation: gsap.utils.random(360, 1080), opacity: 0, duration: gsap.utils.random(1.15, 1.9), ease: "power2.out", onComplete: () => piece.remove() });
  }
}

function showWinnerPopup(menu) {
  winnerTitle.textContent = menu;
  winnerOverlay.classList.add("is-visible");
  winnerOverlay.setAttribute("aria-hidden", "false");
  gsap.fromTo(winnerOverlay, { opacity: 0 }, { opacity: 1, duration: 0.22 });
  gsap.fromTo(winnerPopup, { y: 36, scale: 0.72, rotation: -3 }, { y: 0, scale: 1, rotation: 0, duration: 0.65, ease: "back.out(1.7)" });
  fireConfetti();
  popupClose.focus({ preventScroll: true });
}

function hideWinnerPopup() {
  gsap.to(winnerOverlay, { opacity: 0, duration: 0.18, onComplete() { winnerOverlay.classList.remove("is-visible"); winnerOverlay.setAttribute("aria-hidden", "true"); spinButton.focus({ preventScroll: true }); } });
}

function spin() {
  if (spinning || menus.length < 2) return;
  spinning = true;
  spinButton.disabled = true;
  resultText.textContent = "두근두근…";
  resultSub.textContent = "오늘의 메뉴를 고르는 중이에요";

  const winnerIndex = Math.floor(Math.random() * menus.length);
  const sliceDegrees = 360 / menus.length;
  const randomOffset = gsap.utils.random(-sliceDegrees * 0.28, sliceDegrees * 0.28);
  const normalized = ((currentRotation % 360) + 360) % 360;
  const targetAngle = 360 - (winnerIndex * sliceDegrees + sliceDegrees / 2) + randomOffset;
  const extraTurns = gsap.utils.random(6, 9, 1) * 360;
  const delta = ((targetAngle - normalized + 360) % 360) + extraTurns;
  currentRotation += delta;

  gsap.to(wheel, {
    rotation: currentRotation,
    duration: gsap.utils.random(4.8, 6.2),
    ease: "power4.out",
    onUpdate() {
      const rotation = gsap.getProperty(wheel, "rotation");
      const progress = this.progress();
      if (progress < 0.76 && Math.floor(rotation / sliceDegrees) !== Math.floor((rotation - 5) / sliceDegrees)) {
        gsap.fromTo(".pointer", { rotation: -8 }, { rotation: 0, duration: 0.11, ease: "power2.out", overwrite: true });
      }
    },
    onComplete() {
      spinning = false;
      spinButton.disabled = false;
      showMessage(`오늘은 ${menus[winnerIndex]}!`, "맛있는 점심시간 보내세요 ✦");
      gsap.fromTo(spinButton, { scale: 0.92 }, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.45)" });
      showWinnerPopup(menus[winnerIndex]);
    },
  });
}

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = menuInput.value.trim();
  if (!value) return;
  if (menus.length >= 10) return showMessage("메뉴는 최대 10개까지!", "하나를 지운 뒤 다시 추가해주세요");
  if (menus.some((menu) => menu.toLowerCase() === value.toLowerCase())) return showMessage("이미 있는 메뉴예요", "다른 맛있는 메뉴를 적어주세요");

  menus.push(value);
  menuInput.value = "";
  renderMenus();
  gsap.from(menuList.lastElementChild, { scale: 0.7, opacity: 0, duration: 0.35, ease: "back.out(1.7)" });
});

menuList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button || spinning) return;
  if (menus.length <= 2) return showMessage("메뉴가 2개는 필요해요", "선택의 즐거움은 남겨둘게요");
  menus.splice(Number(button.dataset.index), 1);
  currentRotation = 0;
  gsap.set(wheel, { rotation: 0 });
  renderMenus();
});

spinButton.addEventListener("click", spin);
popupClose.addEventListener("click", hideWinnerPopup);
winnerOverlay.addEventListener("click", (event) => { if (event.target === winnerOverlay) hideWinnerPopup(); });
spinAgain.addEventListener("click", () => { hideWinnerPopup(); gsap.delayedCall(0.22, spin); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && winnerOverlay.classList.contains("is-visible")) hideWinnerPopup(); });
window.addEventListener("resize", fitCanvas);
document.fonts.ready.then(renderMenus);

gsap.from(".intro > *", { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" });
gsap.from(".roulette-area", { x: 25, opacity: 0, duration: 0.9, delay: 0.2, ease: "power2.out" });
