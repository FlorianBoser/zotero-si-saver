'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { load, ROOT } = require('./harness.cjs');

const PDF = 'application/pdf';
const DOC = 'application/msword';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const SCIENCE = 'https://www.science.org/doi/10.1126/science.x';

const fileName = attachment => attachment.url.split('/').pop();

test('Nature keeps PDF and Word once and skips figures and data', () => {
	const { doc, sandbox } = load('Nature Publishing Group.js', 'nature_si_synthetic.html', 'https://www.nature.com/articles/x');
	const item = { attachments: [] };
	sandbox.attachSupplementary(doc, item, () => {});
	assert.deepEqual(item.attachments.map(a => a.mimeType), [PDF, DOCX]);
});

test('Silverchair keeps SI from ACS, RSC and OUP links and skips the author manuscript', async () => {
	const url = 'https://pubs.acs.org/x/article/1/1/1/1/x';
	const { doc, sandbox, completed } = load('Silverchair.js', 'silverchair_si_synthetic.html', url);
	await sandbox.scrape(doc, url);
	const files = completed[0].attachments.filter(a => !a.document);
	assert.deepEqual(files.map(a => a.mimeType), [PDF, DOCX, DOCX]);
	assert.ok(files.every(a => !a.url.includes('_auv')));
	assert.match(files[2].url, /x_supplemental_file\.docx\?Expires=1/);
	assert.equal(completed[0].notes, undefined);
});

test('Wiley reads the SI table and skips data files', () => {
	const { doc, sandbox } = load('Wiley Online Library.js', 'wiley_si_synthetic.html', 'https://onlinelibrary.wiley.com/doi/full/10.1002/x');
	const item = { attachments: [] };
	sandbox.siSaverAddSupplements(doc, item);
	assert.deepEqual(item.attachments.map(a => a.mimeType), [PDF, DOCX]);
	assert.equal(item.attachments[0].title, 'Supporting Information');
	assert.match(item.attachments[0].url, /^https:\/\/onlinelibrary\.wiley\.com\/action\/downloadSupplement/);
});

test('Atypon keeps PDF and Word once and skips data and archives', () => {
	const { doc, sandbox } = load('Atypon Journals.js', 'atypon_si_synthetic.html', SCIENCE);
	const item = { attachments: [] };
	sandbox.siSaverAddSupplements(doc, item);
	assert.deepEqual(item.attachments.map(a => a.mimeType), [PDF, DOC]);
});

test('ChemRxiv items become preprints with their date', () => {
	const url = 'https://chemrxiv.org/doi/full/10.26434/chemrxiv-2024-x';
	const { doc, sandbox } = load('Atypon Journals.js', 'atypon_si_synthetic.html', url);
	const item = { itemType: 'journalArticle', volume: '2024', issue: '0805', publicationTitle: 'ChemRxiv', publisher: 'ChemRxiv' };
	sandbox.siSaverFixChemRxiv(doc, url, item);
	assert.deepEqual({ ...item }, { itemType: 'preprint', repository: 'ChemRxiv', date: '2024-08-05' });
});

test('The ChemRxiv repair leaves other Atypon sites alone', () => {
	const { doc, sandbox } = load('Atypon Journals.js', 'atypon_si_synthetic.html', SCIENCE);
	const item = { itemType: 'journalArticle', volume: '2024' };
	sandbox.siSaverFixChemRxiv(doc, SCIENCE, item);
	assert.deepEqual({ ...item }, { itemType: 'journalArticle', volume: '2024' });
});

test('ScienceDirect skips video, spreadsheets and the combined file', () => {
	const { doc, sandbox } = load('ScienceDirect.js', 'sciencedirect_si_synthetic.html', 'https://www.sciencedirect.com/science/article/pii/S1');
	const item = { attachments: [] };
	sandbox.siSaverAddSupplements(doc, item);
	assert.deepEqual(item.attachments.map(fileName), ['1-s2.0-S1-mmc2.docx', '1-s2.0-S1-mmc3.pdf']);
	assert.equal(item.attachments[0].title, 'Supplementary data 2');
	// The server labels Word files differently, a declared type would lose the file
	assert.equal(item.attachments[0].mimeType, undefined);
	assert.equal(item.attachments[1].mimeType, PDF);
});

test('arXiv saves ancillary PDFs and skips other files', () => {
	const { doc, sandbox } = load('arXiv.org.js', 'arxiv_si_synthetic.html', 'https://arxiv.org/abs/2601.00001');
	const item = { attachments: [] };
	sandbox.siSaverAddSupplements(doc, item);
	assert.deepEqual(item.attachments.map(fileName), ['guide.pdf', 'Supplementary_Information.pdf']);
});

test('Every translator replaces the official file and shares one release date', () => {
	const folder = path.join(ROOT, 'translators');
	const dates = fs.readdirSync(folder).map((name) => {
		const source = fs.readFileSync(path.join(folder, name), 'utf8');
		return JSON.parse(source.match(/^\s*\{[\s\S]*?^\}/m)[0]).lastUpdated;
	});
	assert.equal(dates.length, 6);
	assert.equal(new Set(dates).size, 1);
	assert.match(dates[0], /^2099-/);
});
