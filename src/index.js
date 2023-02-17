import {
  addListeners,
  connectObservers,
  disconnectObserver,
  hiddeCounters,
  onPageLoad,
  removeListeners,
  toggleCounters,
} from "./observers";

export let isOn;
export let autocompleteCount;
let countOnHover;
export let countClass;
export let countOpacity;

const panelConfig = {
  tabTitle: "Blocks infos",
  settings: [
    {
      id: "toggle",
      name: "Toggle inline count",
      description: "Toggle inline page reference & tag counter:",
      action: {
        type: "switch",
        onChange: (evt) => {
          toggleCounters(isOn);
          isOn = !isOn;
        },
      },
    },
    {
      id: "toggleAutocomplete",
      name: "Toggle autocomplete count",
      description:
        "Toggle page references counter in search and autocomplete box:",
      action: {
        type: "switch",
        onChange: (evt) => {
          autocompleteCount = !autocompleteCount;
        },
      },
    },
    {
      id: "countOnHover",
      name: "Display on hover",
      description: "Display counter only on reference hover:",
      action: {
        type: "switch",
        onChange: (evt) => {
          hiddeCounters();
          countOnHover = !countOnHover;
          countOnHover
            ? (countClass = "ref-count-hidden")
            : (countClass = "ref-count-visible");
          onPageLoad();
        },
      },
    },
    {
      id: "opacity",
      name: "Count opacity",
      description: "Set count opacity:",
      action: {
        type: "select",
        items: ["1", "0.75", "0.5", "0.25"],
        onChange: (evt) => {
          hiddeCounters();
          setOpacity(evt);
          onPageLoad();
        },
      },
    },
  ],
};

function setOpacity(value) {
  switch (value) {
    case "0.75":
      countOpacity = "rc-op-075";
      break;
    case "0.5":
      countOpacity = "rc-op-050";
      break;
    case "0.25":
      countOpacity = "rc-op-025";
      break;
    default:
      countOpacity = "";
  }
}

export default {
  onload: async ({ extensionAPI }) => {
    if (extensionAPI.settings.get("toggle") === null)
      await extensionAPI.settings.set("toggle", true);
    isOn = extensionAPI.settings.get("toggle");
    if (extensionAPI.settings.get("toggleAutocomplete") === null)
      await extensionAPI.settings.set("toggleAutocomplete", true);
    autocompleteCount = extensionAPI.settings.get("toggleAutocomplete");
    if (extensionAPI.settings.get("countOnHover") === null)
      await extensionAPI.settings.set("countOnHover", true);
    countOnHover = extensionAPI.settings.get("countOnHover");
    countOnHover
      ? (countClass = "ref-count-hidden")
      : (countClass = "ref-count-visible");
    if (extensionAPI.settings.get("opacity") === null)
      await extensionAPI.settings.set("opacity", "0.5");
    setOpacity(extensionAPI.settings.get("opacity"));

    await extensionAPI.settings.panel.create(panelConfig);

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Toggle inline page references / tags counter",
      callback: async () => {
        toggleCounters(isOn);
        isOn = !isOn;
        extensionAPI.settings.set("toggle", isOn);
      },
    });
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Toggle page references counter in search / autocomplete box",
      callback: async () => {
        autocompleteCount = !autocompleteCount;
        extensionAPI.settings.set("toggleAutocomplete", autocompleteCount);
      },
    });

    if (isOn) {
      onPageLoad();
      addListeners();
    } else connectObservers();

    // Add command to block context menu
    // roamAlphaAPI.ui.blockContextMenu.addCommand({
    //   label: "Color Highlighter: Remove color tags",
    //   "display-conditional": (e) => e["block-string"].includes("#c:"),
    //   callback: (e) => removeHighlightsFromBlock(e["block-uid"], removeOption),
    // });

    // Add SmartBlock command
    // const insertCmd = {
    //   text: "INSERTFOOTNOTE",
    //   help: "Insert automatically numbered footnote (requires the Footnotes extension)",
    //   handler: (context) => () => {
    //     noteInline = null;
    //     currentPos = new position();
    //     currentPos.s = context.currentContent.length;
    //     currentPos.e = currentPos.s;
    //     insertOrRemoveFootnote(context.targetUid);
    //     return "";
    //   },
    // };
    // if (window.roamjs?.extension?.smartblocks) {
    //   window.roamjs.extension.smartblocks.registerCommand(insertCmd);
    // } else {
    //   document.body.addEventListener(`roamjs:smartblocks:loaded`, () => {
    //     window.roamjs?.extension.smartblocks &&
    //       window.roamjs.extension.smartblocks.registerCommand(insertCmd);
    //   });
    // }

    console.log("References counter extension loaded.");
    //return;
  },
  onunload: () => {
    disconnectObserver("tags");
    disconnectObserver("sidebar");
    removeListeners();
    hiddeCounters();

    // window.roamAlphaAPI.ui.commandPalette.removeCommand({
    //   label: "Footnotes: Reorder footnotes on current page",
    // });

    // roamAlphaAPI.ui.blockContextMenu.removeCommand({
    //   label: "Color Highlighter: Remove color tags",
    // });
    console.log("References counter extension unloaded");
  },
};
