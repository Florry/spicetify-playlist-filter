var playlistDartwork = (() => {
  // src/utils/htmlUtils.ts
  var imgElemCache = {};
  function createImageElement(src, playlistId) {
    if (imgElemCache[src + playlistId])
      return imgElemCache[src + playlistId];
    const img = document.createElement("img");
    img.setAttribute("style", "display: inline; margin-right: 10px;border-radius: 2px;");
    img.setAttribute("height", "21");
    img.setAttribute("width", "21");
    img.setAttribute("src", src);
    imgElemCache[src + playlistId] = img;
    return img;
  }
  var folderSvgElemCache;
  function createFolderElement() {
    if (folderSvgElemCache)
      return folderSvgElemCache.cloneNode(true);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = Spicetify.SVGIcons["playlist-folder"];
    svg.setAttribute("height", "16");
    svg.setAttribute("width", "16");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("style", "margin-right: 12px;margin-bottom:3px;margin-left:2px;");
    folderSvgElemCache = svg;
    return svg;
  }
  var missingArtworkSvgElemCache;
  function createMissingArtworkImg() {
    if (missingArtworkSvgElemCache)
      return missingArtworkSvgElemCache.cloneNode(true);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 80 81");
    svg.setAttribute("style", "margin-right: 15px;");
    svg.setAttribute("height", "25");
    svg.setAttribute("width", "20");
    path.setAttribute("d", "M25.6 11.565v45.38c-2.643-3.27-6.68-5.37-11.2-5.37-7.94 0-14.4 6.46-14.4 14.4s6.46 14.4 14.4 14.4 14.4-6.46 14.4-14.4v-51.82l48-10.205V47.2c-2.642-3.27-6.678-5.37-11.2-5.37-7.94 0-14.4 6.46-14.4 14.4s6.46 14.4 14.4 14.4S80 64.17 80 56.23V0L25.6 11.565zm-11.2 65.61c-6.176 0-11.2-5.025-11.2-11.2 0-6.177 5.024-11.2 11.2-11.2 6.176 0 11.2 5.023 11.2 11.2 0 6.174-5.026 11.2-11.2 11.2zm51.2-9.745c-6.176 0-11.2-5.024-11.2-11.2 0-6.174 5.024-11.2 11.2-11.2 6.176 0 11.2 5.026 11.2 11.2 0 6.178-5.026 11.2-11.2 11.2z");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
    svg.append(path);
    missingArtworkSvgElemCache = svg;
    return svg;
  }
  function getPlaylistPanel() {
    return document.getElementsByClassName("os-viewport os-viewport-native-scrollbars-invisible").item(0);
  }
  async function waitForPlaylistPanel() {
    let playlistPanel = getPlaylistPanel();
    while (!playlistPanel) {
      playlistPanel = getPlaylistPanel();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return playlistPanel;
  }

  // src/utils/utils.ts
  function getPlaylistId(href) {
    return href.split("/").pop();
  }
  async function waitForSpicetify() {
    while (!(Spicetify.CosmosAsync && Spicetify.Queue && Spicetify.ContextMenu && Spicetify.URI)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // src/utils/playlistUtils.ts
  var _cache;
  function registerPlaylistUtilsCache(cache) {
    _cache = cache;
  }
  function addArtworkToPlaylists() {
    const playlists = document.getElementsByClassName("main-rootlist-rootlistItemLink");
    Array.from(playlists).forEach(async (playlist) => addArtworkToPlaylist(playlist));
  }
  var requestsInProgress = {};
  async function addArtworkToPlaylist(playlist) {
    var _a, _b, _c, _d;
    const playlistTextElement = playlist.firstElementChild;
    const playlistHref = playlist.attributes.getNamedItem("href").value;
    const playlistId = getPlaylistId(playlistHref);
    if (requestsInProgress[playlistId])
      return;
    if (playlistHref.includes("/playlist/") && ((_a = playlistTextElement == null ? void 0 : playlistTextElement.firstChild) == null ? void 0 : _a.nodeName) !== "IMG") {
      const playlistId2 = getPlaylistId(playlistHref);
      requestsInProgress[playlistId2] = true;
      const artworkUrl = await _cache.getArtworkUrl(playlistId2);
      requestsInProgress[playlistId2] = false;
      if (((_b = playlistTextElement == null ? void 0 : playlistTextElement.firstChild) == null ? void 0 : _b.nodeName) === "IMG")
        return;
      playlistTextElement.setAttribute("style", "display: flex;align-items: center;");
      let imgElement;
      if (artworkUrl)
        imgElement = createImageElement(artworkUrl, playlistId2);
      else {
        if (((_c = playlistTextElement == null ? void 0 : playlistTextElement.firstChild) == null ? void 0 : _c.nodeName) === "svg")
          return;
        imgElement = createMissingArtworkImg();
      }
      playlistTextElement.prepend(imgElement);
    } else if (!playlistHref.includes("/playlist/") && ((_d = playlistTextElement == null ? void 0 : playlistTextElement.firstChild) == null ? void 0 : _d.nodeName) !== "svg") {
      playlistTextElement.setAttribute("style", "display: flex;align-items: center;");
      const folderElement = createFolderElement();
      playlistTextElement.prepend(folderElement);
    }
  }

  // src/listeners/eventListeners.ts
  async function registerEventListeners() {
    const playlistPanel = await waitForPlaylistPanel();
    const observer = new MutationObserver(() => setImmediate(() => addArtworkToPlaylists()));
    observer.observe(playlistPanel, { childList: true, subtree: true });
  }

  // src/menues/contextMenues.ts
  var _cache2;
  function registerContextMenues(cache) {
    _cache2 = cache;
    const cntxMenu = new Spicetify.ContextMenu.Item("Refresh playlist artwork", async (uris) => {
      await removeFromCache(uris[0]);
      Spicetify.showNotification("Refreshed playlist artwork");
    }, (uris) => {
      return uris[0] && uris[0].includes("spotify:playlist");
    }, "playlist-folder");
    cntxMenu.register();
  }
  async function removeFromCache(uri) {
    var _a, _b;
    const playlistId = uri.replace("spotify:playlist:", "");
    await _cache2.deleteUri(playlistId);
    const playlists = document.getElementsByClassName("main-rootlist-rootlistItemLink");
    const playlistToRefetch = Array.from(playlists).find((playlist) => playlist.attributes.getNamedItem("href").value);
    if (playlistToRefetch) {
      const playlistTextElement = playlistToRefetch.firstElementChild;
      if (((_a = playlistTextElement == null ? void 0 : playlistTextElement.firstElementChild) == null ? void 0 : _a.nodeName) === "IMG" || ((_b = playlistTextElement == null ? void 0 : playlistTextElement.firstElementChild) == null ? void 0 : _b.nodeName) === "svg")
        playlistTextElement == null ? void 0 : playlistTextElement.removeChild(playlistTextElement == null ? void 0 : playlistTextElement.firstChild);
      setTimeout(() => addArtworkToPlaylist(playlistToRefetch));
    }
  }

  // src/menues/subMenues.ts
  var _cache3;
  function registerSubMenues(cache) {
    _cache3 = cache;
    const resetPlaylistCache = new Spicetify.Menu.Item("Refresh playlist artwork cache", void 0, (menuItem) => {
      refreshCache();
    });
    new Spicetify.Menu.SubMenu("Playlist-artwork", [resetPlaylistCache]).register();
  }
  async function refreshCache() {
    await _cache3.clear();
    removeAlbumArt();
    setTimeout(() => addArtworkToPlaylists());
    Spicetify.showNotification("Refreshed playlist artwork cache");
  }
  function removeAlbumArt() {
    const playlists = document.getElementsByClassName("main-rootlist-rootlistItemLink");
    Array.from(playlists).forEach((playlist) => {
      var _a, _b;
      const playlistTextElement = playlist.firstElementChild;
      if (((_a = playlistTextElement == null ? void 0 : playlistTextElement.firstElementChild) == null ? void 0 : _a.nodeName) === "IMG" || ((_b = playlistTextElement == null ? void 0 : playlistTextElement.firstElementChild) == null ? void 0 : _b.nodeName) === "svg")
        playlistTextElement.removeChild(playlistTextElement == null ? void 0 : playlistTextElement.firstChild);
    });
  }

  // src/constants/dbConstants.ts
  var CACHE_DB_NAME = "playlist-artwork-cache";
  var CACHE_DB_KEY = "playlist-artwork";
  var DB_VERSION = 1;

  // src/data/CosmosClient.ts
  var CosmosClient = class {
    constructor() {
    }
    static async getPlaylistArtwork(playlistId) {
      const uri = Spicetify.URI.fromString(`spotify:playlist:${playlistId}`);
      const res = await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${uri}/metadata`, { policy: { picture: true } });
      return res.metadata.picture;
    }
  };

  // src/repos/Cache.ts
  var Cache = class {
    constructor(db) {
      this.db = db;
      this.inMemoryCache = {};
    }
    static async connect() {
      return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(CACHE_DB_NAME, DB_VERSION);
        openRequest.onupgradeneeded = () => {
          const db = openRequest.result;
          if (!db.objectStoreNames.contains(CACHE_DB_KEY))
            db.createObjectStore(CACHE_DB_KEY, { keyPath: "uri" });
        };
        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction(CACHE_DB_KEY, "readonly");
          const store = transaction.objectStore(CACHE_DB_KEY);
          const request = store.getAll();
          request.onsuccess = () => {
            const repo = new Cache(db);
            request.result.forEach((item) => repo.inMemoryCache[item.uri] = item.artworkUrl);
            resolve(repo);
          };
        };
        openRequest.onerror = () => reject(openRequest.error);
      });
    }
    addUri(uri, artworkUrl) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(CACHE_DB_KEY, "readwrite");
        const store = transaction.objectStore(CACHE_DB_KEY);
        const request = store.add({
          uri,
          artworkUrl
        });
        request.onsuccess = () => {
          this.inMemoryCache[uri] = artworkUrl;
          resolve(this.inMemoryCache[uri]);
        };
        request.onerror = () => reject(request.error);
      });
    }
    async getArtworkUrl(uriString) {
      if (uriString in this.inMemoryCache)
        return this.inMemoryCache[uriString];
      const dbContents = await this.get(uriString);
      if (dbContents)
        return dbContents;
      const picture = await CosmosClient.getPlaylistArtwork(uriString);
      this.addUri(uriString, picture);
      return picture;
    }
    get(uri) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(CACHE_DB_KEY, "readwrite");
        const store = transaction.objectStore(CACHE_DB_KEY);
        const request = store.get(uri);
        request.onsuccess = () => {
          this.inMemoryCache[uri] = request.result;
          resolve(this.inMemoryCache[uri]);
        };
        request.onerror = () => reject(request.error);
      });
    }
    deleteUri(uri) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(CACHE_DB_KEY, "readwrite");
        const store = transaction.objectStore(CACHE_DB_KEY);
        const request = store.delete(uri);
        request.onsuccess = () => {
          delete this.inMemoryCache[uri];
          resolve(void 0);
        };
        request.onerror = () => reject(request.error);
      });
    }
    clear() {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(CACHE_DB_KEY, "readwrite");
        const store = transaction.objectStore(CACHE_DB_KEY);
        const request = store.clear();
        request.onsuccess = () => {
          Object.keys(this.inMemoryCache).forEach((uri) => {
            delete this.inMemoryCache[uri];
          });
          resolve(void 0);
        };
        request.onerror = () => reject(request.error);
      });
    }
  };

  // src/app.tsx
  async function main() {
    const cache = await Cache.connect();
    await waitForPlaylistPanel();
    registerEventListeners();
    await waitForSpicetify();
    registerPlaylistUtilsCache(cache);
    registerContextMenues(cache);
    registerSubMenues(cache);
    Spicetify.showNotification("Playlist artwork loaded");
  }
  var app_default = main;

  // node_modules/spicetify-creator/dist/temp/index.jsx
  (async () => {
    await app_default();
  })();
})();
