# zotero-si-saver

<div align="center">
<em><b>Save an article with the Zotero Connector and get its supporting information too.</b></em>
</div>

<div align="center">

[![License: AGPL v3+](https://img.shields.io/badge/License-AGPL_v3%2B-blue.svg)](LICENSE)
[![Zotero: 10.0.7 tested](https://img.shields.io/badge/Zotero-10.0.7_tested-cc2936.svg)](#tested-versions)
[![Connector: 5.0.217 tested](https://img.shields.io/badge/Connector-5.0.217_tested-1f6feb.svg)](#tested-versions)
[![Platform: Windows](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](#tested-versions)

</div>

<p align="center">
  <a href="#what-it-does">What It Does</a> •
  <a href="#supported-publishers">Supported Publishers</a> •
  <a href="#tested-versions">Tested Versions</a> •
  <a href="#installation">Installation</a> •
  <a href="#updating-and-uninstalling">Updating and Uninstalling</a> •
  <a href="#known-limitations">Known Limitations</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#ai-assistance">AI Assistance</a>
</p>

---

## What It Does

Zotero saves the article PDF, but the supporting information (SI) of a paper usually
stays behind on the publisher's website. Collecting it by hand takes time, and it is
easy to forget.

This project is a set of patched Zotero web translators. A translator is the small
script Zotero uses to read an article page. With these files installed, one click on
the stock Zotero Connector saves the article and its SI as attachments of the same
Zotero item.

* **Saved:** PDF, DOC and DOCX files listed as supplementary files of the article,
  which includes files such as peer review files and reporting summaries when the
  publisher lists them
* **Not saved:** videos, images, spreadsheets and archives
* **Nothing else to install:** you keep the normal Zotero and the normal Connector
* **No hidden settings:** the translators do not need `attachSupplementary`

The translators only use your normal browser session. They download what you can
already open yourself and they do not get past bot checks or paywalls.

## Supported Publishers

Results come from real saves in Chrome. The article list is in
[docs/tested_articles.md](docs/tested_articles.md).

| Platform | Journals tested | Articles | SI as PDF | SI as Word |
|---|---|---|---|---|
| ACS | J. Am. Chem. Soc., J. Chem. Inf. Model. | 4 | Works | No example tested |
| RSC | Chem. Sci., Chem. Commun., Digital Discovery, React. Chem. Eng. | 4 | Works | No example tested |
| Springer Nature | Nature, Nat. Commun., Commun. Chem., Nat. Synth., Nat. Comput. Sci., Nat. Mach. Intell., Nat. Chem. Eng. | 7 | Works | No example tested |
| AAAS | Science, Sci. Adv. | 4 | Works | No example tested |
| PNAS | Proc. Natl. Acad. Sci. U.S.A. | 2 | Works | No example tested |
| Wiley | Angew. Chem. Int. Ed., Chem. Eur. J., Mol. Inform. | 6 | Works | Works |
| Elsevier (ScienceDirect) | Tetrahedron Lett., Chem, Matter | 3 | Works | Works, see [limitations](#known-limitations) |
| Oxford University Press | Nucleic Acids Res. | 1 | No example tested | Works |
| arXiv | Ancillary files | 1 | Works | No example tested |
| ChemRxiv | Preprints | 1 | Works | No example tested |

Other journals on these platforms should behave the same, but that is untested.

**Not supported yet**

* **bioRxiv and medRxiv:** the SI sits on a separate tab of the article page
* **cell.com:** untested. Cell Press journals do work when saved from ScienceDirect
* **All other publishers:** Zotero's official translators run as usual, so you get the
  article without its SI

## Tested Versions

| Component | Version |
|---|---|
| Zotero | 10.0.7, Windows 64-bit |
| Zotero Connector | 5.0.217 |
| Browser | Google Chrome |

Other browsers, macOS and Linux are untested. Reports are welcome, see
[Contributing](#contributing).

## Installation

**You need:** Zotero on your computer, the Zotero Connector in your browser, and
Zotero running while you save.

1. **Download the files.** On this page choose `Code > Download ZIP` and unpack it.
2. **Quit Zotero** completely.
3. **Open your Zotero translators folder.** Paste this into the address bar of
   Windows Explorer:

   ```
   %USERPROFILE%\Zotero\translators
   ```

   If you moved your Zotero data, the folder is inside the location shown under
   `Edit > Settings > Advanced > Files and Folders > Data Directory Location`.
4. **Copy the files.** Copy all six `.js` files from the `translators` folder of the
   download into that folder and replace the existing files:

   * `Atypon Journals.js`
   * `Nature Publishing Group.js`
   * `ScienceDirect.js`
   * `Silverchair.js`
   * `Wiley Online Library.js`
   * `arXiv.org.js`
5. **Start Zotero.**
6. **Reload the Connector.** Open `chrome://extensions` and click the reload arrow on
   the Zotero Connector card.
7. **Check two settings.** Both are usually already correct.
   * In `chrome://extensions`, under `Details` of the Zotero Connector, set
     `Site access` to `On all sites`.
   * In Zotero under `Edit > Settings > General`, keep
     `Automatically attach associated PDFs and other files when saving items`
     switched on.
8. **Try it.** Reload an open article page, or open this one, and save it with the
   Connector:

   ```
   https://doi.org/10.1038/s41467-020-19266-y
   ```

   The Zotero item should now hold the article PDF and a second PDF, the 16-page SI.

## Updating and Uninstalling

**Update:** repeat the installation with the new files. Every release changes the
`lastUpdated` date inside the files, and the Connector picks up new code only when
this date changes.

**Uninstall:**

1. Quit Zotero and delete the six files from the translators folder.
2. Start Zotero and choose `Edit > Settings > Advanced`, then `Reset Translators...`.
3. Reload the Connector in `chrome://extensions`.

Reset Translators removes every modified translator. If you added other custom
translators, for example through a plugin, check them afterwards.

SI files that were already saved stay in your library.

## Known Limitations

* **No official updates for these six translators.** To keep Zotero from replacing
  them, their date is set to 2099. If a publisher changes its website, a save can
  lose its SI or fail until the files here are updated.
* **A failed SI download shows no error.** Check that the file arrived, especially for
  large SI files. The Connector stops any download after 60 seconds.
* **Save one article at a time.** A large SI file went missing when two articles were
  saved at once, and it arrived when the article was saved alone.
* **Occasional save errors.** Wiley and PNAS sometimes showed "An error occurred while
  saving with..." and the item then had no SI or a different PDF version. Saving the
  article again usually worked. The cause is not known yet.
* **Word files from ScienceDirect end in `.doc`,** also when they are really DOCX. The
  publisher's server labels them that way. They still open in Word.
* **Needs Zotero running.** Without Zotero, the Connector uses the official translators
  and no SI is saved.
* **Zotero runs its usual fallback.** When a patched translator fails, the Connector
  tries the next one, so the error message can name a different translator than the
  publisher's own.

## How It Works

The Connector asks the running Zotero for its translators, and Zotero keeps the copy
with the newest `lastUpdated` date. That is why a file with a date in the future
replaces the official one with no change to Zotero or the Connector.

Zotero already has code for SI on some sites, behind the hidden setting
`attachSupplementary`, but much of it no longer matches current websites. The patches:

* read the SI list of the current website of each platform
* keep only PDF, DOC and DOCX files
* run without the hidden setting
* repair ChemRxiv items, which otherwise arrive as journal articles with the date in
  the volume and issue fields

Every change in the code is marked with the comment `SI_saver`. All other code is
unchanged from [zotero/translators](https://github.com/zotero/translators).

## Contributing

This project is young and needs testers and developers. Help is very welcome.

* **Report your results.** Open an issue with the journal, the DOI, your Zotero and
  Connector versions, what the page lists and what arrived. Reports that something
  works are useful as well.
* **Add a publisher.** Good first targets are bioRxiv, medRxiv, cell.com and any
  publisher you use often that is missing above.
* **Fix a broken site.** Publishers change their pages, so selectors will need care.
* **Help bring this upstream.** The best long-term home for working SI code is the
  official Zotero translators.

**Please do not attach** papers, SI files, saved article pages or Connector debug logs.
They can be protected by copyright, and pages and logs can contain your session
cookies. The HTML of the SI link itself, which you can copy with `Inspect` in the
browser, is enough for most reports.

**Development**

```
npm ci
npm test
```

The tests run the translators in Node against small hand-written pages in
`tests/fixtures`. They check which files are selected, not the downloads, so please
also try a change in the browser. When you change a translator, keep these rules:

* Change `lastUpdated` in every file you touch, or the Connector keeps the old code
* Save only PDF, DOC and DOCX
* Do not work around publisher bot checks
* Add test pages by hand, never copy a publisher's page into the repository

## License

The changes in this project are licensed under AGPL-3.0-or-later, see [LICENSE](LICENSE).
The translator files come from [zotero/translators](https://github.com/zotero/translators)
and keep their original authors, license statements and test cases. Each modified file
says so at its top. `ScienceDirect.js` has no license statement of its own and relies on
the [statement for the Zotero project](https://www.zotero.org/support/licensing).

This is an independent project. It is not affiliated with or endorsed by Zotero or
any publisher. You are responsible for following the terms of your publisher access.

## AI Assistance

These translators were developed with Anthropic's Claude (Opus) as a coding agent,
directed and reviewed by the author. Behavior is validated by the test suite described
under [Contributing](#contributing) and by the saves listed in
[docs/tested_articles.md](docs/tested_articles.md).
