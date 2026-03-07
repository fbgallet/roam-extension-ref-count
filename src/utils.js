export const uidRegex = /\(\([^\)]{9}\)\)/g;
export const pageRegex = /\[\[.*\]\]/g; // very simplified, not recursive...
// const excludingTitleRegex = /\"|\\/;

// export function getBlocksIncludingRef(uid) {
//   return window.roamAlphaAPI.q(
//     `[:find ?u ?s
//          :where [?r :block/uid ?u]
//               [?r :block/refs ?b]
//                 [?r :block/string ?s]
//             [?b :block/uid "${uid}"]]`
//   );
// }

// export function getLinkedRefsCount(uid) {
//   return window.roamAlphaAPI.q(
//     `[:find (count ?b)
//          :where [?r :block/uid "${uid}"]
//               [?b :block/refs ?r]]`
//   )[0][0];
// }

// export function countBlocksIncludingRef(uid) {
//   return window.roamAlphaAPI.q(
//     `[:find (count ?u)
//          :where [?r :block/uid ?u]
//               [?r :block/refs ?b]
//             [?b :block/uid "${uid}"]]`
//   )[0][0];
// }

export function getBlocksIncludingRefByTitle(title) {
  // if (excludingTitleRegex.test(title)) {
  //   title = title.replace('"', '\\"');
  //   return 0;
  // }
  let result = window.roamAlphaAPI.q(
    `[:find (count ?b) :in $ ?title :where [?r :node/title ?title] [?b :block/refs ?r]]`,
    title
  );
  if (result.length > 0) return result[0][0];
  else return 0;
}

export function insertAfter(existingNode, newNode) {
  if (!existingNode?.parentNode) return;
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function isVoidPage(uid) {
  if (!uid) return true;
  let children = window.roamAlphaAPI.pull("[:block/children]", [
    ":block/uid",
    uid,
  ]);
  if (!children) return true;
  const childList = children[":block/children"];
  if (!childList) return true;
  if (childList.length == 1) {
    let r = getStringById(childList[0][":db/id"]);
    if (r == null || r.trim().length == 0) return true;
    return false;
  }
  return false;
}

export function getStringById(id) {
  const result = window.roamAlphaAPI.pull("[:block/string]", id);
  return result ? result[":block/string"] : null;
}

export function getUidByPageTitle(title) {
  // if (excludingTitleRegex.test(title)) {
  //   //return null;
  // }
  let result = window.roamAlphaAPI.pull("[:block/uid]", [
    ":node/title",
    `${title}`,
  ]);
  if (result) return result[":block/uid"];
  return null;
}

// TEST

export function getBlockContent(uid) {
  return window.roamAlphaAPI.q(
    `[:find (pull ?page [:block/uid :block/string ])
            :where [?page :block/uid "${uid}"] ]`
  )[0][0].string;
}

export function updateBlock(uid, content) {
  window.roamAlphaAPI.updateBlock({ block: { uid: uid, string: content } });
}
