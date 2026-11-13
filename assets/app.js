// 시연 영상 목록: data/manifest.json(녹화 도구 record_demos.py 출력)을 읽어 그룹별 카드로 그린다.
// 영상 위에는 아무것도 덮지 않는다(일시정지해도 화면을 어둡게 하거나 가리지 않음). 조작 버튼은 영상 아래에 둔다.
const GROUPS = [
  ["sso", "기본 SSO",
    "학교 계정으로 앱에 로그인하면 Microsoft가 SEN 로그인 화면으로 보내고, SEN이 학교 도메인 Issuer로 서명한 SAML 응답(NameID=ImmutableID)으로 학교 테넌트에 로그인한다."],
  ["reject", "위조·오류 거부",
    "등록되지 않은 Issuer, 변조된 서명, 매핑되지 않은 계정, 잘못된 라우팅 구현을 Entra ID가 거부하는지 확인한다."],
  ["route", "④ 통합 아이디(라우팅)",
    "SEN 아이디(@joowon.me, 실제로는 @senedu.kr 역할)로 시작해도 SEN이 학교 도메인 Issuer로 응답하면 학교 테넌트로 로그인된다. 문서에 없는 동작이라 운영 전 Microsoft 확인이 필요하다."],
  ["attack", "보안 데모: 위험 로그인 탐지·차단",
    "학교 B(Microsoft 365 A5, Entra ID P2) 데모 계정에만 위험 기반 조건부 액세스 정책을 적용하고, 유출 계정의 Tor(익명 IP) 로그인과 관리자 침해 확인으로 탐지·차단을 재현했다. 공격자는 SEN 아이디·비밀번호를 가진 것으로 가정한다."],
  ["portal", "보안 데모: 관리 포털 화면",
    "같은 시도가 Entra ID 보호와 Microsoft Defender XDR에 어떻게 기록되는지 보여 준다. 관리자 계정·테넌트 ID·접속 IP는 녹화 중 가렸다."],
];

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k === "text") e.textContent = v; else e.setAttribute(k, v);
  }
  for (const c of children) if (c != null) e.append(c);
  return e;
}

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function player(item) {
  const video = el("video", { preload: "none", playsinline: "", poster: item.poster, src: item.video });
  const play = el("button", { type: "button", text: "▶ 재생", "aria-label": "재생/일시정지" });
  const bar = el("input", { type: "range", min: "0", max: "1000", value: "0", "aria-label": "재생 위치" });
  const time = el("span", { class: "time", text: `0:00 / ${fmt(item.duration)}` });
  const speed = el("select", { "aria-label": "재생 속도" });
  for (const r of ["1", "1.5", "2"]) speed.append(el("option", { value: r, text: `${r}×` }));
  const full = el("button", { type: "button", text: "전체 화면" });
  const toggle = () => (video.paused ? video.play() : video.pause());
  video.addEventListener("click", toggle);
  play.addEventListener("click", toggle);
  video.addEventListener("play", () => {
    document.querySelectorAll("video").forEach((v) => { if (v !== video) v.pause(); });
    play.textContent = "❚❚ 일시정지";
  });
  video.addEventListener("pause", () => (play.textContent = "▶ 재생"));
  video.addEventListener("timeupdate", () => {
    if (video.duration) bar.value = String(Math.round((video.currentTime / video.duration) * 1000));
    time.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration || item.duration)}`;
  });
  bar.addEventListener("input", () => {
    if (video.readyState === 0) video.load();
    const go = () => (video.currentTime = (Number(bar.value) / 1000) * (video.duration || item.duration));
    video.duration ? go() : video.addEventListener("loadedmetadata", go, { once: true });
  });
  speed.addEventListener("change", () => (video.playbackRate = Number(speed.value)));
  full.addEventListener("click", () => (video.requestFullscreen ? video.requestFullscreen() : video.webkitEnterFullscreen?.()));
  return [el("div", { class: "media" }, video), el("div", { class: "controls" }, play, bar, time, speed, full)];
}

function card(item) {
  const [media, controls] = player(item);
  const status = item.matched === true ? ["ok", "예상과 일치"] : item.matched === false ? ["bad", "예상과 다름"] : ["obs", "관찰"];
  const body = el("div", { class: "body" },
    el("div", { class: "head" }, el("span", { class: "id", text: item.id }), el("h3", { text: item.title })));
  for (const [k, v] of item.info || []) body.append(el("div", { class: "kv" }, el("span", { class: "k", text: k }), v));
  if (item.via) body.append(el("div", { class: "kv" }, el("span", { class: "k", text: "접속 경로" }), item.via));
  body.append(el("div", { class: "kv" }, el("span", { class: "k", text: "확인할 것" }), item.check));
  body.append(el("div", { class: "kv" }, el("span", { class: "k", text: "예상" }), item.expect,
    el("span", { class: `match ${status[0]}`, text: status[1] })));
  const res = el("div", { class: "result" });
  res.append(el("div", { class: "kv" }, el("span", { class: "k", text: "실제 결과" })));
  for (const line of item.result || []) res.append(el("div", { text: line }));
  body.append(res);
  if (item.steps?.length) {
    const ol = el("ol");
    for (const s of item.steps) ol.append(el("li", { text: s }));
    body.append(el("details", {}, el("summary", { text: "진행 단계" }), ol));
  }
  const meta = [`녹화 ${item.recordedAt} KST`, `${item.duration}초`];
  if (item.timelapse) meta.push(`대기 구간 ${item.timelapse}배속`);
  body.append(el("div", { class: "meta", text: meta.join(" · ") }));
  return el("article", { class: "card", id: item.id }, media, controls, body);
}

async function main() {
  const data = await (await fetch("data/manifest.json", { cache: "no-cache" })).json();
  const items = data.items || [];
  const pending = data.pending || [];
  const toc = document.getElementById("toc");
  const root = document.getElementById("main");
  for (const [key, name, desc] of GROUPS) {
    const list = items.filter((x) => x.group === key);
    const wait = pending.filter((x) => x.group === key);
    if (!list.length && !wait.length) continue;
    toc.append(el("a", { href: `#g-${key}`, text: `${name} (${list.length})` }));
    const grid = el("div", { class: "grid" });
    for (const item of list) grid.append(card(item));
    for (const p of wait) {
      grid.append(el("div", { class: "pending", id: p.id }, el("b", { text: p.id }), `${p.title} — ${p.reason}`));
    }
    root.append(el("section", { class: "group", id: `g-${key}` }, el("h2", { text: name }), el("p", { text: desc }), grid));
  }
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}

main();
