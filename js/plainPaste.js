/**
 * Plain Paste for TinyMCE
 * 
 * This script ensures that all content pasted into any TinyMCE editor
 * is treated as plain text, stripping all formatting and optimizing PDF whitespace.
 */
(function() {
    console.log('PlainPaste: Script loaded and executing...');

    function initPlainPaste() {
        if (typeof tinymce === 'undefined') {
            return false;
        }

        /**
         * Apply settings to a single editor instance
         */
        var setupEditor = function(editor) {
            console.log('PlainPaste: Initializing editor ' + editor.id);

            // Disable built-in stripping to maintain control
            if (editor.options && typeof editor.options.set === 'function') {
                editor.options.set('paste_as_text', false);
            } else if (editor.settings) {
                editor.settings.paste_as_text = false;
            }

            editor.on('PastePreProcess', function(e) {
                console.log('PlainPaste: Processing paste event for ' + editor.id);
                if (e.content) {
                    var html = e.content;

                    // 1. Convert block tags to double newlines for paragraph preservation
                    html = html.replace(/<\/p>|<\/div>|<\/h[1-6]>/gi, '\n\n');
                    html = html.replace(/<br\/?>|<\/li>/gi, '\n');

                    // 2. Replace all other tags with a space to prevent squashing
                    var text = html.replace(/<[^>]*>/g, ' ');

                    // 3. Normalize all types of weird spaces to normal spaces
                    text = text.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ');

                    // 4. Normalize line breaks
                    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                    // 5. Clean up PDF hyphenation (e.g. "Some-\ntimes" -> "Sometimes")
                    text = text.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

                    // 6. Identify paragraph signals
                    // Case A: Standard double newlines
                    text = text.replace(/\n\s*\n+/g, '[[PARAGRAPH]]');
                    // Case B: Single newline followed by indentation (2+ spaces)
                    text = text.replace(/\n([ \t]{2,})/g, '[[PARAGRAPH]]$1');

                    // 6. Smart Merge logic for PDF unwrapping
                    text = text.split('\n').reduce(function(acc, line, i, arr) {
                        if (i === 0) return line;
                        var prev = arr[i-1].trim();
                        var current = line.trim();

                        if (!prev || !current) return acc + '\n' + line;

                        // DON'T merge if previous line is already a paragraph marker
                        if (prev.indexOf('[[PARAGRAPH]]') !== -1) return acc + '\n' + line;

                        // DON'T merge if previous line ends with sentence punctuation (. ! ? : ;)
                        if (/[.!?:]/.test(prev.slice(-1))) return acc + '\n' + line;

                        // DON'T merge if previous line is short (likely a title or header)
                        // Standard wrapped lines in PDFs are usually > 60 chars.
                        if (prev.length < 60) return acc + '\n' + line;

                        // DON'T merge if previous line looks like a Title (Title Case)
                        // (e.g. "Domestic Violence in India - Harish Sahoo")
                        var titleCasePattern = /^([A-Z0-9][\w\']*[ :,-]*)+$/;
                        if (titleCasePattern.test(prev)) return acc + '\n' + line;

                        // Otherwise, it's likely a mid-paragraph wrap. Merge with a space.
                        return acc + ' ' + line;
                    }, "");

                    // 7. Restore paragraph breaks
                    text = text.replace(/\[\[PARAGRAPH\]\]/g, '\n\n');

                    // 8. Final horizontal space normalization
                    text = text.replace(/[ \t]+/g, ' ');

                    // 9. Fix extra space before punctuation
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

    // Polling for tinymce
    var attempts = 0;
    var maxAttempts = 20; 
    var poll = setInterval(function() {
        attempts++;
        if (initPlainPaste() || attempts >= maxAttempts) {
            clearInterval(poll);
        }
    }, 500);
})();
