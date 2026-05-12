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

                    // 1. Convert block tags to newlines to preserve separation
                    text = text.replace(/<\/p>|<br\/?>|<\/div>|<\/h[1-6]>|<\/li>/gi, '\n');

                    // 2. Strip all remaining HTML tags
                    text = text.replace(/<[^>]*>/g, ' ');

                    // 3. Normalize all types of weird spaces to normal spaces
                    text = text.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ');

                    // 4. Normalize line breaks
                    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                    // 5. Identify paragraph breaks (two or more newlines)
                    text = text.replace(/\n\s*\n+/g, '[[PARAGRAPH]]');

                    // 6. Clean up single line breaks: 
                    // Replace single newlines and surrounding whitespace with a single space
                    text = text.replace(/\s*\n\s*/g, ' ');

                    // 7. Restore paragraph breaks
                    text = text.replace(/\[\[PARAGRAPH\]\]/g, '\n\n');

                    // 8. Final space normalization: collapse only HORIZONTAL whitespace
                    // We avoid \s here because it would collapse the \n\n we just restored
                    text = text.replace(/[ \t]+/g, ' ');

                    // 9. Trim each line
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
        var attempts = 0;
        var maxAttempts = 20; 
        var poll = setInterval(function() {
            attempts++;
            if (initPlainPaste() || attempts >= maxAttempts) {
                clearInterval(poll);
            }
        }, 500);
    }
})();
