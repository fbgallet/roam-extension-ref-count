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
export let referenceCounter, tagCounter, attributeCounter;
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
      id: "references",
      name: "Counter for Page References",
      description: "Toggle inline [[Page Reference]] counter:",
      action: {
        type: "switch",
        onChange: (evt) => {
          referenceCounter = !referenceCounter;
          setOnOrOff();
          hiddeCounters();
          onPageLoad();
        },
      },
    },
    {
      id: "tags",
      name: "Counter for Tags",
      description: "Toggle inline #Tag counter:",
      action: {
        type: "switch",
        onChange: (evt) => {
          tagCounter = !tagCounter;
          setOnOrOff();
          hiddeCounters();
          onPageLoad();
        },
      },
    },
    {
      id: "attributes",
      name: "Counter for Attributes",
      description: "Toggle inline Attributes:: counter:",
      action: {
        type: "switch",
        onChange: (evt) => {
          attributeCounter = !attributeCounter;
          setOnOrOff();
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

function setOnOrOff() {
  isOn = referenceCounter || tagCounter || attributeCounter ? true : false;
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
    if (extensionAPI.settings.get("references") === null)
      await extensionAPI.settings.set("references", true);
    referenceCounter = extensionAPI.settings.get("references");
    if (extensionAPI.settings.get("tags") === null)
      await extensionAPI.settings.set("tags", true);
    tagCounter = extensionAPI.settings.get("tags");
    if (extensionAPI.settings.get("attributes") === null)
      await extensionAPI.settings.set("attributes", false);
    attributeCounter = extensionAPI.settings.get("attributes");
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

    setOnOrOff();
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
