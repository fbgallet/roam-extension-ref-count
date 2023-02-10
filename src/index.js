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
  ],
};

export default {
  onload: async ({ extensionAPI }) => {
    if (extensionAPI.settings.get("toggle") === null)
      await extensionAPI.settings.set("toggle", true);
    isOn = extensionAPI.settings.get("toggle");
    if (extensionAPI.settings.get("toggleAutocomplete") === null)
      await extensionAPI.settings.set("toggleAutocomplete", true);
    autocompleteCount = extensionAPI.settings.get("toggleAutocomplete");

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
