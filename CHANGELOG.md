## v.7 on March 21th, 2026

### Updates:

- Removed reference counter in inline autocomplete box (now a native Roam feature)

## v.6 on March, 2026 More stable version

### Updates:

- Page title header group in Linked references & Unlinked references are also decorated with reference counter
- Option to reverse visual differentiation for references of empty page (make them grey)

### Fixes

- Important fixes which should fix the tab-freezing issue some users experienced when clicking in the search bar (thanks to Claude Opus 4.6)
- Other optimization and error handling fixes

## v.5 on October 15th, 2023

### Updates:

- Option to enable/disable independently counters for page references, tags and attributes

### Fixes:

- page name with `"` or `\` characters are now supported
- optimization, displaying the results in the search bar should no longer be slowed down
- show page status (empty or not) even if vanilla reference brackets are enabled

## v.4 on April 27th, 2023

### New features:

- see if page is empty or not
- click on counter to open linked references in sidebar

### Fixes:

- better stability, better support of very large number of linked references or page references on current page
- #sup (for Footnotes extension compatibiliy), #sub and #sticky are excluded, like all #.tags (for css format)

## v.3 on April 12th, 2023

### Fixes:

- count in autocomplete box for tags and attributes was broken

## v.2 on March 24th, 2023

### New feature:

- customize the size of the counter, from extra small to extra large

### Updates:

- command in command palette to toggle 'display on hover'
- option to display count for attributes:: or not

### Fixes:

- no more duplicated counter in the sidebar when page refs are between brackets
- counts are displayed on daily log, when expanding new daily pages
- counts are no more displayed in block ref autocomplete box
- counts are properly displayed for page ref with namespace
