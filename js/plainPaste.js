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

            // We disable the built-in paste_as_text to have full control
            // over the whitespace and line-merging logic in PastePreProcess.
            if (editor.options && typeof editor.options.set === 'function') {
                editor.options.set('paste_as_text', false);
            } else if (editor.settings) {
                editor.settings.paste_as_text = false;
            }

            editor.on('PastePreProcess', function(e) {
                console.log('PlainPaste: Processing paste event for ' + editor.id);
                if (e.content) {
                    var html = e.content;

                    // 1. Convert block tags to newlines to ensure separation
                    html = html.replace(/<\/p>|<br\/?>|<\/div>|<\/h[1-6]>|<\/li>/gi, '\n');

                    // 2. Replace all other tags with a single space to prevent word squashing
                    var text = html.replace(/<[^>]*>/g, ' ');

                    // 3. Normalize all types of weird spaces to normal spaces
                    text = text.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ');

                    // 4. Normalize line breaks
                    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                    // 5. Identify paragraph breaks (detect double newlines)
                    text = text.replace(/\n\s*\n+/g, '[[PARAGRAPH]]');

                    // 6. Clean up single line breaks: 
                    // Merge single newlines into a single space (typical of PDF line wraps)
                    text = text.replace(/\s*\n\s*/g, ' ');

                    // 7. Restore paragraph breaks
                    text = text.replace(/\[\[PARAGRAPH\]\]/g, '\n\n');

                    // 8. Final space normalization: collapse horizontal whitespace
                    text = text.replace(/[ \t]+/g, ' ');

                    // 9. Fix extra space before punctuation (e.g., "links ." -> "links.")
                    text = text.replace(/[ ]+([.,!?;:])/g, '$1');

                    // 10. Trim each line
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
