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

            // Cleanup whitespace on paste (useful for PDF sources)
            editor.on('PastePreProcess', function(e) {
                // First, if paste_as_text is handled by TinyMCE, it might already be plain text
                // But we can intercept and clean it up here.
                if (e.content) {
                    // 1. Replace multiple spaces with a single space
                    e.content = e.content.replace(/[ ]+/g, ' ');
                    
                    // 2. Remove spaces at the beginning/end of lines
                    e.content = e.content.replace(/^[ ]+|[ ]+$/gm, '');
                    
                    // 3. Optional: Collapse multiple newlines (uncomment if desired)
                    // e.content = e.content.replace(/\n\n+/g, '\n\n');
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
