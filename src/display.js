import { countClass, countOpacity, countSize } from ".";
import { counters, refs } from "./observers";
import { getBlocksIncludingRefByTitle, insertAfter } from "./utils";

// exclude format tags: #. , #c: , #c- , #blck: , #blck-
const excludedTags = /^\..*|^c:.*|^c-.*|^blck[:|-].*/;

export function insertSupAfterRefs(elt = document) {
  // refs = [];
  // counters = [];
  //let b, e;
  setTimeout(() => {
    let mentions = elt.querySelectorAll(
      ".rm-page-ref--link, .rm-page-ref--namespace"
    );
    //    b = performance.now();
    mentions.forEach((mention) => {
      if (!hasCount(mention)) {
        let title = mention.parentElement.dataset.linkTitle;
        displayCounter(mention, getCountOptimized(title), "ref");
      }
    });
    //    e = performance.now();
    //    console.log(`1: ${e - b}`);

    let tags = elt.querySelectorAll(".rm-page-ref--tag");
    tags.forEach((mention) => {
      if (!hasCount(mention)) {
        let title = mention.dataset.tag;
        if (!isExcludedFromCount(title))
          displayCounter(mention, getCountOptimized(title), "tag");
      }
    });
  }, 20);

  let attributs = elt.querySelectorAll(".rm-attr-ref");
  attributs.forEach((attr) => {
    if (!hasCount(attr)) {
      let title = attr.textContent.slice(0, -1);
      displayCounter(attr, getCountOptimized(title), "attribute");
    }
  });
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

export function getCountOptimized(title) {
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

export function displayCounter(
  target,
  counter,
  type,
  displayClass = countClass
) {
  let elt = document.createElement("span");
  elt.innerHTML = `<sup class="${displayClass} ${countOpacity} ${countSize}">${counter}</sup>`;
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

export function hiddeCounters(elt = document) {
  let counters = elt.querySelectorAll("[class^='ref-count-']");
  counters.forEach((c) => c.parentElement.remove());
}
