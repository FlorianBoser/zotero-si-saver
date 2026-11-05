# Tested articles

Real saves in Google Chrome with Zotero 10.0.7 and Connector 5.0.217 on Windows.
"SI files" counts the files that arrived in addition to the article. The current files were
saved with `10.1021/jacs.5c22031`, `10.1021/jacs.6c00127`, `10.1039/c5sc04751j`, `10.1038/s41467-020-19266-y`,
`10.1126/science.abo4282`, `10.1002/anie.202204647`, `10.1016/j.matt.2024.10.015`,
`10.1093/nar/gkag870`, `2610.10320` and `10.26434/chemrxiv-2024-1ctkh`. `10.1073/pnas.2618341123`
and `10.1002/chem.71052` ran on a test build of 0.2.0, before its last small fixes. The others
ran on version 0.1.0, which read the SI lists with the same selectors but patched the official
translators directly.

| Platform | Journal | DOI or ID | SI files |
|---|---|---|---|
| ACS | J. Am. Chem. Soc. | `10.1021/jacs.5c22031` | 1 PDF |
| ACS | J. Am. Chem. Soc. | `10.1021/jacs.6c00127` | Saved, number and type not recorded |
| ACS | J. Am. Chem. Soc. | `10.1021/jacs.5c01120` | 1 PDF |
| ACS | J. Am. Chem. Soc. | `10.1021/jacs.1c12005` | 1 PDF |
| ACS | J. Chem. Inf. Model. | `10.1021/acs.jcim.0c01234` | 1 PDF |
| RSC | Chem. Sci. | `10.1039/c5sc04751j` | 1 PDF |
| RSC | Chem. Commun. | `10.1039/d5cc03155a` | 1 PDF |
| RSC | Digital Discovery | `10.1039/d4dd00347k` | 1 PDF |
| RSC | React. Chem. Eng. | `10.1039/d5re00572h` | 1 PDF |
| Springer Nature | Nature | `10.1038/s41586-026-10843-7` | 3 PDF |
| Springer Nature | Nat. Commun. | `10.1038/s41467-020-19266-y` | 1 PDF |
| Springer Nature | Commun. Chem. | `10.1038/s42004-026-01993-w` | 2 PDF |
| Springer Nature | Nat. Synth. | `10.1038/s44160-023-00473-6` | 1 PDF |
| Springer Nature | Nat. Comput. Sci. | `10.1038/s43588-026-01017-6` | 1 PDF |
| Springer Nature | Nat. Mach. Intell. | `10.1038/s42256-025-01066-y` | 2 PDF |
| Springer Nature | Nat. Chem. Eng. | `10.1038/s44286-023-00024-y` | 1 PDF |
| AAAS | Science | `10.1126/science.ads0018` | 2 PDF |
| AAAS | Science | `10.1126/science.aap9112` | 1 PDF |
| AAAS | Science | `10.1126/science.abo4282` | 1 PDF |
| AAAS | Sci. Adv. | `10.1126/sciadv.adw6047` | 1 PDF |
| PNAS | Proc. Natl. Acad. Sci. U.S.A. | `10.1073/pnas.1618569114` | 1 PDF |
| PNAS | Proc. Natl. Acad. Sci. U.S.A. | `10.1073/pnas.2618341123` | 1 PDF |
| Wiley | Angew. Chem. Int. Ed. | `10.1002/anie.202204647` | 1 PDF |
| Wiley | Angew. Chem. Int. Ed. | `10.1002/anie.201806920` | 1 PDF |
| Wiley | Angew. Chem. Int. Ed. | `10.1002/anie.202522687` | 1 DOCX |
| Wiley | Chem. Eur. J. | `10.1002/chem.201605499` | 1 PDF |
| Wiley | Chem. Eur. J. | `10.1002/chem.71052` | 1 DOCX |
| Wiley | Mol. Inform. | `10.1002/minf.202100294` | 1 PDF |
| Elsevier | Tetrahedron Lett. | `10.1016/j.tetlet.2018.09.041` | 1 Word file |
| Elsevier | Chem, on ScienceDirect | `10.1016/j.chempr.2020.02.017` | 1 PDF |
| Elsevier | Matter, on ScienceDirect | `10.1016/j.matt.2024.10.015` | 1 PDF |
| Oxford University Press | Nucleic Acids Res. | `10.1093/nar/gkag870` | 1 DOCX |
| arXiv | Preprint | `2610.10320` | 2 PDF |
| ChemRxiv | Preprint | `10.26434/chemrxiv-2024-1ctkh` | 1 PDF |

ChemRxiv `10.26434/chemrxiv-2024-1ctkh` saved no SI once, when saved quickly after opening the
page, and saved it on the next try. The cause was not established.

## Failed saves

| Platform | Journal | DOI or ID | Result |
|---|---|---|---|
| PNAS | Proc. Natl. Acad. Sci. U.S.A. | `10.1073/pnas.2619778123` | On version 0.1.0: error, saved by Embedded Metadata, no SI. Not repeated since |

## List pages

Saved with a test build of 0.2.0, before its last small fixes. Only the official translators
run on these pages.

| Page | Result |
|---|---|
| Wiley table of contents, Angew. Chem. Int. Ed. | Selection dialog, selected articles without SI |
| Science table of contents | Embedded Metadata, a snapshot of the page, no dialog and no articles |
