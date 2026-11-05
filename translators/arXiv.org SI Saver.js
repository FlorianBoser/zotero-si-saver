{
	"translatorID": "0607af55-e49c-5533-bb73-66f204113811",
	"label": "arXiv.org SI Saver",
	"creator": "zotero-si-saver project",
	"target": "^https?://([^\\.]+\\.)?(arxiv\\.org|xxx\\.lanl\\.gov)/(search|find|catchup|list/\\w|abs/|pdf/)",
	"minVersion": "6.0",
	"maxVersion": "",
	"priority": 99,
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
	Adds supporting information to what the official "arXiv.org" translator saves. The
	official translator must stay installed and keeps receiving Zotero's updates.
*/

const SI_SAVER_OFFICIAL_ID = 'ecddda2e-4fc6-4aea-9f17-ef3b56d7377a';
const SI_SAVER_OFFICIAL_LABEL = 'arXiv.org';

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

// a badly encoded file name must not lose the other SI files
function siSaverDecode(name) {
	try {
		return decodeURIComponent(name);
	}
	catch (e) {
		return name;
	}
}

// reads the ancillary files of the abstract page
function siSaverSupplements(doc) {
	let seen = new Set();
	let files = [];
	for (let link of doc.querySelectorAll('.ancillary a.anc-file-name[href]')) {
		let name = siSaverDecode(link.getAttribute('href').split(/[?#]/)[0].split('/').pop());
		let extension = (name.match(/\.([a-z0-9]+)$/i) || [])[1];
		extension = extension && extension.toLowerCase();
		if (!siSaverTypes[extension] || seen.has(link.href)) continue;
		seen.add(link.href);
		files.push({
			title: 'Ancillary file (' + name + ')',
			url: link.href,
			mimeType: siSaverTypes[extension],
			snapshot: !Z.getHiddenPref("supplementaryAsLink")
		});
	}
	return files;
}
