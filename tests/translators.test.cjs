'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { load, split, ROOT, ARTICLE } = require('./harness.cjs');

const PDF = 'application/pdf';
const DOC = 'application/msword';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const SCIENCE = 'https://www.science.org/doi/10.1126/science.x';
const CHEMRXIV = 'https://chemrxiv.org/doi/full/10.26434/chemrxiv-2024-x';
const WILEY = 'Wiley Online Library SI Saver.js';
const WILEY_URL = 'https://onlinelibrary.wiley.com/doi/full/10.1002/x';

const SITES = [
	['Wiley', WILEY, 'wiley_si_synthetic.html', WILEY_URL, [PDF, DOCX]],
	['Atypon', 'Atypon Journals SI Saver.js', 'atypon_si_synthetic.html', SCIENCE, [PDF, DOC]],
	['Nature', 'Nature Publishing Group SI Saver.js', 'nature_si_synthetic.html', 'https://www.nature.com/articles/x', [PDF, DOCX]],
	['ScienceDirect', 'ScienceDirect SI Saver.js', 'sciencedirect_si_synthetic.html', 'https://www.sciencedirect.com/science/article/pii/S1', [undefined, PDF]],
	['Silverchair', 'Silverchair SI Saver.js', 'silverchair_si_synthetic.html', 'https://pubs.acs.org/x/article/1/1/1/1/x', [PDF, DOCX, DOCX]],
	['arXiv', 'arXiv.org SI Saver.js', 'arxiv_si_synthetic.html', 'https://arxiv.org/abs/2601.00001', [PDF, PDF]],
];

// The official translators, each with its ID and priority
const OFFICIAL = {
	'Atypon Journals SI Saver.js': ['5af42734-7cd5-4c69-97fc-bc406999bdba', 270, 'Atypon Journals'],
	'Nature Publishing Group SI Saver.js': ['6614a99-479a-4524-8e30-686e4d66663e', 100, 'Nature Publishing Group'],
	'ScienceDirect SI Saver.js': ['b6d0a7a-d076-48ae-b2f0-b6de28b194e', 100, 'ScienceDirect'],
	'Silverchair SI Saver.js': ['3bae3a55-f021-4b59-8a14-43701f336adf', 280, 'Silverchair'],
	'Wiley Online Library SI Saver.js': ['fe728bc9-595a-4f03-98fc-766f1d8d0936', 100, 'Wiley Online Library'],
	'arXiv.org SI Saver.js': ['ecddda2e-4fc6-4aea-9f17-ef3b56d7377a', 100, 'arXiv.org'],
};

const save = async ({ sandbox, doc, url }) => sandbox.doWeb(doc, url);
const si = item => item.attachments.filter(attachment => attachment.url !== ARTICLE.url);
const fileName = attachment => attachment.url.split('/').pop();

for (const [label, file, page, url, types] of SITES) {
	test(`${label}: the item from the stand-in keeps its PDF and gets the SI once`, async () => {
		const run = load(file, page, url);
		await save(run);
		assert.equal(run.completed.length, 1);
		assert.deepEqual(run.completed[0].attachments[0], ARTICLE);
		assert.deepEqual(si(run.completed[0]).map(a => a.mimeType), types);
	});

	test(`${label}: a page without SI still completes the item`, async () => {
		const run = load(file, 'no_si_synthetic.html', url);
		await save(run);
		assert.equal(run.completed.length, 1);
		assert.deepEqual(run.completed[0].attachments, [ARTICLE]);
	});

	test(`${label}: detection follows the official translator and steps aside on lists`, async () => {
		for (const [official, ours] of [['journalArticle', 'journalArticle'], ['multiple', false], [false, false]]) {
			const run = load(file, page, url, { official: { detectWeb: () => official } });
			assert.equal(await run.sandbox.detectWeb(run.doc, url), ours);
		}
	});

	test(`${label}: a file the official translator already added is not added again`, async () => {
		const first = load(file, page, url);
		const [known] = first.sandbox.siSaverSupplements(first.doc);
		const run = load(file, page, url, { official: {
			doWeb: (doc, address, passOn) => passOn({ attachments: [{ url: known.url }] }),
		} });
		await save(run);
		assert.equal(run.completed[0].attachments.length, types.length);
		assert.equal(new Set(run.completed[0].attachments.map(a => a.url)).size, types.length);
	});

	test(`${label}: an error while reading the SI keeps the item`, async () => {
		const run = load(file, page, url);
		run.sandbox.siSaverSupplements = () => {
			throw new Error('page changed');
		};
		await save(run);
		assert.equal(run.completed.length, 1);
		assert.deepEqual(run.completed[0].attachments, [ARTICLE]);
	});

	test(`${label}: the Library Catalog names the official translator`, async () => {
		const run = load(file, page, url);
		await save(run);
		assert.equal(run.completed[0].libraryCatalog, OFFICIAL[file][2]);
		const own = load(file, page, url, { official: {
			doWeb: (doc, address, passOn) => passOn({ attachments: [], libraryCatalog: 'A site' }),
		} });
		await save(own);
		assert.equal(own.completed[0].libraryCatalog, 'A site');
		const webpage = load(file, page, url, { official: {
			doWeb: (doc, address, passOn) => passOn({ attachments: [], itemType: 'webpage' }),
		} });
		await save(webpage);
		assert.equal(webpage.completed[0].libraryCatalog, undefined);
	});

	test(`${label}: a page that became a list at save time is left to the official translator`, async () => {
		let saved = false;
		const run = load(file, page, url, { official: {
			detectWeb: () => 'multiple',
			doWeb: () => {
				saved = true;
			},
		} });
		await assert.rejects(save(run), /Not an article page/);
		assert.equal(saved, false);
	});

	test(`${label}: a missing official file leaves detection to Zotero`, async () => {
		const run = load(file, page, url, { official: { missing: true } });
		const result = await Promise.race([
			run.sandbox.detectWeb(run.doc, url).then(() => 'finished', () => 'failed'),
			new Promise(resolve => setTimeout(resolve, 50, 'still waiting')),
		]);
		assert.equal(result, 'still waiting');
	});

	test(`${label}: the official translator receives the page`, async () => {
		const run = load(file, page, url);
		await save(run);
		assert.ok(run.documents.length > 0);
		assert.ok(run.documents.every(value => value === run.doc));
	});

	test(`${label}: an error of the stand-in is passed on, so the Connector can fall back`, async () => {
		const run = load(file, page, url, { official: { doWeb: () => {
			throw new Error('site changed');
		} } });
		await assert.rejects(save(run), /site changed/);
		assert.equal(run.completed.length, 0);
	});

	test(`${label}: the official translator is called by its ID`, async () => {
		const run = load(file, page, url);
		await save(run);
		assert.ok(run.called.length > 0);
		assert.ok(run.called.every(call => call.type === 'web' && call.id === OFFICIAL[file][0]));
	});

	test(`${label}: spreadsheets, archives and media are never saved`, async () => {
		const run = load(file, page, url);
		await save(run);
		for (const attachment of si(run.completed[0])) {
			assert.doesNotMatch(attachment.url.split(/[?#]/)[0], /\.(xlsx?|csv|zip|tar|gz|mp4|png|jpe?g)$/i);
		}
	});
}

test('Wiley uses the description as the title and the absolute address', async () => {
	const run = load(WILEY, 'wiley_si_synthetic.html', WILEY_URL);
	const [file] = run.sandbox.siSaverSupplements(run.doc);
	assert.equal(file.title, 'Supporting Information');
	assert.match(file.url, /^https:\/\/onlinelibrary\.wiley\.com\/action\/downloadSupplement/);
});

test('Nature skips figure pages and repeated links', () => {
	const run = load('Nature Publishing Group SI Saver.js', 'nature_si_synthetic.html', 'https://www.nature.com/articles/x');
	const files = run.sandbox.siSaverSupplements(run.doc);
	assert.deepEqual(Array.from(files, a => a.title), ['Supplementary Information', 'Supplementary Methods']);
});

test('The hidden setting supplementaryAsLink turns files into links', () => {
	for (const [file, page, url] of SITES.map(site => site.slice(1, 4))) {
		const run = load(file, page, url, { prefs: { supplementaryAsLink: true } });
		const files = run.sandbox.siSaverSupplements(run.doc);
		assert.ok(files.length > 0);
		assert.ok(files.every(attachment => attachment.snapshot === false), file);
	}
});

test('Silverchair skips the author manuscript and keeps the CDN link of OUP', () => {
	const run = load('Silverchair SI Saver.js', 'silverchair_si_synthetic.html', 'https://pubs.acs.org/x/article/1/1/1/1/x');
	const files = run.sandbox.siSaverSupplements(run.doc);
	assert.ok(files.every(a => !a.url.includes('_auv')));
	assert.match(files[2].url, /x_supplemental_file\.docx\?Expires=1/);
});

test('Silverchair numbers the saved files and saves a repeated link once', () => {
	const run = load('Silverchair SI Saver.js', 'silverchair_si_synthetic.html', 'https://pubs.acs.org/x/article/1/1/1/1/x');
	const list = run.doc.querySelector('.dataSuppLink');
	run.doc.body.append(list.cloneNode(true));
	const files = run.sandbox.siSaverSupplements(run.doc);
	assert.deepEqual(Array.from(files, a => a.title), ['Supplement 1', 'Supplement 2', 'Supplement 3']);
});

test('ScienceDirect skips the combined file and leaves the Word type open', () => {
	const run = load('ScienceDirect SI Saver.js', 'sciencedirect_si_synthetic.html', 'https://www.sciencedirect.com/science/article/pii/S1');
	const files = run.sandbox.siSaverSupplements(run.doc);
	assert.deepEqual(Array.from(files, fileName), ['1-s2.0-S1-mmc2.docx', '1-s2.0-S1-mmc3.pdf']);
	assert.equal(files[0].title, 'Supplementary data 2');
	assert.equal(files[0].mimeType, undefined);
	assert.equal(files[1].mimeType, PDF);
	assert.equal(files[0].proxy, false);
});

test('arXiv saves ancillary PDFs and skips other files', () => {
	const run = load('arXiv.org SI Saver.js', 'arxiv_si_synthetic.html', 'https://arxiv.org/abs/2601.00001');
	const files = run.sandbox.siSaverSupplements(run.doc);
	assert.deepEqual(Array.from(files, fileName), ['guide.pdf', 'Supplementary_Information.pdf']);
});

for (const [file, url] of [['Atypon Journals SI Saver.js', SCIENCE], ['arXiv.org SI Saver.js', 'https://arxiv.org/abs/2601.00001']]) {
	test(`${file} keeps the other SI files when one name is badly encoded`, () => {
		const run = load(file, 'bad_name_synthetic.html', url);
		assert.equal(run.sandbox.siSaverSupplements(run.doc).length, 2);
	});
}

test('A ChemRxiv item becomes a preprint with its date', async () => {
	const run = load('Atypon Journals SI Saver.js', 'atypon_si_synthetic.html', CHEMRXIV, { official: {
		doWeb: (doc, url, passOn) => passOn({
			itemType: 'journalArticle', attachments: [], volume: '2024', issue: '0805',
			publicationTitle: 'ChemRxiv', publisher: 'ChemRxiv',
		}),
	} });
	await save(run);
	const { complete, attachments, ...fields } = run.completed[0];
	assert.deepEqual(fields, { itemType: 'preprint', repository: 'ChemRxiv', date: '2024-08-05', libraryCatalog: 'Atypon Journals' });
	assert.equal(attachments.length, 2);
	assert.equal(typeof complete, 'function');
});

test('A ChemRxiv item takes the online date from the page first', async () => {
	const run = load('Atypon Journals SI Saver.js', 'atypon_si_synthetic.html', CHEMRXIV, { official: {
		doWeb: (doc, url, passOn) => passOn({ attachments: [], volume: '2024', issue: '0805' }),
	} });
	run.doc.head.insertAdjacentHTML('beforeend', '<meta name="citation_online_date" content="2024/09/01">');
	await save(run);
	assert.equal(run.completed[0].date, '2024-09-01');
});

test('An error in the ChemRxiv repair keeps the item and its SI', async () => {
	const run = load('Atypon Journals SI Saver.js', 'atypon_si_synthetic.html', CHEMRXIV);
	run.sandbox.siSaverFixChemRxiv = () => {
		throw new Error('page changed');
	};
	await save(run);
	assert.equal(run.completed.length, 1);
	assert.equal(si(run.completed[0]).length, 2);
});

test('The ChemRxiv repair leaves other Atypon sites alone', async () => {
	const run = load('Atypon Journals SI Saver.js', 'atypon_si_synthetic.html', SCIENCE, { official: {
		doWeb: (doc, url, passOn) => passOn({ itemType: 'journalArticle', attachments: [], volume: '2024' }),
	} });
	await save(run);
	assert.equal(run.completed[0].itemType, 'journalArticle');
	assert.equal(run.completed[0].volume, '2024');
});

test('Each file has its own ID and runs just before its official translator', () => {
	const files = fs.readdirSync(path.join(ROOT, 'translators'));
	assert.deepEqual(files.sort(), Object.keys(OFFICIAL).sort());
	const ids = new Set();
	const dates = new Set();
	for (const name of files) {
		const { meta, code } = split(name);
		const [officialId, priority, officialLabel] = OFFICIAL[name];
		assert.notEqual(meta.translatorID, officialId);
		assert.equal(code.match(/SI_SAVER_OFFICIAL_ID = '([^']+)'/)[1], officialId);
		assert.equal(code.match(/SI_SAVER_OFFICIAL_LABEL = '([^']+)'/)[1], officialLabel);
		assert.equal(meta.priority, priority - 1);
		assert.equal(meta.inRepository, false);
		// Zotero writes an official update to <official label>.js
		assert.equal(name, `${meta.label}.js`);
		assert.doesNotMatch(meta.lastUpdated, /^2099/);
		ids.add(meta.translatorID);
		dates.add(meta.lastUpdated);
	}
	assert.equal(ids.size, files.length);
	assert.equal(dates.size, 1);
});
