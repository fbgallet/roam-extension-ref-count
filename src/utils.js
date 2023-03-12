export const uidRegex = /\(\([^\)]{9}\)\)/g;
export const pageRegex = /\[\[.*\]\]/g; // very simplified, not recursive...

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
  let result = window.roamAlphaAPI.q(
    `[:find (count ?b)
      :where [?r :node/title "${title}"] 
           [?b :block/refs ?r]]`
  );
  if (result.length > 0) return result[0][0];
  else return 0;
}

export function insertAfter(existingNode, newNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
