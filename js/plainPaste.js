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
            console.log('PlainPaste: Initializing editor ' + editor.id);

            // Set paste_as_text to true in the options
            if (editor.options && typeof editor.options.set === 'function') {
                editor.options.set('paste_as_text', true);
            } else if (editor.settings) {
                editor.settings.paste_as_text = true;
            }

            // Cleanup whitespace on paste
            editor.on('PastePreProcess', function(e) {
                console.log('PlainPaste: Processing paste event for ' + editor.id);
                if (e.content) {
                    var text = e.content;

                    // 1. Strip all HTML tags
                    text = text.replace(/<[^>]*>/g, ' ');

                    // 2. Normalize all types of spaces (NBSP, etc.) to normal spaces
                    text = text.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ');

                    // 3. Normalize line breaks
                    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                    // 4. Identify paragraph breaks (two or more newlines)
                    text = text.replace(/\n\s*\n+/g, '[[PARAGRAPH]]');

                    // 5. Clean up single line breaks: 
                    // Replace single newlines and surrounding whitespace with a single space
                    text = text.replace(/\s*\n\s*/g, ' ');

                    // 6. Restore paragraph breaks
                    text = text.replace(/\[\[PARAGRAPH\]\]/g, '\n\n');

                    // 7. Final space normalization: collapse all whitespace into a single space
                    text = text.replace(/\s+/g, ' ');

                    // 8. Trim and join
                    text = text.split('\n').map(function(line) {
                        return line.trim();
                    }).join('\n');

                    e.content = text.trim();
                    console.log('PlainPaste: Cleaned content', e.content);
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
