const DEFAULTS = {
  instanceUrl: "",
  searchMode: "new"
};

function normalizeInstanceUrl(raw) {
  let v = (raw || "").trim();

  if (!v) return "";

  // If user typed only instance name (e.g. "dev12345"), assume service-now.com
  if (!v.includes(".") && !v.startsWith("http")) {
    v = `https://${v}.service-now.com`;
  }

  // If user typed a domain without scheme, add https
  if (!v.startsWith("http://") && !v.startsWith("https://")) {
    v = `https://${v}`;
  }

  // Remove trailing slash
  v = v.replace(/\/+$/, "");
  return v;
}

function buildSearchUrl(instanceUrl, searchMode, query) {
  const q = encodeURIComponent(query);

  // ServiceNow KB: new search uses $sn_global_search_results.do,
  // and provides an exact-match helper endpoint text_search_exact_match.do. [3](https://support.servicenow.com/kb/kb/kb/kb?id=kb_article_view&sysparm_article=KB0681156)
  if (searchMode === "exact") {
    return `${instanceUrl}/text_search_exact_match.do?sysparm_search=${q}`;
  }

  // Legacy global text search often uses textsearch.do (may redirect on newer versions). [4](https://snprotips.com/blog/2019/using-custom-search-engines-in-chrome-to-quickly-navigate-servicenow)[3](https://support.servicenow.com/kb/kb/kb/kb?id=kb_article_view&sysparm_article=KB0681156)
  if (searchMode === "legacy") {
    return `${instanceUrl}/textsearch.do?sysparm_search=${q}`;
  }

  // Default: new global search results endpoint. [3](https://support.servicenow.com/kb/kb/kb/kb?id=kb_article_view&sysparm_article=KB0681156)
  return `${instanceUrl}/$sn_global_search_results.do?sysparm_search=${q}`;
}

async function getSettings() {
  return await chrome.storage.sync.get(DEFAULTS);
}

function showError(msg) {
  const el = document.getElementById("error");
  el.textContent = msg;
  el.style.display = "block";
}

function clearError() {
  const el = document.getElementById("error");
  el.textContent = "";
  el.style.display = "none";
}

async function runSearch() {
  clearError();

  const query = (document.getElementById("query").value || "").trim();
  if (!query) return;

  const settings = await getSettings();
  const instanceUrl = normalizeInstanceUrl(settings.instanceUrl);

  if (!instanceUrl) {
    showError("Please set your ServiceNow domain in Options first.");
    chrome.runtime.openOptionsPage();
    return;
  }

  const url = buildSearchUrl(instanceUrl, settings.searchMode, query);
  chrome.tabs.create({ url });
}

document.getElementById("go").addEventListener("click", runSearch);
document.getElementById("query").addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

document.getElementById("openOptions").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});