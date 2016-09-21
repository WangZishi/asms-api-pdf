let system = require('system');
let webpage = require('webpage');
// Error handler
function exit(error) {
    let message;
    if (typeof error === 'string')
        message = error;
    if (error)
        system.stderr.write('html-pdf: ' + (message || 'Unknown Error ' + error) + '\n');
    phantom.exit(error ? 1 : 0);
}
// Build stack to print
function buildStack(msg, trace) {
    let msgStack = [msg];
    if (trace && trace.length) {
        msgStack.push('Stack:');
        trace.forEach(function (t) {
            msgStack.push('  at ' + t.file || t.sourceURL + ': ' + t.line + ' (in function ' + t.function + ')');
        });
    }
    return msgStack.join('\n');
}
phantom.onError = function (msg, trace) {
    exit(buildStack('Script - ' + msg, trace));
};
// Load configurations from stdin
let json = JSON.parse(system.stdin.readLine());
if (!json.html || !json.html.trim())
    exit('Did not receive any html');
let options = json.options;
let page = webpage.create();
if (options.httpHeaders)
    page.customHeaders = options.httpHeaders;
if (options.viewportSize)
    page.viewportSize = options.viewportSize;
if (options.base)
    page.setContent(json.html, options.base);
else
    page.setContent(json.html, null);
page.onInitialized = function () {
    window.screen.height = 768;
    window.screen.width = 1366;
    page.evaluate(function () {
        document.addEventListener('DOMContentLoaded', function () {
            console.log('DOM content has loaded.');
        }, false);
    });
};
page.onError = function (msg, trace) {
    exit(buildStack('Evaluation - ' + msg, trace));
};
// Force cleanup after 2 minutes
// Add 2 seconds to make sure master process triggers kill
// before to the phantom process
let timeout = (options.timeout || 120000) + 2000;
setTimeout(function () {
    exit('Force timeout');
}, timeout);
// Completely load page & end process
// ----------------------------------
page.onLoadFinished = function (status) {
    // The paperSize object must be set at once
    page.paperSize = definePaperSize(getContent(page), options);
    // Output to parent process
    let fileOptions = {
        type: options.type || 'pdf',
        quality: options.quality || 75
    };
    let filename = options.filename || (options.directory || '/tmp') + '/html-pdf-' + system.pid + '.' + fileOptions.type;
    page.render(filename, fileOptions);
    system.stdout.write(JSON.stringify({ filename: filename }));
    exit(null);
};
// Returns a hash of HTML content
// ------------------------------
function getContent(page) {
    return page.evaluate(function () {
        function getElements(doc, wildcard) {
            let wildcardMatcher = new RegExp(wildcard + '(.*)');
            let hasElements = false;
            let elements = {};
            let $elements = document.querySelectorAll(`[id*='${wildcard}']'`);
            let $elem, match, i;
            let len = $elements.length;
            for (i = 0; i < len; i++) {
                $elem = $elements[i];
                match = $elem.attributes.id.value.match(wildcardMatcher);
                if (match) {
                    hasElements = true;
                    elements[match[1]] = $elem.outerHTML;
                    $elem.parentNode.removeChild($elem);
                }
            }
            if (hasElements)
                return elements;
        }
        function getElement(doc, id) {
            let $elem = doc.getElementById(id);
            if ($elem) {
                let html = $elem.outerHTML;
                $elem.parentNode.removeChild($elem);
                return html;
            }
        }
        let styles = document.querySelectorAll('link,style');
        styles = Array.prototype.reduce.call(styles, function (strings, node) {
            return strings + node.outerHTML;
        }, '');
        // Wildcard headers e.g. <div id="pageHeader-first"> or <div id="pageHeader-0">
        let header = getElements(document, 'pageHeader-');
        let footer = getElements(document, 'pageFooter-');
        // Default header and footer e.g. <div id="pageHeader">
        let h = getElement(document, 'pageHeader');
        let f = getElement(document, 'pageFooter');
        if (h) {
            header = header || {};
            header.default = h;
        }
        if (f) {
            footer = footer || {};
            footer.default = f;
        }
        let body;
        let $body = document.getElementById('pageContent');
        if ($body)
            body = $body.outerHTML;
        else
            body = document.body.outerHTML;
        return {
            styles: styles,
            header: header,
            body: body,
            footer: footer
        };
    });
}
// Creates page section
// --------------------
function createSection(section, content, options) {
    let c = content[section] || {};
    let o = options[section] || {};
    return {
        height: o.height,
        contents: phantom.callback(function (pageNum, numPages) {
            let html = c[pageNum];
            if (pageNum === 1 && !html)
                html = c.first;
            if (pageNum === numPages && !html)
                html = c.last;
            return (html || c.default || o.contents || '')
                .replace('{{page}}', pageNum)
                .replace('{{pages}}', numPages) + content.styles;
        })
    };
}
// Creates paper with specified options
// ------------------------------------
function definePaperOrientation(options) {
    let paper = { border: options.border || '0' };
    if (options.height && options.width) {
        paper.width = options.width;
        paper.height = options.height;
    }
    else {
        paper.format = options.format || 'A4';
        paper.orientation = options.orientation || 'portrait';
    }
    return paper;
}
// Creates paper with generated footer & header
// --------------------------------------------
function definePaperSize(content, options) {
    let paper = definePaperOrientation(options);
    if (options.header || content.header) {
        paper.header = createSection('header', content, options);
    }
    if (options.footer || content.footer) {
        paper.footer = createSection('footer', content, options);
    }
    if (paper.header && paper.header.height === undefined)
        paper.header.height = '46mm';
    if (paper.footer && paper.footer.height === undefined)
        paper.footer.height = '28mm';
    return paper;
}
//# sourceMappingURL=pdf_a4_portrait.js.map