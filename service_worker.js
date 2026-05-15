const DEFAULTS = {
  instanceUrl: "",
  searchMode: "new" // "new" | "legacy" | "exact"
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(DEFAULTS);

  // If not configured, open options page on install/update
  if (!stored.instanceUrl || !stored.instanceUrl.trim()) {
    chrome.runtime.openOptionsPage();
  }
});