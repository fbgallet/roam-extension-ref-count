var runners = {
  menuItems: [],
  observers: [],
};

export function connectObservers() {
  addObserver(
    document.getElementsByClassName("roam-app")[0],
    onBlockUpdate,
    {
      childList: false,
      subtree: true,
      attributeFilter: ["class"],
    },
    "tags"
  );
}

function addObserver(element, callback, options, name) {
  let myObserver = new MutationObserver(callback);
  myObserver.observe(element, options);

  runners[name] = [myObserver];
}
export function disconnectObserver(name) {
  if (runners[name])
    for (let index = 0; index < runners[name].length; index++) {
      const element = runners[name][index];
      element.disconnect();
    }
}

var observing = false;
var lastTextarea;
function onBlockUpdate() {
  let focusedBlock = document.querySelector(".rm-focused");
  if (
    focusedBlock &&
    (!observing || lastTextarea != focusedBlock.querySelector("textarea"))
  ) {
    observing = true;
    let textarea = focusedBlock.querySelector("textarea");
    let uid = textarea.id.slice(-9);
    console.log(uid);
    textarea.addEventListener("change", onTextareaChange);
  }
}

function onTextareaChange(e) {
  console.log(e.target.value);
  observing = false;
}

export function addListeners() {}

export function removeListeners() {}

export function onPageLoad(e) {}
