import {
  attributeCounter,
  countClass,
  countOpacity,
  countSize,
  displayPageStatus,
  referenceCounter,
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
  // refs = [];
  // counters = [];
  // let b, e;
  setTimeout(() => {
    if (referenceCounter) {
      let mentions = elt.querySelectorAll(
        ".rm-page-ref--link:not(.parent-path-wrapper .rm-page-ref--link), .rm-page-ref--namespace"
      );
      // b = performance.now();
      mentions.forEach((mention) => {
        if (!hasCount(mention)) {
          let title = mention.parentElement.dataset.linkTitle;
          let uid = mention.parentElement.dataset.linkUid;
          // let isVoid = isVoidPage(mention.parentElement.dataset.linkUid);
          // isVoid
          //   ? console.log(`${title} est vide!`)
          //   : console.log(`${title} a un contenu.`);
          displayCounter(mention, getCountOptimized(title, uid), "ref");
          //displayCounter(mention, getCountOptimized2(title, uid), "ref", false);
        }
      });
      // e = performance.now();
      // console.log(`1: ${e - b}`);
      // console.log(refs);
    }
    if (tagCounter) {
      let tags = elt.querySelectorAll(
        ".rm-page-ref--tag:not(.parent-path-wrapper .rm-page-ref--tag)"
      );
      // b = performance.now();
      tags.forEach((mention) => {
        if (!hasCount(mention)) {
          let title = mention.dataset.tag;
          if (!isExcludedFromCount(title))
            displayCounter(mention, getCountOptimized(title), "tag");
        }
      });
      // e = performance.now();
      // console.log(`2: ${e - b}`);
      // console.log(refs);
    }
  }, 20);
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
  let index = refs.findIndex((ref) => ref.title === title);
  let count;
  let isVoid = null;
  if (index != -1) {
    count = refs[index].count;
    isVoid = refs[index].isVoid;
    uid = uid ? uid : refs[index].uid;
  } else {
    count = getBlocksIncludingRefByTitle(title);
    uid = displayPageStatus ? (uid ? uid : getUidByPageTitle(title)) : null;
    isVoid = displayPageStatus ? isVoidPage(uid) : null;
    if (uid)
      refs.push({
        title: title,
        count: count,
        isVoid: isVoid,
        uid: uid,
      });
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
        ? "rc-void-page"
        : "rc-notvoid-page"
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
    c.removeEventListener("mousedown", () => clickOnCount(counter), {
      once: true,
    });
  });
  refs.length = 0;
}
