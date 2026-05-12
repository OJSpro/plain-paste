/**
 * Plain Paste for TinyMCE
 * 
 * This script ensures that all content pasted into any TinyMCE editor
 * is treated as plain text, stripping all formatting.
 */
(function() {
    function initPlainPaste() {
        if (typeof tinymce === 'undefined') {
            return false;
        }

        /**
         * Apply settings to a single editor instance
         */
        var setupEditor = function(editor) {
            // Set paste_as_text to true in the options
            // This is the standard TinyMCE way to force plain text paste
            if (editor.options && typeof editor.options.set === 'function') {
                editor.options.set('paste_as_text', true);
            } else if (editor.settings) {
                editor.settings.paste_as_text = true;
            }

            // Hook into the init event to ensure the command is toggled
            editor.on('init', function() {
                try {
                    // Force the toggle command if the paste plugin is loaded
                    if (editor.hasPlugin('paste')) {
                        editor.execCommand('mceTogglePlainTextPaste', true);
                    }
                } catch (e) {
                    console.log('PlainPaste: Could not force toggle command', e);
                }
            });

            // Cleanup whitespace on paste (enhanced for PDF sources)
            editor.on('PastePreProcess', function(e) {
                if (e.content) {
                    // 1. Strip all HTML tags just in case
                    var text = e.content.replace(/<[^>]*>/g, ' ');

                    // 2. Decode HTML entities (like &nbsp;)
                    var doc = new DOMParser().parseFromString(text, 'text/html');
                    text = doc.documentElement.textContent;

                    // 3. Normalize line breaks: Replace single newlines with a space, 
                    // but keep double newlines as paragraph breaks.
                    // First, replace actual double+ newlines with a unique placeholder
                    text = text.replace(/\n\s*\n+/g, '[[PARAGRAPH]]');
                    // Replace remaining single newlines with a space
                    text = text.replace(/\n+/g, ' ');
                    // Restore paragraph breaks
                    text = text.replace(/\[\[PARAGRAPH\]\]/g, '\n\n');

                    // 4. Collapse multiple spaces into a single space
                    text = text.replace(/[ ]+/g, ' ');

                    // 5. Trim leading/trailing whitespace from each line
                    text = text.split('\n').map(function(line) {
                        return line.trim();
                    }).join('\n');

                    e.content = text.trim();
                }
            });
        };

        // Apply to any already initialized editors
        tinymce.get().forEach(function(editor) {
            setupEditor(editor);
        });

        // Listen for any new editors being added
        tinymce.on('AddEditor', function(e) {
            setupEditor(e.editor);
        });

        return true;
    }

    // Attempt initialization
    if (!initPlainPaste()) {
        // If tinymce isn't loaded yet, poll for it
        var attempts = 0;
        var maxAttempts = 20; // 10 seconds
        var poll = setInterval(function() {
            attempts++;
            if (initPlainPaste() || attempts >= maxAttempts) {
                clearInterval(poll);
            }
        }, 500);
    }
})();
