import { hiddeCounters } from "./display";
import {
  addListeners,
  connectObservers,
  disconnectObserver,
  onPageLoad,
  removeListeners,
  toggleCounters,
} from "./observers";

export let isOn;
export let attributeCounter;
export let autocompleteCount;
let countOnHover;
export let displayPageStatus;
export let countClass;
export let countOpacity;
export let countSize;

const panelConfig = {
  tabTitle: "Page references counter",
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
      id: "attribute",
      name: "Include attributes ?",
      description: "Display count for attributes:: (need inline count):",
      action: {
        type: "switch",
        onChange: (evt) => {
          attributeCounter = !attributeCounter;
          hiddeCounters();
          onPageLoad();
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
          toggleOnHover();
        },
      },
    },
    {
      id: "displayPageStatus",
      name: "Visual differentiation: pages with content / empty pages",
      description:
        "Gray background+solid underline / no backgrund+dotted underline:",
      action: {
        type: "switch",
        onChange: (evt) => {
          displayPageStatus = !displayPageStatus;
          hiddeCounters();
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
    {
      id: "size",
      name: "Count size",
      description: "Set count size:",
      action: {
        type: "select",
        items: ["extra small", "small", "medium", "large", "extra large"],
        onChange: (evt) => {
          hiddeCounters();
          setSize(evt);
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

function setSize(value) {
  switch (value) {
    case "extra small":
      countSize = "rc-xsmall";
      break;
    case "small":
      countSize = "rc-small";
      break;
    case "large":
      countSize = "rc-large";
      break;
    case "extra large":
      countSize = "rc-xlarge";
      break;
    default:
      countSize = "";
  }
}

function toggleOnHover() {
  hiddeCounters();
  countOnHover = !countOnHover;
  countOnHover
    ? (countClass = "ref-count-hidden")
    : (countClass = "ref-count-visible");
  onPageLoad();
}

export default {
  onload: async ({ extensionAPI }) => {
    console.log(extensionAPI.settings);
    if (extensionAPI.settings.get("toggle") === null)
      await extensionAPI.settings.set("toggle", true);
    isOn = extensionAPI.settings.get("toggle");
    if (extensionAPI.settings.get("attribute") === null)
      await extensionAPI.settings.set("attribute", true);
    attributeCounter = extensionAPI.settings.get("attribute");
    if (extensionAPI.settings.get("toggleAutocomplete") === null)
      await extensionAPI.settings.set("toggleAutocomplete", true);
    autocompleteCount = extensionAPI.settings.get("toggleAutocomplete");
    if (extensionAPI.settings.get("countOnHover") === null)
      await extensionAPI.settings.set("countOnHover", false);
    countOnHover = extensionAPI.settings.get("countOnHover");
    countOnHover
      ? (countClass = "ref-count-hidden")
      : (countClass = "ref-count-visible");
    if (extensionAPI.settings.get("displayPageStatus") === null)
      await extensionAPI.settings.set("displayPageStatus", true);
    displayPageStatus = extensionAPI.settings.get("displayPageStatus");
    if (extensionAPI.settings.get("opacity") === null)
      await extensionAPI.settings.set("opacity", "0.5");
    setOpacity(extensionAPI.settings.get("opacity"));
    if (extensionAPI.settings.get("size") === null)
      await extensionAPI.settings.set("size", "medium");
    setSize(extensionAPI.settings.get("size"));

    await extensionAPI.settings.panel.create(panelConfig);

    extensionAPI.ui.commandPalette.addCommand({
      label: "Page ref counter: Toggle inline counter",
      callback: async () => {
        toggleCounters(isOn);
        isOn = !isOn;
        extensionAPI.settings.set("toggle", isOn);
      },
    });
    extensionAPI.ui.commandPalette.addCommand({
      label: "Page ref counter: Toggle counter in search / autocomplete box",
      callback: async () => {
        autocompleteCount = !autocompleteCount;
        extensionAPI.settings.set("toggleAutocomplete", autocompleteCount);
      },
    });
    extensionAPI.ui.commandPalette.addCommand({
      label: "Page ref counter: Toggle display on hover",
      callback: async () => {
        toggleOnHover();
        extensionAPI.settings.set("countOnHover", countOnHover);
      },
    });

    if (isOn) {
      onPageLoad();
      addListeners();
    } else connectObservers();

    console.log("Page references counter extension loaded.");
    //return;
  },
  onunload: () => {
    disconnectObserver("tags");
    disconnectObserver("sidebar");
    disconnectObserver("logs");
    removeListeners();
    hiddeCounters();

    console.log("Page references counter extension unloaded");
  },
};
