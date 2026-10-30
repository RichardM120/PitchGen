// Save to PitchGen: context menu on images. The image is fetched inside the
// page's tab (so ShotDeck's login cookies apply), then posted to PitchGen's
// /api/clip with the page URL as the credit. PitchGen's own admin cookie is
// sent because the base URL is in host_permissions.

const DEFAULT_BASE = "https://cwcasting.com/pitchgen";

async function settings() {
  const s = await chrome.storage.sync.get({ base: DEFAULT_BASE, slug: "", title: "" });
  return s;
}

async function rebuildMenu() {
  const { slug, title } = await settings();
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "save",
    title: slug ? `Save to PitchGen: ${title || slug}` : "Save to PitchGen (choose a pitch first)",
    contexts: ["image"],
    enabled: Boolean(slug),
  });
}

chrome.runtime.onInstalled.addListener(rebuildMenu);
chrome.runtime.onStartup.addListener(rebuildMenu);
chrome.storage.onChanged.addListener(rebuildMenu);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "save" || !info.srcUrl || !tab?.id) return;
  const { base, slug } = await settings();
  try {
    // Fetch in the page so the site's own cookies are used.
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (src) => {
        const r = await fetch(src, { credentials: "include" });
        if (!r.ok) throw new Error(`Image fetch failed (${r.status})`);
        const b = await r.blob();
        const buf = await b.arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return { b64: btoa(bin), type: b.type || "image/jpeg", title: document.title, url: location.href };
      },
      args: [info.srcUrl],
    });

    const bytes = Uint8Array.from(atob(result.b64), (c) => c.charCodeAt(0));
    const ext = (result.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const fd = new FormData();
    fd.set("file", new Blob([bytes], { type: result.type }), `${(result.title || "frame").slice(0, 60).replace(/[^a-zA-Z0-9 ]/g, "")}.${ext}`);
    fd.set("slug", slug);
    fd.set("credit", result.title);
    fd.set("pageUrl", result.url);

    const res = await fetch(`${base}/api/clip`, { method: "POST", body: fd, credentials: "include" });
    if (res.status === 401) throw new Error("Not signed in to PitchGen. Open the Studio and log in, then try again.");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `PitchGen said ${res.status}`);
    notify("Saved to PitchGen", `Added to ${slug}. Find it in the Media tab.`);
  } catch (e) {
    notify("Could not save", String(e.message || e));
  }
});

function notify(title, message) {
  chrome.notifications.create({ type: "basic", iconUrl: "icons/128.png", title, message });
}
