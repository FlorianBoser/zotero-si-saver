'use strict';
// Loads a Zotero translator into a sandbox together with one test page.
// The page's own scripts never run. Z and ZU hold only the helpers the tests need,
// so a missing helper fails loudly instead of passing by accident.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const CITATION = '@article{x, title={X}}';
const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">
<entry><id>http://arxiv.org/abs/2601.00001v1</id><title>X</title><summary>Y</summary>
<published>2026-01-01T00:00:00Z</published><updated>2026-01-01T00:00:00Z</updated>
<author><name>A Person</name></author></entry></feed>`;

function translatorCode(name) {
	const source = fs.readFileSync(path.join(ROOT, 'translators', name), 'utf8');
	const header = source.match(/^\s*\{[\s\S]*?^\}/m);
	return source
		.slice(header.index + header[0].length)
		.split(/\/\*\*\s*BEGIN TEST CASES\s*\*\*\//)[0];
}

// The same cleanup the Connector applies before translators see a page
function connectorHtml(html) {
	return html
		.replace(/<(video|audio)(?:\s[^>]*)?(?:\/>|>.*?<\/\1>)/gis, '')
		.replace(/<noscript(?:\s[^>]*)?(?:\/>|>.*?<\/noscript>)/gis, '');
}

function load(translator, page, url, prefs = {}) {
	const html = fs.readFileSync(path.join(__dirname, 'fixtures', page), 'utf8');
	const { window } = new JSDOM(connectorHtml(html), { url, virtualConsole: new VirtualConsole() });
	const doc = window.document;
	const completed = [];
	const newItem = () => ({
		attachments: [],
		creators: [],
		tags: [],
		notes: [],
		complete() {
			completed.push(this);
		},
	});
	const sandbox = {
		URL,
		Set,
		Z: {
			getHiddenPref: name => prefs[name],
			debug: () => {},
		},
		ZU: {
			trimInternal: value => value.replace(/\s+/g, ' ').trim(),
			// Stand in for the citation download, so a save can run without the network
			doPost: (url, body, callback) => callback(CITATION),
			doGet: (url, callback) => callback(CITATION),
			processDocuments: (url, callback) => callback(doc),
			xpathText: (node, expression) => {
				const owner = node.ownerDocument || node;
				return owner.evaluate(expression, node, null, window.XPathResult.STRING_TYPE, null).stringValue || null;
			},
			capitalizeTitle: value => value,
			cleanAuthor: value => ({ lastName: value }),
			cleanDOI: value => value,
			cleanISSN: value => value,
			cleanTags: value => value,
			removeDiacritics: value => value,
			getItemArray: () => {},
			strToISO: value => value,
			xpath: (node, expression) => {
				const owner = node.ownerDocument || node;
				const result = owner.evaluate(expression, node, null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				return Array.from({ length: result.snapshotLength }, (_, i) => result.snapshotItem(i));
			},
		},
		// Stands in for the citation download, so a scrape can run without the network
		requestText: async url => (/arxiv/.test(url) ? ATOM : 'TY  - JOUR\nER  - '),
		DOMParser: window.DOMParser,
		requestDocument: async () => doc,
		XPathResult: window.XPathResult,
		Zotero: {
			debug: () => {},
			Item: function (itemType) {
				Object.assign(this, newItem(), { itemType });
			},
			loadTranslator: () => {
				const handlers = {};
				const emit = () => handlers.itemDone(null, { ...newItem(), title: 'X', date: '' });
				return {
					setTranslator: () => {},
					setString: () => {},
					setDocument: () => {},
					setHandler: (name, handler) => {
						handlers[name] = handler;
					},
					translate: async () => {
						emit();
					},
					getTranslatorObject: (callback) => {
						callback({ addCustomFields: () => {}, doWeb: emit });
					},
				};
			},
		},
		attr: (node, selector, name) => node.querySelector(selector)?.getAttribute(name) ?? '',
		text: (node, selector) => node.querySelector(selector)?.textContent ?? '',
	};
	sandbox.Zotero.Utilities = sandbox.ZU;
	vm.createContext(sandbox);
	vm.runInContext(translatorCode(translator), sandbox);
	return { doc, sandbox, completed };
}

module.exports = { load, ROOT };
