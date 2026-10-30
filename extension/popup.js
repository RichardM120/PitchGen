const DEFAULT_BASE = "https://cwcasting.com/pitchgen";
const $ = (id) => document.getElementById(id);

async function load() {
  const s = await chrome.storage.sync.get({ base: DEFAULT_BASE, slug: "" });
  $("base").value = s.base;
  try {
    const res = await fetch(`${s.base}/api/pitches`, { credentials: "include" });
    if (res.status === 401) throw new Error("Not signed in. Open PitchGen Studio in a tab, log in, then reopen this.");
    const { pitches } = await res.json();
    $("slug").innerHTML = pitches.map((p) => `<option value="${p.slug}" ${p.slug === s.slug ? "selected" : ""}>${p.title}${p.demo ? " (demo)" : ""}</option>`).join("");
  } catch (e) {
    $("slug").innerHTML = `<option value="">Could not load</option>`;
    $("status").innerHTML = `<span class="err">${e.message}</span>`;
  }
}

$("save").addEventListener("click", async () => {
  const slug = $("slug").value;
  const title = $("slug").selectedOptions[0]?.textContent || slug;
  const base = $("base").value.trim().replace(/\/$/, "") || DEFAULT_BASE;
  await chrome.storage.sync.set({ slug, title, base });
  $("status").textContent = slug ? `Right-click an image and choose "Save to PitchGen: ${title}".` : "Choose a pitch.";
});

$("base").addEventListener("change", load);
load();
