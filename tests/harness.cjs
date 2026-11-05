'use strict';
// Loads a translator into a sandbox together with one test page. The official translator
// it calls is replaced by a stand-in, because the official files are not in this repository.
// The page's own scripts never run. Z and ZU hold only the helpers the translators use,
// so a missing helper fails loudly instead of passing by accident.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const ARTICLE = { title: 'Full Text PDF', url: 'https://example.org/article.pdf', mimeType: 'application/pdf' };

function split(name) {
	const source = fs.readFileSync(path.join(ROOT, 'translators', name), 'utf8');
	const header = source.match(/^\s*\{[\s\S]*?^\}/m);
	return { meta: JSON.parse(header[0]), code: source.slice(header.index + header[0].length) };
}

// The same cleanup the Connector applies before translators see a page
function connectorHtml(html) {
	return html
		.replace(/<(video|audio)(?:\s[^>]*)?(?:\/>|>.*?<\/\1>)/gis, '')
		.replace(/<noscript(?:\s[^>]*)?(?:\/>|>.*?<\/noscript>)/gis, '');
}

const standIn = {
	detectWeb: () => 'journalArticle',
	doWeb: (doc, url, passOn) => passOn({ itemType: 'journalArticle', attachments: [{ ...ARTICLE }] }),
};

function load(translator, page, url, { prefs = {}, official = {} } = {}) {
	const html = fs.readFileSync(path.join(__dirname, 'fixtures', page), 'utf8');
	const { window } = new JSDOM(connectorHtml(html), { url, virtualConsole: new VirtualConsole() });
	const doc = window.document;
	const completed = [];
	const called = [];
	const documents = [];
	const stand = { ...standIn, ...official };

	// A copy, because Zotero ignores anything added after this call
	const complete = function () {
		completed.push({ ...this, attachments: [...this.attachments] });
	};
	const sandbox = {
		Set,
		Z: { getHiddenPref: name => prefs[name], debug: () => {} },
		ZU: {
			trimInternal: value => value.replace(/\s+/g, ' ').trim(),
			strToISO: value => value,
		},
		attr: (node, selector, name) => node.querySelector(selector)?.getAttribute(name) ?? '',
		Zotero: {
			loadTranslator: (type) => {
				const handlers = {};
				return {
					setTranslator: id => called.push({ type, id }),
					setDocument: value => documents.push(value),
					setHandler: (name, handler) => {
						handlers[name] = handler;
					},
					getTranslatorObject: async () => (stand.missing ? undefined : { detectWeb: stand.detectWeb }),
					translate: async () => stand.doWeb(doc, url, (item) => {
						// As in Zotero, complete() belongs to the calling translator here
						item.complete = complete;
						handlers.itemDone(null, item);
					}),
				};
			},
		},
	};
	vm.createContext(sandbox);
	vm.runInContext(split(translator).code, sandbox);
	return { doc, sandbox, completed, called, documents, url };
}

module.exports = { load, split, ROOT, ARTICLE };
