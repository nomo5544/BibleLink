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
const AMBIGUOUS_ABBR = new Set(['як', 'об', 'суд', 'мал', 'зах', 'дан', 'кол', 'ам', 'ов', 'ав', 'ог', 'ос', 'ек', 'іс', 'ів', 'ест']);

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

/* ---------- Санітизація вставленого HTML ---------- */
const ALLOWED_TAGS = new Set(['P', 'DIV', 'SPAN', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SUB', 'SUP',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'HR', 'PRE', 'CODE', 'MARK',
    'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'IMG', 'VIDEO', 'AUDIO',
    'CANVAS', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LINK', 'META', 'TITLE', 'HEAD', 'NOSCRIPT',
    'TEMPLATE', 'SOURCE', 'PICTURE']);
const ALLOWED_STYLE_PROPS = new Set(['color', 'background-color', 'font-weight', 'font-style',
    'text-decoration', 'text-decoration-line', 'text-align']);

function cleanStyle(style) {
    const out = [];
    for (const decl of style.split(';')) {
        const i = decl.indexOf(':');
        if (i < 0) continue;
        const prop = decl.slice(0, i).trim().toLowerCase();
        const value = decl.slice(i + 1).trim();
        if (ALLOWED_STYLE_PROPS.has(prop) && /^[#a-z0-9\s(),.%-]+$/i.test(value) &&
            !/url|expression|javascript|import/i.test(value)) {
            out.push(`${prop}: ${value}`);
        }
    }
    return out.join('; ');
}

function sanitizeInto(src, dest) {
    for (const child of Array.from(src.childNodes)) {
        if (child.nodeType === 3) {
            dest.appendChild(document.createTextNode(child.nodeValue));
        } else if (child.nodeType === 1) {
            const tag = child.tagName.toUpperCase();
            if (DROP_TAGS.has(tag)) continue;
            if (!ALLOWED_TAGS.has(tag)) { sanitizeInto(child, dest); continue; } // прибираємо тег, лишаємо текст
            const el = document.createElement(tag.toLowerCase());
            const style = child.getAttribute('style');
            if (style) { const cs = cleanStyle(style); if (cs) el.setAttribute('style', cs); }
            if (tag === 'A') {
                const href = (child.getAttribute('href') || '').trim();
                if (/^(https?:|mailto:)/i.test(href)) {
                    el.setAttribute('href', href);
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'noopener noreferrer');
                }
            }
            if (tag === 'TD' || tag === 'TH') {
                for (const a of ['colspan', 'rowspan']) {
                    const v = child.getAttribute(a);
                    if (v && /^\d{1,2}$/.test(v)) el.setAttribute(a, v);
                }
            }
            sanitizeInto(child, el);
            dest.appendChild(el);
        }
    }
}

// Повертає <div> із безпечною копією переданого HTML.
function sanitizeHtml(html) {
    const body = new DOMParser().parseFromString(String(html), 'text/html').body;
    const out = document.createElement('div');
    sanitizeInto(body, out);
    return out;
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
    const root = linkifyReferences(sanitizeHtml(page.content));
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
        alert('Не вдалося зберегти: сховище браузера заповнене. Видаліть непотрібні сторінки або зробіть експорт.');
        return;
    }
    closeAddDialog();
    loadPage(pages.length - 1);
}

/* ---------- Експорт / імпорт ---------- */
function exportPages() {
    const payload = { app: 'BibleLink', version: 1, exportedAt: new Date().toISOString(), pages };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `biblelink-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importPages(file) {
    file.text().then((txt) => {
        const data = JSON.parse(txt);
        const list = Array.isArray(data) ? data : data.pages;
        if (!Array.isArray(list)) throw new Error('неправильний формат');
        const valid = list.filter(p => p && typeof p.content === 'string').map(p => ({
            title: String(p.title || 'Без назви').slice(0, 60),
            content: sanitizeHtml(p.content).innerHTML
        }));
        if (!valid.length) throw new Error('у файлі немає сторінок');
        if (!confirm(`Додати сторінок: ${valid.length}?`)) return;
        const before = pages.length;
        pages = pages.concat(valid);
        if (!savePages()) {
            pages = pages.slice(0, before);
            alert('Не вистачає місця у сховищі браузера.');
            return;
        }
        loadPage(before);
    }).catch((e) => alert('Не вдалося імпортувати файл: ' + e.message));
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

/* ---------- Версія, service worker ---------- */
function displayVersion() {
    const el = $('app-version');
    if (!el || !window.caches) return;
    caches.match('sw.js').then(r => r && r.text()).then((txt) => {
        const m = txt && txt.match(/bible-app-(v\d+\.\d+)/);
        el.textContent = m ? m[1] : '';
    }).catch(() => {});
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

    $('add-tab-btn').addEventListener('click', openAddDialog);
    $('saveBtn').addEventListener('click', saveNewPage);
    $('cancelBtn').addEventListener('click', closeAddDialog);
    $('timer-toggle').addEventListener('click', toggleTimer);
    $('resetTimerBtn').addEventListener('click', resetTimer);
    $('export-btn').addEventListener('click', exportPages);
    $('import-btn').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) importPages(file);
        e.target.value = '';
    });
    $('app-version').addEventListener('click', resetAppCache);

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
