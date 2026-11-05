{
	"translatorID": "95cae381-435d-50b4-bb74-5fe971928383",
	"label": "Atypon Journals SI Saver",
	"creator": "zotero-si-saver project",
	"target": "^https?://[^?#]+(/doi/((abs|abstract|full|figure|ref|citedby|book)/)?10\\.|/action/doSearch\\?)|^https?://[^/]+/toc/",
	"minVersion": "6.0",
	"maxVersion": "",
	"priority": 269,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2026-11-05 16:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2026 the zotero-si-saver project

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
	Adds supporting information to what the official "Atypon Journals" translator saves. The
	official translator must stay installed and keeps receiving Zotero's updates.
*/

const SI_SAVER_OFFICIAL_ID = '5af42734-7cd5-4c69-97fc-bc406999bdba';
const SI_SAVER_OFFICIAL_LABEL = 'Atypon Journals';

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
		try {
			siSaverFixChemRxiv(doc, url, item);
		}
		catch (e) {
			Z.debug(e);
		}
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

// one attachment in the form Zotero expects
function siSaverAttachment(title, url, extension) {
	return {
		title: title,
		url: url,
		mimeType: siSaverTypes[extension],
		snapshot: !Z.getHiddenPref("supplementaryAsLink")
	};
}

// a badly encoded file name must not lose the other SI files
function siSaverDecode(name) {
	try {
		return decodeURIComponent(name);
	}
	catch (e) {
		return name;
	}
}

// reads the Supplementary Materials links of the current website
function siSaverSupplements(doc) {
	let seen = new Set();
	let files = [];
	for (let link of doc.querySelectorAll('a[href*="/doi/suppl/"][href*="/suppl_file/"]')) {
		let path = link.getAttribute('href').split(/[?#]/)[0];
		let name = siSaverDecode(path.slice(path.lastIndexOf('/') + 1));
		let extension = (name.match(/\.([a-z0-9]+)$/i) || [])[1];
		extension = extension && extension.toLowerCase();
		if (!siSaverTypes[extension] || seen.has(link.href)) continue;
		seen.add(link.href);
		files.push(siSaverAttachment('Supplementary Materials (' + name + ')', link.href, extension));
	}
	return files;
}

// the citation export of ChemRxiv gives no preprint type and puts the posting date
// into volume and issue, for example 2024 and 0805
function siSaverFixChemRxiv(doc, url, item) {
	if (!/^https?:\/\/(www\.)?chemrxiv\.org\//.test(url)) return;
	let date = attr(doc, 'meta[name="citation_online_date"]', 'content').replace(/\//g, '-');
	if (!date && /^\d{4}$/.test(item.volume) && /^\d{4}$/.test(item.issue)) {
		date = item.volume + '-' + item.issue.slice(0, 2) + '-' + item.issue.slice(2);
	}
	if (date) item.date = ZU.strToISO(date);
	item.itemType = 'preprint';
	item.repository = 'ChemRxiv';
	for (let field of ['volume', 'issue', 'pages', 'publicationTitle', 'journalAbbreviation', 'publisher', 'ISSN']) {
		delete item[field];
	}
}
