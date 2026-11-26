// The canonical receipt bytes, keyed by "<contribution_id>/<sha256>". Each value is the
// exact UTF-8 text the chat tool and /proof/<id>/<sha256>/raw both serve; the key's sha256
// must equal the sha256 of the value (a test checks it). A changed record is a NEW entry with
// a new digest that names the old one in "supersedes"; an entry is never edited.
//
// Only receipts listed in allowlist.ts are ever opened. Real poidh submissions are not
// added here until Zaal clears each one in his own words.
export const RECEIPTS: Readonly<Record<string, string>> = {
  "fixture-zoostr-logo-0/1861f86b7f500b10f4d944362f1f0090752b56751083b5cbd85623be0b682b6e":
    '{"evidence_status":"SOURCE_REPORTED","hearth":"zoostr","id":"fixture-zoostr-logo-0","label":"fixture proof","revision":1,"schema":"sparkz.contribution_receipt.v0","settlement":"NOT_EVALUATED","source":{"bounty_id":"582","chain":"base","kind":"poidh_bounty","url":"https://poidh.xyz/base/bounty/1568"},"supersedes":null,"type":"fixture","what":"Fixture: a sample entry for the Zoostr logo bounty. Not a real submission.","when":"2026-11-25"}',
};
