var playlistDfilter = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
if (x === "react") return Spicetify.React;
if (x === "react-dom") return Spicetify.ReactDOM;
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // src/app.tsx
  var import_react3 = __toESM(__require("react"));
  var import_react_dom = __toESM(__require("react-dom"));

  // src/components/PlaylistFilter.tsx
  var import_react2 = __toESM(__require("react"));

  // src/clients/SpotifyClient.ts
  var SpotifyClient = class {
    constructor() {
    }
    static async getLibrary() {
      const res = await Spicetify.Platform.RootlistAPI.getContents({ metadata: 1, policy: { picture: true } });
      return res.items;
    }
  };

  // src/constants/constants.ts
  var USE_KEYBOARD_SHORTCUTS = "useKeyboardShortcuts";

  // src/config/Config.ts
  var config = {
    [USE_KEYBOARD_SHORTCUTS]: true
  };
  for (const key in config) {
    if (localStorage.getItem(`playlistfilter:${key}`) !== null)
      config[key] = localStorage.getItem(`playlistfilter:${key}`) === "true";
  }
  function getConfig(key) {
    return config[key];
  }
  function toggleConfig(key) {
    config[key] = !config[key];
    localStorage.setItem(`playlistfilter:${key}`, config[key] ? "true" : "false");
  }

  // src/utils/utils.ts
  function flattenLibrary(library) {
    const playlists = [];
    for (const item of library) {
      if (item.type === "folder") {
        playlists.push(...flattenLibrary(item.items));
      } else {
        playlists.push(item);
      }
    }
    return playlists;
  }

  // src/components/PlaylistItem.tsx
  var import_react = __toESM(__require("react"));

  // src/components/styling/PlaylistItemStyling.tsx
  var listItemStyling = { zIndex: 5001 };
  var mainRootlistItemRootlistItemStyling = { marginLeft: 24 };

  // src/components/PlaylistItem.tsx
  var PlaylistItem = ({ playlist, searchTerm }) => {
    const getNameWithHighlightedSearchTerm = () => {
      const name = playlist.name;
      if (searchTerm === "")
        return name;
      else {
        let highlightedName = name.replace(new RegExp(searchTerm, "gi"), (match) => {
          return `<span style="background-color: rgb(255 255 255 / 8%); color: #fff;">${match}</span>`;
        });
        highlightedName = highlightedName.replace(/span> /g, "span>&nbsp;");
        highlightedName = highlightedName.replace(/ <span/g, "&nbsp;<span");
        highlightedName = highlightedName.replace(/ <\/span/g, "&nbsp;</span");
        return highlightedName;
      }
    };
    const goToPlaylist = (e) => {
      e.preventDefault();
      Spicetify.Platform.History.push({
        pathname: `/playlist/${playlist.uri.replace("spotify:playlist:", "")}`,
        search: "",
        hash: "",
        state: {
          referrer: "home",
          navigationalRoot: "home"
        },
        key: "bm6fp4"
      });
    };
    return /* @__PURE__ */ import_react.default.createElement("li", {
      className: "GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders",
      style: listItemStyling
    }, /* @__PURE__ */ import_react.default.createElement("div", {
      className: "main-rootlist-rootlistItem",
      draggable: "true",
      "aria-expanded": "false",
      style: mainRootlistItemRootlistItemStyling
    }, /* @__PURE__ */ import_react.default.createElement("a", {
      "aria-current": "page",
      className: "standalone-ellipsis-one-line main-rootlist-rootlistItemLink main-rootlist-rootlistItemLink--filtered-playlist",
      draggable: "false",
      href: `/playlist/${playlist.uri.replace("spotify:playlist:", "")}`,
      onClick: goToPlaylist
    }, /* @__PURE__ */ import_react.default.createElement("span", {
      className: "main-rootlist-textWrapper main-type-viola",
      dir: "auto"
    }, /* @__PURE__ */ import_react.default.createElement("span", {
      dangerouslySetInnerHTML: { __html: getNameWithHighlightedSearchTerm() }
    })))));
  };

  // src/components/styling/PlaylistFilterStyling.tsx
  var searchStyling = {
    display: "flex",
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 7
  };
  var clearButtonStyling = {
    width: 39,
    height: 39,
    padding: 12,
    backgroundColor: "transparent",
    fontWeight: "bold"
  };
  var searchInputStyling = {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    padding: 10,
    height: 39,
    color: "var(--text-subdued)",
    fontSize: "inherit"
  };
  var ulStyling = {
    contain: "none",
    paddingTop: 8,
    overflow: "scroll",
    height: "inherit",
    maxHeight: "calc(100% - 100px)"
  };

  // src/components/PlaylistFilter.tsx
  var SearchInput = ({ onFilter }) => {
    const [playlists, setPlaylists] = (0, import_react2.useState)([]);
    const [playlistContainer, setPlaylistContainer] = (0, import_react2.useState)(document.querySelector("#spicetify-playlist-list"));
    const [searchTerm, setSearchTerm] = (0, import_react2.useState)("");
    const getPlaylists = async () => {
      const library = await SpotifyClient.getLibrary();
      const playlists2 = flattenLibrary(library);
      setPlaylists(playlists2);
    };
    const searchInput = (0, import_react2.useRef)(null);
    (0, import_react2.useEffect)(() => {
      getPlaylists();
      Spicetify.Keyboard.registerImportantShortcut("f", async () => {
        if (getConfig(USE_KEYBOARD_SHORTCUTS)) {
          setImmediate(() => {
            if (searchInput.current)
              searchInput.current.focus();
          });
        }
      });
      setInterval(() => getPlaylists(), 1e3 * 30 * 60);
    }, []);
    const filterPlaylists = async (value) => {
      if (!playlistContainer)
        await setPlaylistContainer(document.querySelector("#spicetify-playlist-list"));
      await setSearchTerm(value === " " ? "" : value);
      if (value === "" || value === " ") {
        onFilter(true);
        playlistContainer == null ? void 0 : playlistContainer.removeAttribute("style");
      } else {
        onFilter(false);
        playlistContainer == null ? void 0 : playlistContainer.setAttribute("style", "display: none;");
      }
    };
    const clearFilter = async () => {
      await filterPlaylists(" ");
    };
    const searchResults = (0, import_react2.useMemo)(() => playlists.filter((playlist) => {
      return playlist.name.toLowerCase().includes(searchTerm.toLowerCase());
    }), [searchTerm]);
    const sortedSearchResults = (0, import_react2.useMemo)(() => searchResults.sort((a, b) => {
      const aMatch = a.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      const bMatch = b.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (aMatch > bMatch)
        return 1;
      else if (aMatch < bMatch)
        return -1;
      else
        return 0;
    }), [searchResults]);
    return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", {
      style: searchStyling
    }, /* @__PURE__ */ import_react2.default.createElement("input", {
      style: searchInputStyling,
      ref: searchInput,
      placeholder: "Filter",
      value: searchTerm,
      onChange: (e) => filterPlaylists(e.target.value),
      onKeyDown: (e) => {
        var _a;
        if (e.key === "Escape") {
          clearFilter();
          (_a = searchInput.current) == null ? void 0 : _a.blur();
        }
      }
    }), searchTerm !== "" && /* @__PURE__ */ import_react2.default.createElement("div", {
      style: clearButtonStyling,
      title: "Clear filter",
      onClick: clearFilter
    }, /* @__PURE__ */ import_react2.default.createElement("svg", {
      style: {
        fill: "var(--text-subdued)"
      },
      dangerouslySetInnerHTML: {
        __html: Spicetify.SVGIcons["x"]
      }
    }))), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "main-rootlist-rootlistDividerContainer"
    }, /* @__PURE__ */ import_react2.default.createElement("hr", {
      className: "main-rootlist-rootlistDivider"
    }), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "main-rootlist-rootlistDividerGradient"
    })), searchTerm && /* @__PURE__ */ import_react2.default.createElement("ul", {
      style: ulStyling
    }, sortedSearchResults.map((playlist, i) => /* @__PURE__ */ import_react2.default.createElement(PlaylistItem, {
      searchTerm,
      playlist,
      key: playlist.uri + i
    }))));
  };

  // src/menues/subMenues.ts
  function registerSubMenues() {
    const toggleKeyboardShortcuts = new Spicetify.Menu.Item("Use keyboard shortcut (f)", getConfig(USE_KEYBOARD_SHORTCUTS), (menuItem) => {
      toggleConfig(USE_KEYBOARD_SHORTCUTS);
      menuItem.isEnabled = getConfig(USE_KEYBOARD_SHORTCUTS);
    });
    new Spicetify.Menu.SubMenu("Playlist filter", [toggleKeyboardShortcuts]).register();
  }

  // src/app.tsx
  async function main() {
    const sidebarItem = await waitForSidebar();
    const div = document.createElement("div");
    const onFilter = (searchCleared) => {
      if (searchCleared)
        div.removeAttribute("style");
      else
        div.setAttribute("style", "height: 100vh; max-height: 100%;");
    };
    import_react_dom.default.render(/* @__PURE__ */ import_react3.default.createElement(SearchInput, {
      onFilter
    }), div);
    sidebarItem.parentNode.insertBefore(div, sidebarItem.nextSibling);
    registerSubMenues();
  }
  var app_default = main;
  async function waitForSidebar() {
    const query = ".main-rootlist-rootlistDividerContainer";
    let playlistPanel = document.querySelector(query);
    while (!playlistPanel) {
      playlistPanel = document.querySelector(query);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return playlistPanel;
  }

  // node_modules/spicetify-creator/dist/temp/index.jsx
  (async () => {
    await app_default();
  })();
})();

