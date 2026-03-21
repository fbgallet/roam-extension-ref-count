# Page references counter

**Counter for page references (including tags and attributes) as superscript, customizable and clickable.**

🔎 Reference counts are also displayed **in Quick search (search bar)**, which is particularly useful to identify the actually used pages and the unused or wrong spellings! (in v.7, reference counts are in the page autocomplete box are no more supported by the extension since they are now provided natively by Roam)

> [!NOTE]
> 🆕 in v.6:
> Major fixes have been made; the extension should now be much more stable and should no longer cause the browser tab to freeze, an issue some users encountered when clicking in the search bar.

![ref counter 2](https://github.com/fbgallet/roam-extension-ref-count/assets/74436347/9942e40e-aa4d-4d98-af78-e3faf3f86777)

If you find that counters are sometimes annoying, you can enable them only for page references, tags, or attributes, independently (🆕 New in v.5), see options above. Here are some other possibilities (with a command in the Command Palette and customizable hotkeys for the first two):

- toggle on/off inline count or search bar count (separately),
- make the counter appear only on hover over a given page reference,
- reduce the opacity (more or less grey),
- reduce the size.

With opacity to 0.25 and size to small, the counters will be very subtle.

### Click on the counter to open linked references in the sidebar

### See if a page is empty or not

If a page is empty, its reference is underlined with a dotted line when hovering over it (for tags: only when hovering over the counter), and its title is greyed in the search bar.

If a page is not empty, its inline reference has a light grey background (only page refs, not tags) and is underlined with a solid line when hovering over it (for tags: only when hovering over the counter).

This formatting appears in Roam page only if inline counters are enabled (they always appear in the search bar).

You can **reverse** this visual differentiation (option "Reverse visual differentiation" in settings): the grey background will then appear on **empty pages** instead of pages with content — useful if you have many more content pages than empty pages and find the background on most references distracting.

#### CSS customization

The two states are controlled by these CSS classes on the counter `<sup>` element:

- `.rc-notvoid-page` — page with content (grey background + solid underline on hover by default)
- `.rc-void-page` — empty page (no background + dotted underline on hover by default)

You can override these in your Roam custom CSS to change colors, background, borders, etc.

[See changelog here](https://github.com/fbgallet/roam-extension-ref-count/blob/main/CHANGELOG.md)

---

## If you want to support my work

If you want to encourage me to develop further and enhance my Roam extensions, you can [buy me a coffee ☕ here](https://buymeacoffee.com/fbgallet) or [sponsor me on Github](https://github.com/sponsors/fbgallet). Thanks in advance for your support! 🙏

For any question or suggestion, DM me on **X/Twitter** and follow me to be informed of updates and new extensions : [@fbgallet](https://x.com/fbgallet), or on Bluesky: [@fbgallet.bsky.social](https://bsky.app/profile/fbgallet.bsky.social)

Please report any issue [here](https://github.com/fbgallet/roam-extension-ref-count/issues).
