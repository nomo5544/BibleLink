/* BibleLink — логіка застосунку.
   Сторінки зберігаються в localStorage, біблійний текст береться з bibleText.json. */

const STORAGE_KEY = 'bible_pages';
const MAX_VERSES = 40;        // максимум віршів у підказці для діапазону
const CHAPTER_PREVIEW = 10;   // скільки віршів показувати, якщо вказано лише розділ

let bibleData = {};
let pages = [];
let currentPageIndex = null;  // null = жодна сторінка не відкрита
let defaultContentHtml = '';
let tooltip = null;
let tooltipLink = null;

const canHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
const $ = (id) => document.getElementById(id);
// Прив'язує обробник, якщо елемент існує (відсутній елемент не повинен зупиняти запуск усього застосунку)
function on(id, eventName, handler) {
    const el = $(id);
    if (el) el.addEventListener(eventName, handler);
}

/* ---------- Словник скорочень (БЕЗ ЗМІН, крім видалених дублів) ---------- */
const bookNameMap = {
        "бут": "Буття", "буття": "Буття",
        "вих": "Вихід", "вихід": "Вихід",
        "лев": "Левит", "левит": "Левит",
        "чис": "Числа", "числа": "Числа",
        "повт": "Повторення Закону", "повторення": "Повторення Закону", "втор": "Повторення Закону", "повторення закону": "Повторення Закону",
        "існ": "Ісус Навин", "нав": "Ісус Навин", "ісус навин": "Ісус Навин",
        "суд": "Судді", "суддів": "Судді","судді": "Судді",
        "рут": "Рут", "Рути": "Рут",
        "1сам": "1 Самуїлова", "1самуїлова": "1 Самуїлова", "1 сам": "1 Самуїлова", "1 самуїлова": "1 Самуїлова",
        "2сам": "2 Самуїлова", "2самуїлова": "2 Самуїлова", "2 сам": "2 Самуїлова", "2 самуїлова": "2 Самуїлова",
        "1цар": "1 Царів", "1царів": "1 Царів", "1 цар": "1 Царів", "1 царів": "1 Царів",
        "2цар": "2 Царів", "2царів": "2 Царів", "2 цар": "2 Царів","2 царів": "2 Царів",
        "1хр": "1 Хронік", "1хронік": "1 Хронік", "1 хр": "1 Хронік", "1 хронік": "1 Хронік",
        "2хр": "2 Хронік", "2Хр": "2 Хронік", "2Хронік": "2 Хронік", "2 хр": "2 Хронік", "2 хронік": "2 Хронік",
        "езд": "Ездра", "ездри": "Ездра","ездра": "Ездра",
        "неем": "Неемія", "неемії": "Неемія", "неемія": "Неемія", "неєм": "Неемія",
        "ест": "Естер", "Естер": "Естер",
        "йов": "Йов", "йова": "Йов",
        "пс": "Псалми", "псалом": "Псалми", "псалми": "Псалми", "псалтир": "Псалми","псалм": "Псалми",
        "прип": "Приповісті", "приповістей": "Приповісті", "приповісті": "Приповісті",
        "еккл": "Екклезіяст", "екклезіяст": "Екклезіяст", "екклезіаст": "Екклезіяст", "ек": "Екклезіяст", "екл": "Екклезіяст",
        "пісн": "Пісня Над Піснями", "пісня": "Пісня Над Піснями", "Пісня Над Піснями": "Пісня Над Піснями",
        "іс": "Ісая", "ісаї": "Ісая", "ісая": "Ісая",
        "єр": "Єремія", "єремії": "Єремія", "єремія": "Єремія", "єрем": "Єремія",
        "плач": "Плач Єремії", "плач єремії": "Плач Єремії",
        "єзк": "Єзекіїль", "єзекіїля": "Єзекіїль", "єзекіїль": "Єзекіїль", "єзек": "Єзекіїль", "єз": "Єзекіїль",
        "дан": "Даниїл", "даниїла": "Даниїл", "даниїл": "Даниїл",
        "ос": "Осія", "осії": "Осія", "осія": "Осія",
        "йоіл": "Йоїл", "йоіла": "Йоїл", "йол": "Йоїл",
        "ам": "Амос", "амоса": "Амос", "амос": "Амос",
        "ов": "Овадія", "овд": "Овадія", "овдій": "Овадія", "овадія": "Овадія",
        "йона": "Йона", "йони": "Йона", "іона": "Йона",
        "мих": "Михей", "михея": "Михей", "михей": "Михей",
        "наум": "Наум", "наума": "Наум", 
        "авк": "Авакум", "авакума": "Авакум", "авакум": "Авакум", "авак": "Авакум", "аввакум": "Авакум", "ав": "Авакум",
        "соф": "Софонія", "софонії": "Софонія", "софонія": "Софонія",
        "ог": "Огій", "огія": "Огій", "огій": "Огій", "Аггей": "Огій", "Аг": "Огій", "Агг": "Огій",
        "зах": "Захарія", "захарії": "Захарія", "захарія": "Захарія",
        "мал": "Малахія", "малахії": "Малахія", "малахія": "Малахія",
        "мат": "Від Матвія", "матвія": "Від Матвія", "мт": "Від Матвія", "мф": "Від Матвія", "від матвія": "Від Матвія",
        "мар": "Від Марка", "марка": "Від Марка", "мр": "Від Марка", "марк": "Від Марка", "від марка": "Від Марка", "мк": "Від Марка",
        "лук": "Від Луки", "луки": "Від Луки", "лк": "Від Луки", "від луки": "Від Луки",
        "ів": "Від Івана", "івана": "Від Івана","від івана": "Від Івана","іван": "Від Івана",
        "дії": "Дії Апостолів", "Дії": "Дії Апостолів", "Дії апостолів": "Дії Апостолів",
        "рим": "До Римлян", "римлянам": "До Римлян", "римлян": "До Римлян", "До римлян": "До Римлян",
        "1кор": "1 до Коринтян", "1коринтянам": "1 до Коринтян", "1 коринтянам": "1 до Коринтян", "1 кор": "1 до Коринтян", "1 до коринтян": "1 до Коринтян", "1 коринтян": "1 до Коринтян",
        "2кор": "2 до Коринтян", "2коринтянам": "2 до Коринтян", "2 коринтянам": "2 до Коринтян", "2 кор": "2 до Коринтян", "2 до коринтян": "2 до Коринтян", "2 коринтян": "2 до Коринтян",
        "гал": "До Галатів", "галатів": "До Галатів", "до галатів": "До Галатів", "галатам": "До Галатів", "галат": "До Галатів",
        "еф": "До Ефесян", "ефесянам": "До Ефесян", "до ефесян": "До Ефесян", "ефесян": "До Ефесян", "ефес": "До Ефесян",
        "фил": "До Филип'ян", "филип'янам": "До Филип'ян", "до филип'ян": "До Филип'ян", "флп": "До Филип'ян", "филип’ян": "До Филип'ян",
        "кол": "До Колосян", "колосянам": "До Колосян", "колосян": "До Колосян", "до колосян": "До Колосян",
        "1сол": "1 до Солунян", "1солунянам": "1 до Солунян", "1 солунянам": "1 до Солунян", "1 сол": "1 до Солунян", "1 до солунян": "1 до Солунян",
        "2сол": "2 до Солунян", "2солунянам": "2 до Солунян", "2 сол": "2 до Солунян", "2 до солунян": "2 до Солунян", "2 солунянам": "2 до Солунян",
        "1тим": "1 до Тимофія", "1тимофію": "1 до Тимофія", "1 тимофію": "1 до Тимофія", "1 тим": "1 до Тимофія", "1 Тим": "1 до Тимофія", "1 до Тимофія": "1 до Тимофія", "1 тимофія": "1 до Тимофія",
        "2тим": "2 до Тимофія", "2тимофію": "2 до Тимофія", "2 тим": "2 до Тимофія", "2 до Тимофія": "2 до Тимофія", "2 Тимофія": "2 до Тимофія",
        "тит": "До Тита", "титу": "До Тита", "тита": "До Тита", "до тита": "До Тита",
        "флм": "До Филимона", "филимону": "До Филимона", "до филимона": "До Филимона",
        "євр": "До Євреїв", "євреям": "До Євреїв", "євреїв": "До Євреїв", "до євреїв": "До Євреїв",
        "як": "Якова", "якова": "Якова", "яків": "Якова",
        "1пет": "1 Петра", "1петра": "1 Петра", "1 петра": "1 Петра", "1 пет": "1 Петра", "1Пет": "1 Петра",
        "2пет": "2 Петра", "2петра": "2 Петра", "2 пет": "2 Петра", "2 петра": "2 Петра", "2Пет": "2 Петра",
        "1ів": "1 Івана", "1івана": "1 Івана", "1 івана": "1 Івана", "1 ів": "1 Івана", "1 Івана": "1 Івана",
        "2ів": "2 Івана", "2івана": "2 Івана", "2 івана": "2 Івана", "2 ів": "2 Івана",
        "3ів": "3 Івана", "3івана": "3 Івана", "3 івана": "3 Івана", "3 ів": "3 Івана",
        "юди": "Юди", "юд": "Юди",
        "об": "Об'явлення", "об'яв": "Об'явлення", "об'явл": "Об'явлення", "одкр": "Об'явлення", "Об’явлення": "Об'явлення"
};

// Додаткові написання (щоб працювало «1Петр 4:11» тощо)
Object.assign(bookNameMap, {
    "1петр": "1 Петра", "2петр": "2 Петра"
});

/* ---------- Розпізнавання посилань ---------- */
function normKey(s) {
    return s.toLowerCase().replace(/[’ʼ`´]/g, "'").replace(/\s+/g, '').replace(/\.$/, '');
}

const bookLookup = {};
const patternKeys = [];
for (const key in bookNameMap) {
    const n = normKey(key);
    if (!(n in bookLookup)) {
        bookLookup[n] = bookNameMap[key];
        patternKeys.push({ key, len: n.length });
    }
}
patternKeys.sort((a, b) => b.len - a.len);

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function keyToPattern(key) {
    const k = key.replace(/^(\d)\s*/, '$1 ').trim(); // «1кор» = «1 кор» = «1Кор»
    let out = '';
    for (const ch of k) {
        if (/\s/.test(ch)) out += '\\s*';
        else if (/['’ʼ`´]/.test(ch)) out += "['’ʼ`´]";
        else out += escapeRegex(ch);
    }
    return out;
}

const BOOK_PATTERN = patternKeys.map(k => keyToPattern(k.key)).join('|');
const RANGE = '\\d{1,3}(?:\\s*[-–—]\\s*\\d{1,3})?';
const BIBLE_REGEX_SRC =
    `(?<![\\p{L}\\p{N}'’ʼ])(${BOOK_PATTERN})(?:\\.\\s*|\\s+)(\\d{1,3})` +
    `(?:\\s*([:.])\\s*(${RANGE}(?:,\\s?${RANGE})*))?(?![\\p{L}\\p{N}])`;

// Короткі скорочення, що збігаються зі звичайними словами («як 5», «об 8»):
// розпізнаємо лише у формі «Як 5:3» (з двокрапкою й віршем).
const AMBIGUOUS_ABBR = new Set(['ярк']);

function findReferences(text) {
    const re = new RegExp(BIBLE_REGEX_SRC, 'giu');
    const found = [];
    let m;
    while ((m = re.exec(text)) !== null) {
        const norm = normKey(m[1]);
        const book = bookLookup[norm];
        const verses = m[4] ? m[4].replace(/\s+/g, '').replace(/[–—]/g, '-') : '';
        if (!book || (AMBIGUOUS_ABBR.has(norm) && !(m[3] === ':' && verses))) {
            re.lastIndex = m.index + m[1].length;
            continue;
        }
        found.push({ start: m.index, end: m.index + m[0].length, book, chapter: m[2], verses });
    }
    return found;
}

const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'BLOCKQUOTE', 'TABLE', 'TR', 'TD', 'TH', 'BR', 'PRE', 'HR']);

function wrapTextPart(node, from, to, ref) {
    let target = node;
    if (from > 0) target = node.splitText(from);
    if (to - from < target.nodeValue.length) target.splitText(to - from);
    const span = document.createElement('span');
    span.className = 'bible-link';
    span.dataset.book = ref.book;
    span.dataset.chapter = ref.chapter;
    span.dataset.verses = ref.verses;
    target.parentNode.replaceChild(span, target);
    span.appendChild(target);
}

// Шукає посилання в тексті всередині DOM (а не в сирому HTML), тож атрибути не ламаються,
// а посилання, розділене тегами (<b>Мт</b> 5:3), теж знаходиться.
function linkifyReferences(root) {
    const segs = [];
    let text = '';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
        if (n.nodeType === 1) {
            if (BLOCK_TAGS.has(n.tagName)) text += '\n';
            continue;
        }
        segs.push({ node: n, start: text.length, len: n.nodeValue.length });
        text += n.nodeValue;
    }
    const refs = findReferences(text);
    for (let i = refs.length - 1; i >= 0; i--) {
        const ref = refs[i];
        for (let j = segs.length - 1; j >= 0; j--) {
            const s = segs[j];
            if (s.start >= ref.end) continue;
            if (s.start + s.len <= ref.start) break;
            wrapTextPart(s.node, Math.max(ref.start, s.start) - s.start,
                Math.min(ref.end, s.start + s.len) - s.start, ref);
        }
    }
    return root;
}

/* ---------- Санітизація вставленого HTML ----------
   Зберігаємо все форматування (жирний, курсив, кольори, шрифти, розміри, відступи,
   списки, таблиці, вирівнювання), але прибираємо виконуваний код і картинки. */
const ALLOWED_TAGS = new Set(['P', 'DIV', 'SPAN', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'INS',
    'SUB', 'SUP', 'SMALL', 'BIG', 'FONT', 'CENTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'DL', 'DT', 'DD',
    'BLOCKQUOTE', 'A', 'HR', 'PRE', 'CODE', 'MARK', 'CITE', 'Q',
    'TABLE', 'CAPTION', 'COLGROUP', 'COL', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'IMG']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'VIDEO', 'AUDIO',
    'CANVAS', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LINK', 'META', 'TITLE', 'HEAD', 'NOSCRIPT',
    'TEMPLATE', 'SOURCE', 'PICTURE']);
const ALLOWED_STYLE_PROPS = new Set([
    'color', 'background', 'background-color',
    'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
    'text-decoration', 'text-decoration-line', 'text-decoration-color', 'text-decoration-style',
    'text-align', 'text-indent', 'text-transform', 'line-height', 'letter-spacing', 'word-spacing',
    'vertical-align', 'white-space',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-width', 'border-style', 'border-color', 'border-collapse', 'border-spacing',
    'padding-inline-start', 'margin-inline-start', 'table-layout',
    'list-style', 'list-style-type', 'width', 'height']);
const SAFE_STYLE_VALUE = /^[#\p{L}\p{N}\s(),.%"'\-+!\/]+$/u;
const UNSAFE_STYLE_VALUE = /url\s*\(|expression|javascript|@import|behavior|binding/i;

function cleanStyle(style) {
    const out = [];
    for (const decl of style.split(';')) {
        const i = decl.indexOf(':');
        if (i < 0) continue;
        const prop = decl.slice(0, i).trim().toLowerCase();
        const value = decl.slice(i + 1).trim();
        if (ALLOWED_STYLE_PROPS.has(prop) && value && SAFE_STYLE_VALUE.test(value) && !UNSAFE_STYLE_VALUE.test(value)) {
            out.push(`${prop}: ${value}`);
        }
    }
    return out.join('; ');
}

// Дозволені прості атрибути (старий HTML: <font color>, align, ширина таблиць тощо)
const SIMPLE_ATTRS = {
    FONT: { color: /^[#\w(),.\s%-]{1,40}$/, size: /^[+-]?\d$/, face: /^[\p{L}\p{N}\s,'"-]{1,80}$/u },
    P: { align: /^(left|right|center|justify)$/i },
    DIV: { align: /^(left|right|center|justify)$/i },
    H1: { align: /^(left|right|center|justify)$/i }, H2: { align: /^(left|right|center|justify)$/i },
    H3: { align: /^(left|right|center|justify)$/i }, H4: { align: /^(left|right|center|justify)$/i },
    TABLE: { align: /^(left|right|center)$/i, border: /^\d{1,2}$/, cellpadding: /^\d{1,2}$/, cellspacing: /^\d{1,2}$/, width: /^\d{1,4}%?$/ },
    TD: { align: /^(left|right|center|justify)$/i, valign: /^(top|middle|bottom)$/i, colspan: /^\d{1,2}$/, rowspan: /^\d{1,2}$/, width: /^\d{1,4}%?$/ },
    TH: { align: /^(left|right|center|justify)$/i, valign: /^(top|middle|bottom)$/i, colspan: /^\d{1,2}$/, rowspan: /^\d{1,2}$/, width: /^\d{1,4}%?$/ },
    OL: { type: /^[1aAiI]$/, start: /^\d{1,4}$/ },
    COL: { width: /^\d{1,4}$/, span: /^\d{1,2}$/ },
    COLGROUP: { span: /^\d{1,2}$/ },
    IMG: { alt: /^[^<>]{0,300}$/, width: /^\d{1,4}$/, height: /^\d{1,4}$/ }
};

const BLOCKISH = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TABLE',
    'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'PRE', 'HR', 'BR', 'DL', 'DT', 'DD', 'CAPTION', 'COLGROUP', 'COL']);
function isBetweenBlocks(node) {
    const prev = node.previousElementSibling, next = node.nextElementSibling;
    const parent = node.parentElement;
    const inContainer = parent && /^(UL|OL|TABLE|THEAD|TBODY|TFOOT|TR|DL|BODY)$/i.test(parent.tagName);
    return inContainer || (prev && BLOCKISH.has(prev.tagName)) || (next && BLOCKISH.has(next.tagName));
}

function sanitizeInto(src, dest) {
    for (const child of Array.from(src.childNodes)) {
        if (child.nodeType === 3) {
            // переноси рядків між блоками (з вихідного HTML) не повинні давати порожні рядки
            if (/^\s*$/.test(child.nodeValue) && child.nodeValue.includes('\n') && isBetweenBlocks(child)) continue;
            dest.appendChild(document.createTextNode(child.nodeValue));
        } else if (child.nodeType === 1) {
            const tag = child.tagName.toUpperCase();
            if (DROP_TAGS.has(tag)) continue;
            if (!ALLOWED_TAGS.has(tag)) { sanitizeInto(child, dest); continue; } // прибираємо тег, лишаємо текст
            if (tag === 'IMG' && !/^https:\/\//i.test((child.getAttribute('src') || '').trim())) continue; // data: та інше не зберігаємо
            const el = document.createElement(tag.toLowerCase());
            if (tag === 'IMG') {
                el.setAttribute('src', child.getAttribute('src').trim());
                el.setAttribute('referrerpolicy', 'no-referrer');
                el.setAttribute('loading', 'lazy');
            }
            const style = child.getAttribute('style');
            if (style) { const cs = cleanStyle(style); if (cs) el.setAttribute('style', cs); }
            const rules = SIMPLE_ATTRS[tag];
            if (rules) {
                for (const name in rules) {
                    const v = child.getAttribute(name);
                    if (v && rules[name].test(v)) el.setAttribute(name, v);
                }
            }
            if (tag === 'A') {
                const href = (child.getAttribute('href') || '').trim();
                if (/^(https?:|mailto:)/i.test(href)) {
                    el.setAttribute('href', href);
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'noopener noreferrer');
                }
            }
            sanitizeInto(child, el);
            dest.appendChild(el);
        }
    }
}


/* ---------- Списки з Microsoft Word ----------
   Word не створює <ul>/<ol>: кожен пункт — абзац (class="MsoListParagraph") із маркером-текстом
   («·», «o», «1.» та купою нерозривних пробілів). Перетворюємо їх на справжні вкладені списки,
   як це робить Google Docs. */
const WORD_BULLET_RE = /^[\s\u00a0]*([·•○◦▪■□●o§\-–—\uF0B7\uF0A7\uF0D8\uF076\uF0FC\uF0A8])[\s\u00a0]{2,}/;
const WORD_ORDERED_RE = /^[\s\u00a0]*((?:\d{1,3}|[a-zA-Zа-яіїєґА-ЯІЇЄҐ]|[ivxlcdmIVXLCDM]{1,6})[.)])[\s\u00a0]{2,}/;

function cssLengthToPt(value) {
    const m = /^(-?[\d.]+)(pt|px|cm|mm|in|pc)?$/i.exec((value || '').trim());
    if (!m) return 0;
    const unit = (m[2] || '').toLowerCase();
    return unit === 'px' ? parseFloat(m[1]) * 0.75 : parseFloat(m[1]) * (TO_PT[unit] || 0);
}

function stripLeadingChars(root, count) {
    const walker = root.ownerDocument.createTreeWalker(root, 4 /* SHOW_TEXT */);
    const nodes = [];
    let t;
    while ((t = walker.nextNode())) nodes.push(t);
    for (const node of nodes) {
        if (count <= 0) break;
        const len = node.nodeValue.length;
        if (len <= count) { count -= len; node.nodeValue = ''; }
        else { node.nodeValue = node.nodeValue.slice(count); count = 0; }
    }
    root.querySelectorAll('*').forEach((el) => {
        if (!el.textContent && !el.querySelector('img, br, hr')) el.remove();
    });
}

function isWordListPara(el) {
    return el.tagName === 'P' && (/MsoList/i.test(el.className || '') || /mso-list/i.test(el.getAttribute('style') || ''));
}

// Розпізнає маркер, видаляє його з абзацу й повертає опис пункту (або null, якщо це не список)
function parseWordListPara(p) {
    const text = p.textContent;
    let m = WORD_BULLET_RE.exec(text);
    let ordered = false;
    if (!m) { m = WORD_ORDERED_RE.exec(text); ordered = !!m; }
    if (!m) return null;
    const marker = m[1];
    stripLeadingChars(p, m[0].length);
    let level = 1;
    const lv = /level(\d)/i.exec(p.getAttribute('style') || '');
    if (lv) level = Math.min(6, +lv[1]);
    else {
        const pt = cssLengthToPt(p.style.marginLeft);
        if (pt > 0) level = Math.min(6, Math.max(1, Math.round(pt / 36)));
    }
    let type = 'disc';
    let start = null;
    if (!ordered) {
        if (/^[o○◦]$/.test(marker)) type = 'circle';
        else if (/^[▪■□§\uF0A7]$/.test(marker)) type = 'square';
    } else {
        const core = marker.replace(/[.)]$/, '');
        if (/^\d+$/.test(core)) { type = 'decimal'; start = +core; }
        else if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$/.test(core)) type = 'lower-roman';
        else if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/.test(core)) type = 'upper-roman';
        else type = core === core.toUpperCase() ? 'upper-alpha' : 'lower-alpha';
    }
    return { ordered, type, start, level };
}

function convertWordLists(root) {
    const doc = root.ownerDocument;
    function walk(parent) {
        let stack = [];
        for (const node of Array.from(parent.childNodes)) {
            if (node.nodeType === 3 && !node.nodeValue.trim()) continue; // пробіли між пунктами не рвуть список
            const info = node.nodeType === 1 && isWordListPara(node) ? parseWordListPara(node) : null;
            if (!info) {
                stack = [];
                if (node.nodeType === 1) walk(node);
                continue;
            }
            while (stack.length && stack[stack.length - 1].level > info.level) stack.pop();
            let top = stack[stack.length - 1];
            if (top && top.level === info.level && top.ordered !== info.ordered) { stack.pop(); top = stack[stack.length - 1]; }
            if (!top || top.level < info.level) {
                const list = doc.createElement(info.ordered ? 'ol' : 'ul');
                list.style.listStyleType = info.type;
                if (info.ordered && info.start > 1) list.setAttribute('start', info.start);
                if (top && top.lastLi) top.lastLi.appendChild(list);
                else if (top) top.list.appendChild(list);
                else parent.insertBefore(list, node);
                top = { list, level: info.level, ordered: info.ordered, lastLi: null };
                stack.push(top);
            }
            const li = doc.createElement('li');
            for (const prop of ['line-height', 'margin-top', 'margin-bottom', 'text-align']) {
                const v = node.style.getPropertyValue(prop);
                if (v) li.style.setProperty(prop, v);
            }
            while (node.firstChild) li.appendChild(node.firstChild);
            top.list.appendChild(li);
            top.lastLi = li;
            parent.removeChild(node);
        }
    }
    walk(root);
}

// Повертає <div> із безпечною копією переданого HTML.
function sanitizeHtml(html) {
    const body = new DOMParser().parseFromString(String(html), 'text/html').body;
    convertWordLists(body);
    const out = document.createElement('div');
    sanitizeInto(body, out);
    return out;
}

/* ---------- Відображення як у Google Docs ----------
   Docs задає розміри в pt (11pt — звичайний текст) і px. Щоб зберегти пропорції
   (заголовки, відступи, інтервали), але зробити текст зручним для читання,
   значення множаться на коефіцієнт --k-pt / --k-px зі style.css.
   У збереженому тексті лишаються вихідні значення. */
const UNIT_RE = /(-?\d*\.?\d+)(pt|px|cm|mm|in|pc)\b/gi;
const TO_PT = { pt: 1, cm: 28.3465, mm: 2.83465, in: 72, pc: 12 }; // Word користується см та дюймами
const FONT_SIZE_EM = { 1: 0.63, 2: 0.82, 3: 1, 4: 1.13, 5: 1.5, 6: 2, 7: 3 };

function scaleDocUnits(root) {
    root.querySelectorAll('[style]').forEach((el) => {
        const st = el.getAttribute('style');
        const scaled = st.replace(UNIT_RE, (m, n, u) => {
            u = u.toLowerCase();
            if (u === 'px') return `calc(${n}px * var(--k-px))`;
            return `calc(${+(parseFloat(n) * TO_PT[u]).toFixed(2)}pt * var(--k-pt))`;
        });
        if (scaled !== st) el.setAttribute('style', scaled);
    });
    root.querySelectorAll('font[size]').forEach((el) => {
        const em = FONT_SIZE_EM[el.getAttribute('size').replace('+', '')];
        if (em && !/font-size/.test(el.getAttribute('style') || '')) el.style.fontSize = em + 'em';
    });
    // Ширини стовпців таблиці в px → відсотки: пропорції зберігаються, таблиця вміщується в екран
    root.querySelectorAll('table').forEach((table) => {
        const cols = Array.from(table.querySelectorAll('col'));
        const widths = cols.map(c => Number(c.getAttribute('width')) || 0);
        const total = widths.reduce((a, b) => a + b, 0);
        if (!total) return;
        cols.forEach((c, i) => {
            c.removeAttribute('width');
            if (widths[i]) c.style.width = (widths[i] / total * 100).toFixed(2) + '%';
        });
    });
    // Заголовки без власного розміру (вставлені не з Docs) отримують стандартний вигляд
    root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        if (!/font-size/.test(h.getAttribute('style') || '') && !h.querySelector('[style*="font-size"]')) {
            h.classList.add('plain-h');
        }
    });
    return root;
}

function hasVisibleText(container) { return container.textContent.trim().length > 0; }

/* ---------- Вірші та підказка ---------- */
function setBibleData(data) { bibleData = data || {}; }

function getVerses(book, chapter, spec) {
    const verses = [];
    let more = false;
    if (!spec) {
        for (let i = 1; ; i++) {
            const t = bibleData[`${book} ${chapter}:${i}`];
            if (t === undefined) break;
            if (verses.length >= CHAPTER_PREVIEW) { more = true; break; }
            verses.push({ num: i, text: t });
        }
        return { verses, more };
    }
    const nums = [];
    for (const part of spec.split(',')) {
        const m = part.match(/^(\d+)(?:-(\d+))?$/);
        if (!m) continue;
        const a = +m[1];
        const b = m[2] ? +m[2] : a;
        for (let i = a; i <= Math.max(a, b); i++) {
            if (nums.length >= MAX_VERSES) { more = true; break; }
            nums.push(i);
        }
    }
    for (const i of nums) {
        const t = bibleData[`${book} ${chapter}:${i}`];
        if (t !== undefined) verses.push({ num: i, text: t });
    }
    return { verses, more };
}

function showTooltip(event, result, link) {
    hideTooltip();
    tooltip = document.createElement('div');
    tooltip.id = 'bible-tooltip';
    tooltip.className = 'bible-tooltip';
    result.verses.forEach((v, i) => {
        if (i) tooltip.appendChild(document.createElement('br'));
        const num = document.createElement('span');
        num.className = 'verse-num';
        num.textContent = v.num;
        tooltip.appendChild(num);
        tooltip.appendChild(document.createTextNode(' ' + v.text));
    });
    if (result.more) {
        tooltip.appendChild(document.createElement('br'));
        tooltip.appendChild(document.createTextNode('…'));
    }
    document.body.appendChild(tooltip);
    tooltipLink = link;
    updateTooltipPosition(event);
    requestAnimationFrame(() => { if (tooltip) tooltip.classList.add('show'); });
}

function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; tooltipLink = null; }
}

function updateTooltipPosition(event) {
    if (!tooltip) return;
    const gap = 15;
    const w = tooltip.offsetWidth;
    const h = tooltip.offsetHeight;
    const scrollX = window.scrollX, scrollY = window.scrollY;
    let left = event.pageX + gap;
    let top = event.pageY + gap;
    if (left + w > scrollX + window.innerWidth - 10) left = event.pageX - w - gap;
    if (left < scrollX + 5) left = scrollX + 5;
    if (top + h > scrollY + window.innerHeight - 10) top = event.pageY - h - gap;
    if (top < scrollY + 5) top = scrollY + 5;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function showForLink(link, event) {
    const { book, chapter, verses } = link.dataset;
    const result = getVerses(book, chapter, verses);
    if (result.verses.length) showTooltip(event, result, link);
}

// Слухачі додаються ОДИН раз (контейнер #textcontent не перестворюється).
function setupEventListeners(container) {
    container.addEventListener('mouseover', (e) => {
        if (!canHover) return;
        const link = e.target.closest('.bible-link');
        if (link) showForLink(link, e);
    });
    container.addEventListener('mousemove', (e) => { if (canHover && tooltip) updateTooltipPosition(e); });
    container.addEventListener('mouseout', (e) => {
        if (canHover && e.target.closest('.bible-link')) hideTooltip();
    });
    // Сенсорні екрани: тап показує підказку, тап деінде ховає її
    container.addEventListener('click', (e) => {
        if (canHover) return;
        const link = e.target.closest('.bible-link');
        if (!link) return;
        if (tooltipLink === link) { hideTooltip(); return; }
        const r = link.getBoundingClientRect();
        showForLink(link, { pageX: r.left + window.scrollX, pageY: r.bottom + window.scrollY });
    });
    document.addEventListener('click', (e) => {
        if (!canHover && !e.target.closest('.bible-link')) hideTooltip();
    });
}

/* ---------- Збереження ---------- */
function loadPages() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return []; }
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error('очікувався масив');
        return parsed
            .filter(p => p && typeof p.content === 'string')
            .map(p => ({ title: String(p.title || 'Без назви').slice(0, 100), content: p.content }));
    } catch (e) {
        console.error('Пошкоджені дані, зроблено резервну копію:', e);
        try { localStorage.setItem(STORAGE_KEY + '_corrupt_backup', raw); } catch (_) { /* немає місця */ }
        return [];
    }
}

function savePages() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
        return true;
    } catch (e) {
        console.error('Не вдалося зберегти:', e);
        return false;
    }
}

/* ---------- Вкладки та сторінки ---------- */
function renderTabs() {
    const container = $('side-tabs');
    container.replaceChildren();
    pages.forEach((page, index) => {
        const tab = document.createElement('div');
        tab.className = 'side-tab' + (index === currentPageIndex ? ' active' : '');
        tab.dataset.index = index;
        tab.tabIndex = 0;
        tab.setAttribute('role', 'button');
        const del = document.createElement('span');
        del.className = 'delete-tab';
        del.textContent = '✕';
        del.setAttribute('aria-label', 'Видалити сторінку');
        tab.appendChild(del);
        tab.appendChild(document.createTextNode(page.title));
        container.appendChild(tab);
    });
    const folder = document.querySelector('.folder-container');
    if (folder) folder.classList.toggle('empty-folder', pages.length === 0);
}

function showEmptyState() {
    hideTooltip();
    currentPageIndex = null;
    $('textcontent').innerHTML = defaultContentHtml; // власна статична розмітка
    resetTimer();
    renderTabs();
    updateTimerVisibility();
}

function loadPage(index) {
    const page = pages[index];
    if (!page) { showEmptyState(); return; }
    hideTooltip();
    currentPageIndex = index;
    const root = linkifyReferences(scaleDocUnits(sanitizeHtml(page.content)));
    $('textcontent').replaceChildren(...root.childNodes);
    renderTabs();
    updateTimerVisibility();
}

function deletePage(index) {
    const page = pages[index];
    if (!page || !confirm(`Видалити «${page.title}»?`)) return;
    pages.splice(index, 1);
    if (!savePages()) alert('Не вдалося оновити збережені дані. Зміни можуть зникнути після перезапуску.');
    if (pages.length === 0) showEmptyState();
    else if (index === currentPageIndex) loadPage(Math.min(index, pages.length - 1));
    else { if (index < currentPageIndex) currentPageIndex--; renderTabs(); }
}

/* ---------- Діалог додавання ---------- */
function openAddDialog() {
    $('addDialog').style.display = 'flex';
    $('pageTitle').value = '';
    $('inputArea').innerHTML = '';
    $('pageTitle').focus();
}

function closeAddDialog() { $('addDialog').style.display = 'none'; }

function saveNewPage() {
    const clean = sanitizeHtml($('inputArea').innerHTML);
    if (!hasVisibleText(clean)) return; // порожній текст не зберігаємо
    const title = $('pageTitle').value.trim().slice(0, 60) || `Урок ${pages.length + 1}`;
    pages.push({ title, content: clean.innerHTML });
    if (!savePages()) {
        pages.pop();
        alert('Не вдалося зберегти: сховище браузера заповнене. Видаліть непотрібні сторінки.');
        return;
    }
    closeAddDialog();
    loadPage(pages.length - 1);
}

/* ---------- Таймер (рахує за реальним часом, а не за кількістю тиків) ---------- */
const timer = { running: false, base: 0, startedAt: 0, interval: null };

function timerElapsedMs() {
    return timer.base + (timer.running ? Date.now() - timer.startedAt : 0);
}

function updateTimerDisplay() {
    const total = Math.floor(timerElapsedMs() / 1000);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    const el = $('timer-display');
    if (el) el.textContent = `${mm}:${ss}`;
}

function toggleTimer() {
    const btn = $('timer-toggle');
    if (timer.running) {
        timer.base = timerElapsedMs();
        timer.running = false;
        clearInterval(timer.interval);
        btn.textContent = 'Start';
        btn.className = 'timer-btn start';
    } else {
        timer.startedAt = Date.now();
        timer.running = true;
        timer.interval = setInterval(updateTimerDisplay, 250);
        btn.textContent = 'Stop';
        btn.className = 'timer-btn stop';
    }
    updateTimerDisplay();
}

function resetTimer() {
    timer.running = false;
    timer.base = 0;
    clearInterval(timer.interval);
    const btn = $('timer-toggle');
    if (btn) { btn.textContent = 'Start'; btn.className = 'timer-btn start'; }
    updateTimerDisplay();
}

// Таймер видно лише тоді, коли відкрито сторінку з текстом
function updateTimerVisibility() {
    const box = $('pwa-timer');
    if (box) box.hidden = currentPageIndex === null;
}

/* ---------- Закладки й кнопка «+» ховаються під час прокрутки вниз ---------- */
function setupScrollHiding() {
    const HIDE_AFTER = 12; // px: скільки прокрутити, щоб сховати
    const SHOW_BELOW = 4;  // px: показуємо лише коли сторінка майже на самому початку
    let hidden = false;
    let waiting = false;
    const update = () => {
        waiting = false;
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        if (!hidden && y > HIDE_AFTER) { hidden = true; document.body.classList.add('scrolled-down'); }
        else if (hidden && y <= SHOW_BELOW) { hidden = false; document.body.classList.remove('scrolled-down'); }
    };
    window.addEventListener('scroll', () => {
        if (!waiting) { waiting = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
}

/* ---------- Версія, service worker ---------- */
async function displayVersion() {
    const el = $('app-version');
    if (!el) return;
    try {
        let text = '';
        const cached = window.caches ? await caches.match('sw.js') : null;
        if (cached) {
            text = await cached.text();
        } else {
            const response = await fetch('sw.js');
            if (response.ok) text = await response.text();
        }
        const m = text.match(/v\d+\.\d+/);
        if (m) el.textContent = m[0];
    } catch (e) {
        console.warn('Не вдалося зчитати версію з sw.js');
    }
}

function resetAppCache() {
    if (!confirm('Оновити застосунок до найновішої версії?')) return;
    const tasks = [];
    if (navigator.serviceWorker) {
        tasks.push(navigator.serviceWorker.getRegistrations()
            .then(regs => Promise.all(regs.map(r => r.unregister()))));
    }
    if (window.caches) {
        tasks.push(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
    }
    Promise.all(tasks).then(() => window.location.reload());
}

/* ---------- Ініціалізація ---------- */
function init() {
    defaultContentHtml = $('textcontent').innerHTML;
    pages = loadPages();

    setupEventListeners($('textcontent'));

    on('add-tab-btn', 'click', openAddDialog);
    on('saveBtn', 'click', saveNewPage);
    on('cancelBtn', 'click', closeAddDialog);
    on('timer-toggle', 'click', toggleTimer);
    on('resetTimerBtn', 'click', resetTimer);
    on('app-version', 'click', resetAppCache);

    // Enter у полі вводу зберігає сторінку (Shift+Enter — новий рядок)
    $('inputArea').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); saveNewPage(); }
    });
    $('pageTitle').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); $('inputArea').focus(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && $('addDialog').style.display === 'flex') closeAddDialog();
    });

    const tabs = $('side-tabs');
    tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.side-tab');
        if (!tab) return;
        const index = Number(tab.dataset.index);
        if (e.target.closest('.delete-tab')) deletePage(index);
        else loadPage(index);
    });
    tabs.addEventListener('keydown', (e) => {
        const tab = e.target.closest('.side-tab');
        if (tab && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); loadPage(Number(tab.dataset.index)); }
    });

    document.addEventListener('visibilitychange', updateTimerDisplay);
    setupScrollHiding();

    resetTimer();
    if (pages.length) loadPage(0); else showEmptyState();

    if (typeof fetch === 'function') {
        fetch('bibleText.json')
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(setBibleData)
            .catch(err => console.error('Не вдалося завантажити bibleText.json:', err));
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW:', err));
    }
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches &&
        navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }
    displayVersion();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
