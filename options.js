const DEFAULTS = {
  instanceUrl: "",
  searchMode: "new"
};

function normalizeInstanceUrl(raw) {
  let v = (raw || "").trim();
  if (!v) return "";

  if (!v.includes(".") && !v.startsWith("http")) {
    v = `https://${v}.service-now.com`;
  }
  if (!v.startsWith("http://") && !v.startsWith("https://")) {
    v = `https://${v}`;
  }
  v = v.replace(/\/+$/, "");
  return v;
}

function buildSearchUrl(instanceUrl, searchMode, query) {
  const q = encodeURIComponent(query);
  if (searchMode === "exact") return `${instanceUrl}/text_search_exact_match.do?sysparm_search=${q}`;
  if (searchMode === "legacy") return `${instanceUrl}/textsearch.do?sysparm_search=${q}`;
  return `${instanceUrl}/$sn_global_search_results.do?sysparm_search=${q}`;
}

async function restore() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById("instanceUrl").value = settings.instanceUrl || "";
  document.getElementById("searchMode").value = settings.searchMode || "new";
}

async function save() {
  const rawUrl = document.getElementById("instanceUrl").value;
  const searchMode = document.getElementById("searchMode").value;

  const instanceUrl = normalizeInstanceUrl(rawUrl);

  await chrome.storage.sync.set({ instanceUrl, searchMode });

  const status = document.getElementById("status");
  status.textContent = "Saved.";
  status.style.display = "block";
  setTimeout(() => (status.style.display = "none"), 900);
}

async function testSearch() {
  await save();
  const { instanceUrl, searchMode } = await chrome.storage.sync.get(DEFAULTS);

  if (!instanceUrl) return;

  const url = buildSearchUrl(instanceUrl, searchMode, "INC0010001");
  chrome.tabs.create({ url });
}

document.addEventListener("DOMContentLoaded", restore);
document.getElementById("save").addEventListener("click", save);
document.getElementById("test").addEventListener("click", testSearch);