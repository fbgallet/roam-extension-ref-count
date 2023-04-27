import { autocompleteCount, isOn } from ".";
import {
  displayCounter,
  getCountOptimized,
  hiddeCounters,
  insertSupAfterRefs,
} from "./display";
import { getUidByPageTitle } from "./utils";

var runners = {
  menuItems: [],
  observers: [],
};
export var refs = [];
export var counters = [];

export function connectObservers(logPage = null) {
  if (autocompleteCount || isOn)
    addObserver(
      document.getElementsByClassName("roam-app")[0],
      onBlockUpdate,
      {
        childList: true,
        subtree: true,
      },
      "tags"
    );
  if (isOn)
    addObserver(
      document.getElementById("right-sidebar"),
      onSidebarOpen,
      {
        childList: true,
        subtree: false,
      },
      "sidebar"
    );
  if (logPage) {
    addObserver(
      document.getElementsByClassName("roam-log-container")[0],
      onNewPageInDailyLog,
      {
        childList: true,
        subtree: false,
      },
      "logs"
    );
  }
}

function addObserver(element, callback, options, name) {
  let myObserver = new MutationObserver(callback);
  myObserver.observe(element, options);

  runners[name] = [myObserver];
}
export function disconnectObserver(name) {
  if (runners[name])
    for (let index = 0; index < runners[name].length; index++) {
      const element = runners[name][index];
      element.disconnect();
    }
}

function onSidebarOpen(mutation) {
  setTimeout(() => {
    for (let i = 0; i < mutation.length; i++) {
      if (mutation[i].addedNodes.length > 0) {
        if (
          mutation[i].addedNodes[0].className != "rm-resize-handle" &&
          mutation[i].addedNodes[0].id === "roam-right-sidebar-content" &&
          mutation[i].addedNodes[0].innerText !=
            "Shift-click bidirectional links, blocks, or block references to open them here."
        ) {
          insertSupAfterRefs(mutation[i].target);
          return;
        }
      }
    }
  }, 50);
}

function onNewPageInDailyLog(mutation) {
  setTimeout(() => {
    insertSupAfterRefs();
  }, 50);
}

function onBlockUpdate(mutation) {
  if (mutation[0].target.closest(".rm-topbar")) {
    let search = document.querySelector(".rm-find-or-create__menu");
    if (autocompleteCount && search) onSearch(search);
    else return;
  }
  if (isOn) {
    if (
      (mutation[0].target.closest(".roam-sidebar-container") &&
        mutation[0].target.className === "ref-count-extension") ||
      // mutations in code block
      mutation[0].target.className.includes("cm-")
    )
      return;
    //console.log(mutation);
    for (let i = 0; i < mutation.length; i++) {
      if (
        mutation[i].addedNodes.length > 0 &&
        mutation[i].target.localName != "span" &&
        mutation[i].target.localName != "textarea"
      ) {
        if (mutation[0].addedNodes[0]?.classList?.contains("rm-block")) {
          // console.log("blocks expanded");
          // console.log(mutation);
          insertSupAfterRefs(mutation[0].target);
          // .target contains all children blocks, no need to process all mutations.addedNodes
          //insertSupAfterRefs(mutation[i].addedNodes[0]);
          return;
        } else if (
          mutation[i].addedNodes[0]?.classList?.contains("rm-block__input")
        ) {
          // console.log("block updated");
          insertSupAfterRefs(mutation[i].target);
          //return;
        } else if (
          mutation[i].addedNodes[0]?.classList?.contains("rm-mentions") ||
          mutation[i].addedNodes[0]?.parentElement?.className ===
            "rm-ref-page-view"
        ) {
          // console.log("In Linked refs");
          insertSupAfterRefs(mutation[i].target);
          /*let elt = mutation[i].target.querySelectorAll(
            ".roam-block-container"
          );
          elt.forEach((node) => {
            insertSupAfterRefs(node);
          });
          return;*/
        } else if (
          //console.log("In right sidebar");
          mutation[i].addedNodes[0]?.parentElement?.className ===
          "sidebar-content"
        ) {
          insertSupAfterRefs(mutation[i].addedNodes[0]);
          return;
        } else if (mutation[i].target.className === "rm-sidebar-window") {
          insertSupAfterRefs(mutation[i].target);
          return;
        }
      }
    }
  }
  if (
    autocompleteCount &&
    document.querySelector(".rm-autocomplete__results")
  ) {
    // if (
    //   mutation[0].target.value.slice(
    //     mutation[0].target.selectionStart,
    //     mutation[0].target.selectionStart + 2
    //   ) === "]]"
    // )
    if (
      isPageAutocomplete(
        mutation[0].target.value
          ? mutation[0].target.value.slice(0, mutation[0].target.selectionStart)
          : ""
      )
    )
      onAutocomplete();
  }
}

function isPageAutocomplete(content) {
  const autocompleteTriggerRegex = /\[\[|\#|\(\(|;;/g;
  let matches = content.match(autocompleteTriggerRegex);
  if (!matches) return true;
  let lastMatch = matches[matches.length - 1];
  if (lastMatch === "((" || lastMatch === ";;") return false;
  return true;
}

function onAutocomplete() {
  const blockAutocomplete = document.getElementsByClassName(
    "rm-autocomplete__results"
  )[0];
  //console.log(blockAutocomplete);
  if (blockAutocomplete) {
    let suggestions = blockAutocomplete.querySelectorAll(".dont-unfocus-block");
    if (suggestions) {
      // if block autocomplete, stop here
      if (suggestions[0].querySelector(".bp3-text-overflow-ellipsis")) {
        return;
      }
      hiddeCounters(blockAutocomplete);
      suggestions.forEach((ref) => {
        let title = ref.getAttribute("title");
        if (title != "Search for a Page" && title != "Search for a Block") {
          let uid = getUidByPageTitle(title);
          displayCounter(
            ref.childNodes[0].childNodes[0],
            getCountOptimized(title, uid),
            "autocomplete",
            "ref-count-visible"
          );
        }
      });
    }
  }
}

function onSearch(searchMenu) {
  // get only pages title
  let titles = searchMenu.querySelectorAll(".rm-search-title");
  hiddeCounters(searchMenu);
  disconnectObserver("tags");
  titles.forEach((title) => {
    let textTitle = title.childNodes[0].textContent;
    if (!textTitle.includes("New Page:")) {
      let uid = getUidByPageTitle(textTitle);
      displayCounter(
        title.childNodes[0],
        getCountOptimized(textTitle, uid),
        "autocomplete",
        "ref-count-visible"
      );
    }
  });
  connectObservers();
}

export function addListeners() {
  window.addEventListener("popstate", onPageLoad);
}

export function removeListeners() {
  window.removeEventListener("popstate", onPageLoad);
}

export function onPageLoad(e) {
  disconnectObserver("tags");
  disconnectObserver("sidebar");
  disconnectObserver("logs");
  refs.length = 0;
  setTimeout(() => {
    insertSupAfterRefs();
  }, 50);
  setTimeout(() => {
    let logPage = document.querySelector(".roam-log-container");
    connectObservers(logPage);
  }, 500);
}

export function toggleCounters(isOn) {
  if (isOn) {
    hiddeCounters();
    refs.length = 0;
    //disconnectObserver("tags");
    disconnectObserver("sidebar");
    disconnectObserver("logs");
    removeListeners();
  } else {
    onPageLoad();
    addListeners();
  }
}

// on right click:
// class="bp3-fill bp3-text-overflow-ellipsis" + innerText === "Open in new window/tab"
// ajouter un 'li' "n references"
// ouvrir les références
// + ouvrir le graph ?
