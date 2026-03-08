import {
  attributeCounter,
  countClass,
  countOpacity,
  countSize,
  displayPageStatus,
  referenceCounter,
  reversePageStatus,
  tagCounter,
} from ".";
import { refs } from "./observers";
import {
  getBlocksIncludingRefByTitle,
  getUidByPageTitle,
  insertAfter,
  isVoidPage,
} from "./utils";

// exclude format tags: #. , #c: , #c- , #blck: , #blck-
const excludedTags = /^\..*|^c:.*|^c-.*|^blck[:|-|border].*|sup|sub|sticky/;

export function insertSupAfterRefs(elt = document) {
  setTimeout(() => {
    if (referenceCounter) {
      let mentions = elt.querySelectorAll(
        ".rm-page-ref--link:not(.parent-path-wrapper .rm-page-ref--link), .rm-page-ref--namespace"
      );
      mentions.forEach((mention) => {
        if (!hasCount(mention)) {
          let title = mention.parentElement.dataset.linkTitle;
          let uid = mention.parentElement.dataset.linkUid;
          displayCounter(mention, getCountOptimized(title, uid), "ref");
        }
      });
      let refPageTitles = elt.querySelectorAll(
        ".rm-ref-page-view-title .rm-page__title"
      );
      refPageTitles.forEach((titleSpan) => {
        if (!hasCount(titleSpan)) {
          let title = titleSpan.textContent;
          let uid = getUidByPageTitle(title);
          displayCounter(titleSpan, getCountOptimized(title, uid), "ref");
        }
      });
    }
    if (tagCounter) {
      let tags = elt.querySelectorAll(
        ".rm-page-ref--tag:not(.parent-path-wrapper .rm-page-ref--tag)"
      );
      tags.forEach((mention) => {
        if (!hasCount(mention)) {
          let title = mention.dataset.tag;
          if (!isExcludedFromCount(title))
            displayCounter(mention, getCountOptimized(title), "tag");
        }
      });
    }
    if (attributeCounter) {
      let attributs = elt.querySelectorAll(
        ".rm-attr-ref:not(.parent-path-wrapper .rm-attr-ref)"
      );
      attributs.forEach((attr) => {
        if (!hasCount(attr)) {
          let title = attr.textContent.slice(0, -1);
          displayCounter(attr, getCountOptimized(title), "attribute");
        }
      });
    }
  }, 20);
}

function hasCount(elt) {
  let n = elt.nextSibling?.firstChild?.nodeName;
  if (n === "SUP") return true;
  else {
    let n2 = elt.nextSibling?.nextSibling?.firstChild?.nodeName;
    if (n2 === "SUP") return true;
    return false;
  }
}

function isExcludedFromCount(title) {
  if (excludedTags.test(title)) return true;
  else return false;
}

export function getCountOptimized(title, uid = null) {
  let count;
  let isVoid = null;
  const cached = refs.get(title);
  if (cached) {
    count = cached.count;
    isVoid = cached.isVoid;
    uid = uid ? uid : cached.uid;
  } else {
    count = getBlocksIncludingRefByTitle(title);
    uid = displayPageStatus ? (uid ? uid : getUidByPageTitle(title)) : null;
    isVoid = displayPageStatus ? isVoidPage(uid) : null;
    if (uid)
      refs.set(title, { count, isVoid, uid });
  }
  return { count, isVoid, uid };
}

export function displayCounter(
  target,
  counter,
  type,
  displayClass = countClass
) {
  let elt = document.createElement("span");
  elt.addEventListener(
    "mousedown",
    () => {
      clickOnCount(counter);
    },
    {
      once: true,
    }
  );

  elt.innerHTML = `<sup class="${displayClass} ${countOpacity} ${countSize} ${
    displayPageStatus
      ? counter.isVoid
        ? reversePageStatus ? "rc-notvoid-page" : "rc-void-page"
        : reversePageStatus ? "rc-void-page" : "rc-notvoid-page"
      : ""
  }">${counter.count}</sup>`;
  switch (type) {
    case "ref":
      if (target.nextSibling && displayClass == "ref-count-visible") {
        insertAfter(target.nextSibling, elt);
        break;
      }
    // case "tag":
    // insertAfter(target.nextSibling, elt);
    // insertAfter(target, elt);
    // break;
    // case "attribute":
    //   target.insertAdjacentElement("beforeend", elt);
    //   break;
    default:
      insertAfter(target, elt);
  }
}

function clickOnCount(counter) {
  window.roamAlphaAPI.ui.rightSidebar.addWindow({
    window: { type: "mentions", "block-uid": counter.uid },
  });
}

export function hiddeCounters(elt = document) {
  let counter = null;
  let counters = elt.querySelectorAll("[class^='ref-count-']");
  counters.forEach((c) => {
    c.parentElement.remove();
  });
  refs.clear();
}
