import { autocompleteCount, isOn } from ".";
import { getBlocksIncludingRefByTitle } from "./utils";

var runners = {
  menuItems: [],
  observers: [],
};
var refs = [];
var counters = [];

export function connectObservers() {
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

function onBlockUpdate(mutation) {
  if (
    mutation[0].target.closest(".roam-sidebar-container") &&
    mutation[0].target.className === "ref-count-extension"
    //mutation[0].target.closest(".rm-topbar")
  )
    return;
  else if (mutation[0].target.closest(".rm-topbar")) {
    let search = document.querySelector(".rm-find-or-create__menu");
    if (autocompleteCount && search) onSearch(search);
    else return;
  }
  //console.log(mutation);
  if (isOn) {
    for (let i = 0; i < mutation.length; i++) {
      if (
        mutation[i].addedNodes.length > 0 &&
        mutation[i].target.localName != "span" &&
        mutation[i].target.localName != "textarea"
      ) {
        if (mutation[i].addedNodes[0].classList?.contains("rm-block")) {
          //  console.log("blocks expanded");
          insertSupAfterRefs(mutation[i].addedNodes[0]);
          //return;
        } else if (
          mutation[i].addedNodes[0].classList?.contains("rm-block__input")
        ) {
          // console.log("block updated");
          insertSupAfterRefs(mutation[i].target);
          //return;
        } else if (
          mutation[i].addedNodes[0].classList?.contains("rm-mentions") ||
          mutation[i].addedNodes[0].parentElement?.className ===
            "rm-ref-page-view"
        ) {
          //console.log("In Linked refs");
          let elt = mutation[i].target.querySelectorAll(
            ".roam-block-container"
          );
          elt.forEach((node) => {
            insertSupAfterRefs(node);
          });
          return;
        } else if (
          //console.log("In right sidebar");
          mutation[i].addedNodes[0].parentElement?.className ===
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
    onAutocomplete();
    //return;
  }
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
          let count = getCountOptimized(title);
          displayCounter(ref.childNodes[0].childNodes[0], count);
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
      let count = getCountOptimized(textTitle);
      displayCounter(title.childNodes[0], count);
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
  refs = [];
  counters = [];
  setTimeout(() => {
    insertSupAfterRefs();
  }, 50);
  setTimeout(() => {
    connectObservers();
  }, 500);
}

function insertSupAfterRefs(elt = document) {
  refs = [];
  counters = [];
  //let b, e;
  setTimeout(() => {
    let mentions = elt.querySelectorAll(".rm-page-ref--link");
    //    b = performance.now();
    mentions.forEach((mention) => {
      let title = mention.parentElement.dataset.linkTitle;
      displayCounter(mention, getCountOptimized(title));
    });
    //    e = performance.now();
    //    console.log(`1: ${e - b}`);

    let tags = elt.querySelectorAll(".rm-page-ref--tag");
    tags.forEach((mention) => {
      let title = mention.dataset.tag;
      if (!title.includes("c:") && !(title.indexOf(".") == 0))
        displayCounter(mention, getCountOptimized(title));
    });
  }, 20);
}

function getCountOptimized(title) {
  let index = refs.indexOf(title);
  let count;
  if (index != -1) {
    count = counters[index];
  } else {
    count = getBlocksIncludingRefByTitle(title);
    refs.push(title);
    counters.push(count);
  }
  return count;
}

function displayCounter(target, counter) {
  let elt = document.createElement("span");
  elt.innerHTML = `<sup class="ref-count-extension">${counter}</sup>`;
  target.nextSibling && !target.dataset?.tag
    ? insertAfter(target.nextSibling, elt)
    : insertAfter(target, elt);
}

export function hiddeCounters(elt = document) {
  let counters = elt.querySelectorAll(".ref-count-extension");
  counters.forEach((c) => c.remove());
}

export function toggleCounters(isOn) {
  if (isOn) {
    hiddeCounters();
    //disconnectObserver("tags");
    disconnectObserver("sidebar");
    removeListeners();
  } else {
    onPageLoad();
    addListeners();
  }
}

function insertAfter(existingNode, newNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

// on right click:
// class="bp3-fill bp3-text-overflow-ellipsis" + innerText === "Open in new window/tab"
// ajouter un 'li' "n references"
// ouvrir les références
// + ouvrir le graph ?
