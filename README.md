# Plain Paste for TinyMCE (OJS/OMP 3.4+)

This plugin for Open Journal Systems (OJS) and Open Monograph Press (OMP) 3.4+ automatically clears all formatting from content pasted into any TinyMCE editor across the entire site.

## Features
- **Automatic Formatting Removal**: Strips all HTML tags, styles, tables, and images from pasted content.
- **Whitespace Optimization**: Automatically collapses multiple spaces into a single space and removes leading/trailing spaces from lines—highly effective when pasting from PDF sources.
- **Sitewide Coverage**: Works in the editorial backend (Submissions, Settings, Profile) and the public-facing frontend.
- **Zero Configuration**: Simply install and enable; no additional settings required.
- **Smart Initialization**: Works with OJS/OMP's dynamic UI components and lazy-loaded editors.

## Installation

### Manual Installation
1. Clone or download this repository.
2. Move the `plainPaste` directory to `plugins/generic/`.
3. Log in as an Administrator/Journal Manager.
4. Go to **Settings > Website > Plugins**.
5. Locate **Plain Paste for TinyMCE** under Generic Plugins and check the box to enable it.

## How it Works
The plugin registers a hook on `TemplateManager::display` to inject a small JavaScript file (`js/plainPaste.js`) into every page. This script monitors the global `tinymce` object and intercept every editor initialization to set the `paste_as_text` option to `true`.

## Compatibility
- OJS 3.4.x
- OMP 3.4.x
- OPS 3.4.x
- TinyMCE 6.x

## License
This plugin is licensed under the GNU General Public License v3.
