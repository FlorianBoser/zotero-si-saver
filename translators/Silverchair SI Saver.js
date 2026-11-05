{
	"translatorID": "9ab73f54-a0e0-5984-8486-1fb8d2bda3d7",
	"label": "Silverchair SI Saver",
	"creator": "zotero-si-saver project",
	"target": "/(article|fullarticle|advance-article|advance-article-abstract|article-abstract|book|edited-volume)(/|\\.aspx)|search-results?|\\/issue(/|s\\.aspx|$)",
	"minVersion": "6.0",
	"maxVersion": "",
	"priority": 279,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2026-11-05 16:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2026 the zotero-si-saver project
	Portions Copyright © 2020-2022 Sebastian Karcher and Abe Jellinek

	This file is free software: you can redistribute it and/or modify it under the
	terms of the GNU Affero General Public License as published by the Free Software
	Foundation, either version 3 of the License, or (at your option) any later version.

	It is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY,
	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
	PURPOSE. See the GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License along
	with this file. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

/*
	Adds supporting information to what the official "Silverchair" translator saves. The
	official translator must stay installed and keeps receiving Zotero's updates.
	The function siSaverSupplements is adapted from getSupplements of the official Silverchair
	translator by Sebastian Karcher and Abe Jellinek, also under the AGPL. Modified on
	2026-11-05 by the zotero-si-saver project: it also reads direct file links, saves only PDF,
	DOC and DOCX, skips the author manuscript and repeated links, and numbers the saved files.
*/

const SI_SAVER_OFFICIAL_ID = '3bae3a55-f021-4b59-8a14-43701f336adf';
const SI_SAVER_OFFICIAL_LABEL = 'Silverchair';

function siSaverOfficial(doc) {
	let translator = Zotero.loadTranslator('web');
	translator.setTranslator(SI_SAVER_OFFICIAL_ID);
	translator.setDocument(doc);
	return translator;
}

// A page counts only when the official translator accepts it. On a list page this
// translator steps aside: a translator called by another one gets no selection dialog
// and would save every listed article, so the official translator runs there alone.
async function detectWeb(doc, url) {
	let official = await siSaverOfficial(doc).getTranslatorObject();
	// Official file missing: Zotero has moved on already, so nothing may run or finish here
	if (!official) return new Promise(() => {});
	let type = await official.detectWeb(doc, url);
	return type == 'multiple' ? false : type;
}

async function doWeb(doc, url) {
	// The page can change after detection, and a list needs the official selection dialog.
	// The error makes the Connector move on to the official translator.
	if (!await detectWeb(doc, url)) throw new Error('Not an article page');
	let translator = siSaverOfficial(doc);
	translator.setHandler('itemDone', (obj, item) => {
		siSaverAddSupplements(doc, item);
		// Otherwise Zotero writes the label of this translator into the Library Catalog field
		if (item.libraryCatalog === undefined && item.itemType != 'webpage') {
			item.libraryCatalog = SI_SAVER_OFFICIAL_LABEL;
		}
		item.complete();
	});
	await translator.translate();
}

// a failure here must not lose the item itself
function siSaverAddSupplements(doc, item) {
	try {
		// the official translator may already have added a file
		let present = new Set(item.attachments.map(attachment => attachment.url));
		item.attachments.push(...siSaverSupplements(doc).filter(file => !present.has(file.url)));
	}
	catch (e) {
		Z.debug(e);
	}
}

// the only file types saved
var siSaverTypes = {
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

// reads the supplementary links of ACS, RSC and OUP, adapted from getSupplements of the
// official Silverchair translator
function siSaverSupplements(doc) {
	let asLink = Z.getHiddenPref("supplementaryAsLink");
	let seen = new Set();
	let files = [];
	for (let link of doc.querySelectorAll('.dataSuppLink a[href]')) {
		let href = link.getAttribute('href');
		// e.g. /acscii/article-supplement/1282548/pdf/oc3c00243_si_001/, where the format
		// sits in the path, while OUP links straight to the file on its CDN
		let format = href.match(/\/article-supplement\/\d+\/([^/]+)\//)
			|| href.split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i);
		let mimeType = format && siSaverTypes[format[1].toLowerCase()];
		// RSC lists the author manuscript here, it is the article again and not SI
		if (!mimeType || /_auv\/?$/.test(link.href) || seen.has(link.href)) continue;
		seen.add(link.href);
		files.push({ title: `Supplement ${files.length + 1}`, url: link.href, snapshot: !asLink, mimeType: mimeType });
	}
	return files;
}
