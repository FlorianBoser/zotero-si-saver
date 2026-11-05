# zotero-si-saver: Save Supporting Information with Zotero

<div align="center">
<em><b>Save an article with the Zotero Connector and get its supporting information as PDF and Word files too.</b></em>
</div>

<div align="center">

[![License: AGPL v3+](https://img.shields.io/badge/License-AGPL_v3%2B-blue.svg)](LICENSE)
[![Zotero: 10.0.7 tested](https://img.shields.io/badge/Zotero-10.0.7_tested-cc2936.svg)](#tested-versions)
[![Connector: 5.0.217 tested](https://img.shields.io/badge/Connector-5.0.217_tested-1f6feb.svg)](#tested-versions)
[![Platform: Windows](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](#tested-versions)

</div>

<p align="center">
  <a href="#what-it-does">What It Does</a> •
  <a href="#supported-publishers-and-journals">Supported Publishers</a> •
  <a href="#tested-versions">Tested Versions</a> •
  <a href="#how-to-install">Install</a> •
  <a href="#how-to-update-or-uninstall">Update or Uninstall</a> •
  <a href="#known-limitations">Limitations</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#frequently-asked-questions">FAQ</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#ai-assistance">AI Assistance</a>
</p>

---

## What It Does

Zotero saves the article PDF, but the supporting information (SI) of a paper, also called
supplementary information or supplementary materials, usually stays behind on the
publisher's website. Collecting these files by hand takes time, and it is easy to forget.

zotero-si-saver is a set of six Zotero web translators that download the supporting
information automatically. A translator is the small script Zotero uses to read an article
page. With these files installed, one click on the normal Zotero Connector in your browser
saves the article and its SI as attachments of the same Zotero item.

* **Saved:** PDF, DOC and DOCX files listed as supplementary files of the article, which
  includes files such as peer review files and reporting summaries when the publisher lists
  them
* **Not saved:** videos, images, spreadsheets and archives
* **Nothing else to install:** you keep the normal Zotero, the normal Connector and Zotero's
  official translators, which keep receiving their updates
* **No hidden settings:** the translators do not need `attachSupplementary`

The translators only use your normal browser session. They download what you can already
open yourself and they do not get past bot checks or paywalls.

## Supported Publishers and Journals

Results come from real saves in Chrome, most of them with version 0.1.0, which read the SI
lists with the same selectors. [docs/tested_articles.md](docs/tested_articles.md) has the
article list, says which articles were repeated with the current files and lists a failed save.

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

Other browsers, macOS and Linux are untested with real saves. Reports are welcome, see
[Contributing](#contributing).

## How to Install

**You need:** Zotero on your computer, started at least once, the Zotero Connector in your
browser, and Zotero running while you save.

**Using version 0.1.0?** Its files have a `lastUpdated` date in 2099 inside. Follow
[Upgrade from version 0.1.0](#upgrade-from-version-010) instead.

1. **Download the files.** On this page choose `Code > Download ZIP` and unpack it.
2. **Quit Zotero** completely.
3. **Open your Zotero translators folder.** Paste this into the address bar of Windows
   Explorer:

   ```
   %USERPROFILE%\Zotero\translators
   ```

   If you moved your Zotero data, the folder is inside the location shown under
   `Edit > Settings > Advanced > Files and Folders > Data Directory Location`.
4. **Copy the files.** Copy all six `.js` files from the `translators` folder of the download
   into that folder. Do not delete or replace anything there:

   * `Atypon Journals SI Saver.js`
   * `Nature Publishing Group SI Saver.js`
   * `ScienceDirect SI Saver.js`
   * `Silverchair SI Saver.js`
   * `Wiley Online Library SI Saver.js`
   * `arXiv.org SI Saver.js`
5. **Start Zotero.**
6. **Reload the Connector.** Open `chrome://extensions` and click the reload arrow on the
   Zotero Connector card.
7. **Check two settings.** Both are usually already correct.
   * In `chrome://extensions`, under `Details` of the Zotero Connector, set `Site access` to
     `On all sites`.
   * In Zotero under `Edit > Settings > General`, keep
     `Automatically attach associated PDFs and other files when saving items` switched on.
8. **Try it.** Reload an open article page, or open this one, and save it with the Connector:

   ```
   https://doi.org/10.1021/jacs.6c00127
   ```

   The Zotero item should now hold the article and its SI as an additional file. The Connector
   button should name `Silverchair SI Saver` when you point at it.

## How to Update or Uninstall

**Update:** repeat the installation and replace the six `SI Saver` files. Every release
changes the `lastUpdated` date inside the files, and the Connector picks up new code only
when this date changes.

**Uninstall:**

1. Quit Zotero and delete the six `SI Saver` files from the translators folder.
2. Start Zotero and reload the Connector in `chrome://extensions`.

SI files that were already saved stay in your library.

### Upgrade from Version 0.1.0

Version 0.1.0 made Zotero delete six of its official translators, and this version needs them
back. Without them the `SI Saver` files are not used.

1. Quit Zotero and delete the six old `SI Saver` files from the translators folder.
2. Start Zotero, open `Edit > Settings > Advanced > Files and Folders` and under
   `Database Maintenance` click `Reset Translators...`. This restores the official files. It
   also removes every other translator you added, for example through a plugin, so check
   those afterwards.
3. Quit Zotero and copy in the six new files.
4. Start Zotero and reload the Connector.

## Known Limitations

* **Save from the article page.** Only the article page gives SI. On a table of contents or
  search results page the official translator runs alone. A Wiley table of contents gave the
  normal selection dialog and the selected articles without SI. The Science table of contents
  gave a snapshot of the page through Embedded Metadata, with no dialog and no articles. PDF pages
  on arXiv and Wiley save no SI either, and ChemRxiv items saved from a list keep the wrong type
  and date.
* **Website changes can stop the SI.** If a publisher changes its list of SI files, the article
  should still save but the SI stops arriving until the files here are updated. Other website
  changes are for Zotero's official translators, which update themselves.
* **The official translators must stay in the folder.** Without them the `SI Saver` file is not
  used, and another translator saves the article without SI.
* **Official updates are tested on Linux.** A real update from Zotero's server replaced the six
  official files and kept these six on the Linux build of Zotero 10.0.7, and they still ran
  afterwards. Windows and upgrades between Zotero versions are not tested for this version.
* **New official sites are not covered by themselves.** Each file holds a copy of the address
  pattern of its official translator. On a site that Zotero adds later, the official translator
  runs alone until the copy here is updated.
* **A failed SI download can go unnoticed.** A failed PDF shows no error. Check that the file
  arrived, especially for large SI files. The Connector stops any download after 60 seconds.
* **Let the page finish loading before you save.** One quick save on ChemRxiv brought no SI, and
  the next try on the same article did. The cause was not established.
* **SI can stop the open access lookup.** The Connector looks for an open access copy only when
  no PDF arrived for the item. If you cannot get the article PDF but the SI PDF is free, the SI
  counts as that PDF and the lookup is skipped. This comes from reading the Connector's code and
  was not observed in a test.
* **Library proxies are untested.** All saves ran without one.
* **SI files use your Zotero storage.** They sync like any other attachment and count toward your
  storage quota if you use Zotero's file syncing.
* **Save one article at a time.** A large SI file went missing when two articles were saved at
  once, and it arrived when the article was saved alone.
* **Occasional save errors.** Wiley and PNAS sometimes showed "An error occurred while saving
  with..." on an earlier version, and the item then had no SI or a different PDF version. Saving
  the article again usually worked. The cause is not known yet.
* **Word files from ScienceDirect end in `.doc`,** also when they are really DOCX. The
  publisher's server labels them that way. They still open in Word.
* **Keep Zotero running.** All tests were done with Zotero open.
* **Zotero runs its usual fallback.** When a translator fails, the Connector tries the next one,
  so the error message can name a different translator and the item can arrive without SI.

## How It Works

Zotero runs one translator per save, the matching one with the lowest priority number, and
uses the others only when it fails. One translator can call another one by its ID, and these
files use that:

1. Each file has its own ID and a priority number one below its official translator, so it
   is tried first.
2. It asks the official translator whether it accepts the page. On a list page it steps aside,
   because a translator called by another one gets no selection dialog and would save every
   listed article. The official translator then runs alone.
3. It calls the official translator, which saves the article, its citation data and its PDF.
4. It reads the SI list of the current website of that platform, keeps PDF, DOC and DOCX files
   and adds them to the item. For ChemRxiv it also repairs items, which otherwise arrive as
   journal articles with the date in the volume and issue fields.

Zotero already has code for SI on some sites, behind the hidden setting `attachSupplementary`,
but much of it no longer matches current websites. These files do not need that setting. If
it is on, a file the official translator already added is not added again, but that official
code can also save other file types, such as spreadsheets.

## Frequently Asked Questions

**Can Zotero save supporting information automatically?** Not by default. Zotero saves the
article and usually leaves the supporting information on the publisher's website.
zotero-si-saver adds this for the [publishers listed above](#supported-publishers-and-journals).

**Does it replace Zotero's translators?** No. The official translators stay installed and keep
updating, and they still do the main work of each save.

**Do I need access to the journal?** Yes. The translators download only what your browser can
already open, so supporting information behind a paywall needs your normal access.

**Does it save spreadsheets or videos?** No. It saves PDF, DOC and DOCX files only.

**Why did the supporting information not arrive?** Check that you saved from the article page,
that the button names a translator ending in `SI Saver`, and that the
[settings](#how-to-install) are right. Then see the [limitations](#known-limitations).

**Does it work on macOS, Linux or in other browsers?** It is only tested in Chrome on Windows.
Reports from other systems are very welcome.

## Contributing

This project is young and needs testers and developers. Help is very welcome.

* **Report your results.** Open an issue with the journal, the DOI, your Zotero and Connector
  versions, what the page lists and what arrived. Reports that something works are useful as
  well.
* **Add a publisher.** Good first targets are bioRxiv, medRxiv, cell.com and any publisher you
  use often that is missing above.
* **Fix a broken site.** Publishers change their pages, so selectors will need care.
* **Help bring this upstream.** The best long-term home for working SI code is the official
  Zotero translators.

**Please do not attach** papers, SI files, saved article pages or Connector debug logs. They
can be protected by copyright, and pages and logs can contain your session cookies. The HTML
of the SI link itself, which you can copy with `Inspect` in the browser, is enough for most
reports.

**Development**

```
npm ci
npm test
```

This needs Node.js 24. The tests run the translators in Node against small hand-written pages
in `tests/fixtures`, with a stand-in for the official translator. They check which files are
selected and how the call to the official translator behaves, not the downloads and not the
official code, so please also try a change in the browser. When you change a translator, keep
these rules:

* Give all six files one new `lastUpdated`, or the Connector keeps the old code
* Keep each priority one below the official translator and the `target` equal to it
* Call the official translators instead of copying their code, and credit any code you adapt
* Save only PDF, DOC and DOCX
* Do not work around publisher bot checks
* Add test pages by hand, never copy a publisher's page into the repository

## License

The translators and tests in this project are licensed under AGPL-3.0-or-later, see
[LICENSE](LICENSE). Zotero's official translators are not part of this repository. They come
with Zotero and from [zotero/translators](https://github.com/zotero/translators).

**Credits.** The official translators called by these files do the main work of each save.
They were created by the authors below and improved by the contributors of
[zotero/translators](https://github.com/zotero/translators). One function in
`Silverchair SI Saver.js` is adapted from the official Silverchair translator by Sebastian Karcher
and Abe Jellinek, as noted at the top of that file.

| File | Official translator | Original authors |
|---|---|---|
| `Atypon Journals SI Saver.js` | Atypon Journals | Sebastian Karcher and Abe Jellinek |
| `Nature Publishing Group SI Saver.js` | Nature Publishing Group | Aurimas Vinckevicius |
| `ScienceDirect SI Saver.js` | ScienceDirect | Michael Berkowitz and Aurimas Vinckevicius |
| `Silverchair SI Saver.js` | Silverchair | Sebastian Karcher and Abe Jellinek |
| `Wiley Online Library SI Saver.js` | Wiley Online Library | Sean Takats, Michael Berkowitz, Avram Lyon and Aurimas Vinckevicius |
| `arXiv.org SI Saver.js` | arXiv.org | Sean Takats and Michael Berkowitz |

This is an independent project. It is not affiliated with or endorsed by Zotero or any
publisher. You are responsible for following the terms of your publisher access.

## AI Assistance

These translators were developed with Anthropic's Claude (Opus) as a coding agent, directed and
reviewed by the author. Behavior is validated by the test suite described under
[Contributing](#contributing) and by the saves listed in
[docs/tested_articles.md](docs/tested_articles.md).
