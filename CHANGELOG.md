# Changelog

## 0.2.0

The translators no longer replace the official ones. Each file has its own ID and calls the
official translator, which stays installed and keeps receiving Zotero's updates, then adds
the SI files. Installing and uninstalling no longer touch official files. List pages now save
without SI, because the official translator runs alone there. The files no longer contain the
official translators or their test cases, apart from one adapted function in
`Silverchair SI Saver.js`. Upgrading from 0.1.0 needs the steps in the README.

## 0.1.0

First public version. Saves SI as PDF, DOC and DOCX for ACS, RSC, Springer Nature,
AAAS, PNAS, Wiley, Elsevier (ScienceDirect), Oxford University Press, arXiv and
ChemRxiv. Repairs the item type and date of ChemRxiv items. The translators have their
own file names, so official updates do not overwrite them.
