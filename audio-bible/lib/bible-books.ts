export interface BibleBook {
  name: string;
  abbrev: string;
  aliases: string[];
  testament: "OT" | "NT";
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: "Genesis", abbrev: "Gen", aliases: ["gen", "genesis"], testament: "OT" },
  { name: "Exodus", abbrev: "Exod", aliases: ["exod", "exodus", "ex"], testament: "OT" },
  { name: "Leviticus", abbrev: "Lev", aliases: ["lev", "leviticus"], testament: "OT" },
  { name: "Numbers", abbrev: "Num", aliases: ["num", "numbers", "numb"], testament: "OT" },
  { name: "Deuteronomy", abbrev: "Deut", aliases: ["deut", "deuteronomy", "deu"], testament: "OT" },
  { name: "Joshua", abbrev: "Josh", aliases: ["josh", "joshua"], testament: "OT" },
  { name: "Judges", abbrev: "Judg", aliases: ["judg", "judges", "jdg"], testament: "OT" },
  { name: "Ruth", abbrev: "Ruth", aliases: ["ruth"], testament: "OT" },
  { name: "1 Samuel", abbrev: "1Sam", aliases: ["1sam", "1 samuel", "1st samuel", "i samuel", "i sam"], testament: "OT" },
  { name: "2 Samuel", abbrev: "2Sam", aliases: ["2sam", "2 samuel", "2nd samuel", "ii samuel", "ii sam"], testament: "OT" },
  { name: "1 Kings", abbrev: "1Kgs", aliases: ["1kgs", "1 kings", "1st kings", "i kings"], testament: "OT" },
  { name: "2 Kings", abbrev: "2Kgs", aliases: ["2kgs", "2 kings", "2nd kings", "ii kings"], testament: "OT" },
  { name: "1 Chronicles", abbrev: "1Chr", aliases: ["1chr", "1 chronicles", "1st chronicles", "i chronicles", "1 chron"], testament: "OT" },
  { name: "2 Chronicles", abbrev: "2Chr", aliases: ["2chr", "2 chronicles", "2nd chronicles", "ii chronicles", "2 chron"], testament: "OT" },
  { name: "Ezra", abbrev: "Ezra", aliases: ["ezra"], testament: "OT" },
  { name: "Nehemiah", abbrev: "Neh", aliases: ["neh", "nehemiah"], testament: "OT" },
  { name: "Esther", abbrev: "Esth", aliases: ["esth", "esther", "est"], testament: "OT" },
  { name: "Job", abbrev: "Job", aliases: ["job"], testament: "OT" },
  { name: "Psalms", abbrev: "Ps", aliases: ["ps", "psalms", "psalm", "psa"], testament: "OT" },
  { name: "Proverbs", abbrev: "Prov", aliases: ["prov", "proverbs", "pro"], testament: "OT" },
  { name: "Ecclesiastes", abbrev: "Eccl", aliases: ["eccl", "ecclesiastes", "ecc", "qohelet"], testament: "OT" },
  { name: "Song of Solomon", abbrev: "Song", aliases: ["song", "song of solomon", "song of songs", "sos", "canticles"], testament: "OT" },
  { name: "Isaiah", abbrev: "Isa", aliases: ["isa", "isaiah"], testament: "OT" },
  { name: "Jeremiah", abbrev: "Jer", aliases: ["jer", "jeremiah"], testament: "OT" },
  { name: "Lamentations", abbrev: "Lam", aliases: ["lam", "lamentations"], testament: "OT" },
  { name: "Ezekiel", abbrev: "Ezek", aliases: ["ezek", "ezekiel", "eze"], testament: "OT" },
  { name: "Daniel", abbrev: "Dan", aliases: ["dan", "daniel"], testament: "OT" },
  { name: "Hosea", abbrev: "Hos", aliases: ["hos", "hosea"], testament: "OT" },
  { name: "Joel", abbrev: "Joel", aliases: ["joel"], testament: "OT" },
  { name: "Amos", abbrev: "Amos", aliases: ["amos"], testament: "OT" },
  { name: "Obadiah", abbrev: "Obad", aliases: ["obad", "obadiah"], testament: "OT" },
  { name: "Jonah", abbrev: "Jonah", aliases: ["jonah", "jon"], testament: "OT" },
  { name: "Micah", abbrev: "Mic", aliases: ["mic", "micah"], testament: "OT" },
  { name: "Nahum", abbrev: "Nah", aliases: ["nah", "nahum"], testament: "OT" },
  { name: "Habakkuk", abbrev: "Hab", aliases: ["hab", "habakkuk"], testament: "OT" },
  { name: "Zephaniah", abbrev: "Zeph", aliases: ["zeph", "zephaniah"], testament: "OT" },
  { name: "Haggai", abbrev: "Hag", aliases: ["hag", "haggai"], testament: "OT" },
  { name: "Zechariah", abbrev: "Zech", aliases: ["zech", "zechariah"], testament: "OT" },
  { name: "Malachi", abbrev: "Mal", aliases: ["mal", "malachi"], testament: "OT" },
  // New Testament
  { name: "Matthew", abbrev: "Matt", aliases: ["matt", "matthew", "mt"], testament: "NT" },
  { name: "Mark", abbrev: "Mark", aliases: ["mark", "mrk", "mk"], testament: "NT" },
  { name: "Luke", abbrev: "Luke", aliases: ["luke", "lk"], testament: "NT" },
  { name: "John", abbrev: "John", aliases: ["john", "jn", "jhn"], testament: "NT" },
  { name: "Acts", abbrev: "Acts", aliases: ["acts", "act"], testament: "NT" },
  { name: "Romans", abbrev: "Rom", aliases: ["rom", "romans"], testament: "NT" },
  { name: "1 Corinthians", abbrev: "1Cor", aliases: ["1cor", "1 corinthians", "1st corinthians", "i corinthians", "1 cor"], testament: "NT" },
  { name: "2 Corinthians", abbrev: "2Cor", aliases: ["2cor", "2 corinthians", "2nd corinthians", "ii corinthians", "2 cor"], testament: "NT" },
  { name: "Galatians", abbrev: "Gal", aliases: ["gal", "galatians"], testament: "NT" },
  { name: "Ephesians", abbrev: "Eph", aliases: ["eph", "ephesians"], testament: "NT" },
  { name: "Philippians", abbrev: "Phil", aliases: ["phil", "philippians"], testament: "NT" },
  { name: "Colossians", abbrev: "Col", aliases: ["col", "colossians"], testament: "NT" },
  { name: "1 Thessalonians", abbrev: "1Thess", aliases: ["1thess", "1 thessalonians", "i thessalonians", "1 thess"], testament: "NT" },
  { name: "2 Thessalonians", abbrev: "2Thess", aliases: ["2thess", "2 thessalonians", "ii thessalonians", "2 thess"], testament: "NT" },
  { name: "1 Timothy", abbrev: "1Tim", aliases: ["1tim", "1 timothy", "i timothy", "1 tim"], testament: "NT" },
  { name: "2 Timothy", abbrev: "2Tim", aliases: ["2tim", "2 timothy", "ii timothy", "2 tim"], testament: "NT" },
  { name: "Titus", abbrev: "Titus", aliases: ["titus", "tit"], testament: "NT" },
  { name: "Philemon", abbrev: "Phlm", aliases: ["phlm", "philemon", "phm"], testament: "NT" },
  { name: "Hebrews", abbrev: "Heb", aliases: ["heb", "hebrews"], testament: "NT" },
  { name: "James", abbrev: "Jas", aliases: ["jas", "james", "jms"], testament: "NT" },
  { name: "1 Peter", abbrev: "1Pet", aliases: ["1pet", "1 peter", "i peter", "1 pet"], testament: "NT" },
  { name: "2 Peter", abbrev: "2Pet", aliases: ["2pet", "2 peter", "ii peter", "2 pet"], testament: "NT" },
  { name: "1 John", abbrev: "1John", aliases: ["1john", "1 john", "i john", "1jn"], testament: "NT" },
  { name: "2 John", abbrev: "2John", aliases: ["2john", "2 john", "ii john", "2jn"], testament: "NT" },
  { name: "3 John", abbrev: "3John", aliases: ["3john", "3 john", "iii john", "3jn"], testament: "NT" },
  { name: "Jude", abbrev: "Jude", aliases: ["jude"], testament: "NT" },
  { name: "Revelation", abbrev: "Rev", aliases: ["rev", "revelation", "revelations", "apocalypse"], testament: "NT" },
];

// Build a fast lookup map: lowercase alias -> BibleBook
const aliasMap = new Map<string, BibleBook>();
for (const book of BIBLE_BOOKS) {
  for (const alias of book.aliases) {
    aliasMap.set(alias.toLowerCase(), book);
  }
  aliasMap.set(book.name.toLowerCase(), book);
  aliasMap.set(book.abbrev.toLowerCase(), book);
}

export function lookupBibleBook(name: string): BibleBook | undefined {
  return aliasMap.get(name.toLowerCase().trim());
}
