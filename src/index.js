import {
  addListeners,
  disconnectObserver,
  hiddeCounters,
  onPageLoad,
  removeListeners,
  toggleCounters,
} from "./observers";

let isOn;

const panelConfig = {
  tabTitle: "Blocks infos",
  settings: [
    // {
    //   id: "displayName",
    //   name: "User Name",
    //   description: "Display the name of the last user who updated the block",
    //   action: {
    //     type: "switch",
    //     onChange: (evt) => {
    //       displayEditName = !displayEditName;
    //     },
    //   },
    // },
    // {
    //   id: "dateFormat",
    //   name: "Date format",
    //   description: "Select how dates are displayed",
    //   action: {
    //     type: "select",
    //     items: ["short", "medium", "long", "full"],
    //     onChange: (evt) => {
    //       dateFormat = evt;
    //     },
    //   },
    // },
    {
      id: "APIkey",
      name: "API key",
      description: "Paste here your OpenAI API key (needed):",
      action: {
        type: "input",
        onChange: (evt) => {
          OPENAI_API_KEY = evt.target.value;
        },
      },
    },
  ],
};

export default {
  onload: async ({ extensionAPI }) => {
    if (extensionAPI.settings.get("APIkey") === null)
      await extensionAPI.settings.set("APIkey", "");
    OPENAI_API_KEY = extensionAPI.settings.get("APIkey");

    await extensionAPI.settings.panel.create(panelConfig);

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Toggle page references / tags counter",
      callback: async () => {
        toggleCounters(isOn);
        isOn = !isOn;
      },
    });

    isOn = true;
    onPageLoad();
    addListeners();
    window.addEventListener("popstate", onPageLoad);

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

    console.log("Smart GPT extension loaded.");
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
    console.log("Smart GPT extension unloaded");
  },
};
