import {
  addListeners,
  connectObservers,
  disconnectObserver,
  hiddeCounters,
  onPageLoad,
  removeListeners,
  toggleCounters,
} from "./observers";
import { Configuration, OpenAIApi } from "openai";
import {
  getBlocksIncludingRef,
  getLinkedRefsCount,
  getMainPageUid,
} from "./utils";

let OPENAI_API_KEY;
let isOn;

// app.get("/", async (req, res) => {
//   res.status(200).send({
//     message: "Hello !",
//   });
// });

// app.post("/", async (req, res) => {
//   try {
//     const prompt = req.body.prompt;

//     const response = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: `${prompt}`,
//       temperature: 0,
//       max_tokens: 1000,
//       top_p: 1,
//       frequency_penalty: 0.5,
//       presence_penalty: 0,
//     });

//     res.status(200).send({
//       bot: response.data.choices[0].text,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error });
//   }
// });

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
      label: "Smart GPT",
      callback: async () => {
        console.log("Smart GPT!");
      },
    });

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Toggle page references / tags counter",
      callback: async () => {
        toggleCounters(isOn);
        isOn = !isOn;
      },
    });

    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    console.log(configuration);

    const openai = new OpenAIApi(configuration);
    // const response = await openai.listEngines();

    function requestCompletion(prompt) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(OPENAI_API_KEY),
        },
        body: JSON.stringify({
          prompt: prompt,
          temperature: 0.9,
          max_tokens: 150,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.5,
          stop: ['"""'],
        }),
      };
      fetch(
        "https://api.openai.com/v1/engines/text-davinci-003/completions",
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log("Ran out of tokens for today! Try tomorrow!");
        });
    }

    let pageUid = await getMainPageUid();
    console.log(pageUid);

    window.addEventListener("popstate", onPageLoad);
    //connectObservers();

    // const response = await openai.createCompletion({
    //   model: "text-davinci-003",w
    //   prompt:
    //     ,
    //   temperature: 0,
    //   max_tokens: 100,
    //   top_p: 1,
    //   frequency_penalty: 0.0,
    //   presence_penalty: 0.0,
    //   stop: ["\n"],
    // });
    //console.log(response);

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

    isOn = true;
    onPageLoad();
    //connectObservers();
    addListeners();

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
