'use strict';
// Loads a Zotero translator into a sandbox together with one test page.
// The page's own scripts never run. Z and ZU hold only the helpers the tests need,
// so a missing helper fails loudly instead of passing by accident.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');

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
	const sandbox = {
		URL,
		Set,
		Z: {
			getHiddenPref: name => prefs[name],
			debug: () => {},
		},
		ZU: {
			trimInternal: value => value.replace(/\s+/g, ' ').trim(),
			strToISO: value => value,
			xpath: (node, expression) => {
				const owner = node.ownerDocument || node;
				const result = owner.evaluate(expression, node, null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				return Array.from({ length: result.snapshotLength }, (_, i) => result.snapshotItem(i));
			},
		},
		// Stands in for the citation download, so a scrape can run without the network
		requestText: async () => 'TY  - JOUR\nER  - ',
		Zotero: {
			loadTranslator: () => {
				const handlers = {};
				return {
					setTranslator: () => {},
					setString: () => {},
					setHandler: (name, handler) => {
						handlers[name] = handler;
					},
					translate: async () => {
						const item = {
							attachments: [],
							date: '',
							complete() {
								completed.push(this);
							},
						};
						handlers.itemDone(null, item);
					},
				};
			},
		},
		attr: (node, selector, name) => node.querySelector(selector)?.getAttribute(name) ?? '',
		text: (node, selector) => node.querySelector(selector)?.textContent ?? '',
	};
	vm.createContext(sandbox);
	vm.runInContext(translatorCode(translator), sandbox);
	return { doc, sandbox, completed };
}

module.exports = { load, ROOT };
