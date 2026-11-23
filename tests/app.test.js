// Запуск: npm install && npm test   (потрібен jsdom; bibleText.json має лежати в корені проєкту)
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'textPage.js'), 'utf8');
const bible = JSON.parse(fs.readFileSync(path.join(root, 'bibleText.json'), 'utf8'));

async function makeApp(store, touch) {
    const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/' });
    await new Promise(r => dom.window.addEventListener('load', r));
    if (touch) dom.window.matchMedia = (q) => ({ matches: !/hover:\s*hover/.test(q) });
    for (const k in (store || {})) dom.window.localStorage.setItem(k, store[k]);
    dom.window.eval(script + '\nwindow.__bookLookup = bookLookup;');
    return dom.window;
}

let passed = 0, failed = 0;
const queue = [];
function test(name, fn) { queue.push({ name, fn }); }
function section(title) { queue.push({ title }); }
// масиви з jsdom належать іншому realm, тому порівнюємо через JSON
const same = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));

let w;
const refs = (text) => Array.from(w.findReferences(text)).map(r => [r.book, r.chapter, r.verses].join('|'));

section('Розпізнавання посилань');
test('базові форми', () => {
    same(refs('Матвія 5:3'), ['Від Матвія|5|3']);
    same(refs('Буття 1.1'), ['Буття|1|1']);
    same(refs('2Кор 3.4-6'), ['2 до Коринтян|3|4-6']);
    same(refs('Рим. 8:28'), ['До Римлян|8|28']);
});
test('«1Петр 4:11» та «1 Петра 4:11»', () => {
    same(refs('1Петр 4:11'), ['1 Петра|4|11']);
    same(refs('1 Петра 4:11'), ['1 Петра|4|11']);
});
test('«Об\'явлення» з прямим і типографським апострофом', () => {
    same(refs("Об'явлення 21:4").map(x => x.split('|').slice(1).join('|')), ['21|4']);
    same(refs('Об’явлення 21:4').map(x => x.split('|').slice(1).join('|')), ['21|4']);
});
test('списки віршів і довге тире', () => {
    same(refs('Мт 5:3,5'), ['Від Матвія|5|3,5']);
    same(refs('Мт 5:3—5'), ['Від Матвія|5|3-5']);
    same(refs('Мт 5:3-5, 7'), ['Від Матвія|5|3-5,7']);
});
test('немає хибних спрацьовувань', () => {
    same(refs('Я купив як 5 яблук'), []);
    same(refs('Це було об 8 годині'), []);
    same(refs('Це було об 8.30 ранку'), []);
    same(refs('Усіх 3 рази'), []);
});
test('слово-частина не дає Амос (Филип’янам)', () => {
    const r = refs('Филип’янам 4:13');
    assert.ok(r.every(x => !x.startsWith('Амос')), r.join());
});
test('неоднозначні скорочення працюють у формі «Як 5:3»', () => {
    assert.strictEqual(refs('Як 5:16').length, 1);
});

section('DOM: посилання, розділене тегами, та атрибути');
test('<b>Мт</b> 5:3 розпізнається', () => {
    const el = w.document.createElement('div');
    el.innerHTML = '<p><b>Мт</b> 5:3 і ще</p>';
    w.linkifyReferences(el);
    const spans = el.querySelectorAll('.bible-link');
    assert.ok(spans.length >= 1);
    assert.strictEqual(spans[0].dataset.book, 'Від Матвія');
    assert.strictEqual(el.textContent, 'Мт 5:3 і ще');
});
test('атрибути не чіпаються', () => {
    const el = w.document.createElement('div');
    el.innerHTML = '<span title="Ос 5 Мт 5:3" data-x="Пс 23:1">текст</span>';
    w.linkifyReferences(el);
    assert.strictEqual(el.querySelectorAll('.bible-link').length, 0);
    assert.strictEqual(el.firstChild.getAttribute('title'), 'Ос 5 Мт 5:3');
});
test('кілька посилань в одному вузлі', () => {
    const el = w.document.createElement('div');
    el.textContent = 'Пс 23:1 та Ів 3:16 і Рим 8:28';
    w.linkifyReferences(el);
    assert.strictEqual(el.querySelectorAll('.bible-link').length, 3);
    assert.strictEqual(el.textContent, 'Пс 23:1 та Ів 3:16 і Рим 8:28');
});

section('Санітизація');
test('прибирає скрипти, картинки, обробники подій', () => {
    const out = w.sanitizeHtml('<p onclick="x()">Привіт<script>alert(1)</script><img src=x onerror=alert(1)></p>').innerHTML;
    assert.strictEqual(out, '<p>Привіт</p>');
});
test('javascript: у посиланнях блокується, https дозволений', () => {
    assert.ok(!/href/.test(w.sanitizeHtml('<a href="javascript:alert(1)">x</a>').innerHTML));
    assert.ok(/href="https:\/\/a\.b"/.test(w.sanitizeHtml('<a href="https://a.b">x</a>').innerHTML));
});
test('стилі: лишаються кольори, url() прибирається', () => {
    const out = w.sanitizeHtml('<span style="color: red; background: url(x); font-weight: bold; position: fixed">a</span>').innerHTML;
    assert.ok(out.includes('color: red') && out.includes('font-weight: bold'));
    assert.ok(!out.includes('url') && !out.includes('position'));
});
test('назва з тегами не стає розміткою у вкладці', () => {
    w.pages = [];
    const page = { title: '<img src=x onerror=alert(1)>', content: '<p>a</p>' };
    w.eval('pages.push(' + JSON.stringify(page) + ')');
    w.renderTabs();
    assert.strictEqual(w.document.querySelectorAll('#side-tabs img').length, 0);
});

section('Вірші');
test('діапазон, список і розділ', () => {
    assert.strictEqual(w.getVerses('Від Матвія', '5', '3-5').verses.length, 3);
    same(w.getVerses('Від Матвія', '5', '3,5').verses.map(v => v.num), [3, 5]);
    const ch = w.getVerses('Від Матвія', '5', '');
    assert.strictEqual(ch.verses.length, 10);
    assert.strictEqual(ch.more, true);
});
test('усі книги зі словника існують у bibleText.json', () => {
    const books = new Set(Object.keys(bible).map(k => k.replace(/ \d+:\d+$/, '')));
    const used = new Set(Object.values(w.__bookLookup));
    const missing = [...used].filter(b => !books.has(b));
    same(missing, []);
});

section('Таймер');
test('прихований, поки немає сторінок', async () => {
    const a = await makeApp();
    assert.strictEqual(a.document.getElementById('pwa-timer').hidden, true);
});
test('з\'являється після збереження сторінки (Enter) і ховається після видалення останньої', async () => {
    const a = await makeApp();
    a.confirm = () => true;
    a.alert = (m) => { throw new Error(m); };
    const doc = a.document;
    a.openAddDialog();
    doc.getElementById('pageTitle').value = 'Тест';
    doc.getElementById('inputArea').innerHTML = '<p>Мт 5:3</p>';
    const ev = new a.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    doc.getElementById('inputArea').dispatchEvent(ev);
    assert.strictEqual(doc.getElementById('pwa-timer').hidden, false);
    assert.strictEqual(doc.querySelectorAll('.side-tab').length, 1);
    assert.ok(doc.querySelector('#textcontent .bible-link'));
    a.deletePage(0);
    assert.strictEqual(doc.getElementById('pwa-timer').hidden, true);
    assert.strictEqual(doc.querySelectorAll('.side-tab').length, 0);
});
test('Enter з порожнім текстом нічого не зберігає', async () => {
    const a = await makeApp();
    a.openAddDialog();
    a.document.getElementById('inputArea').dispatchEvent(new a.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    assert.strictEqual(a.document.querySelectorAll('.side-tab').length, 0);
    assert.strictEqual(a.document.getElementById('pwa-timer').hidden, true);
});
test('збережені сторінки відкриваються при запуску й показують таймер', async () => {
    const a = await makeApp({ bible_pages: JSON.stringify([{ title: 'A', content: '<p>Ів 3:16</p>' }]) });
    assert.strictEqual(a.document.getElementById('pwa-timer').hidden, false);
    assert.strictEqual(a.document.querySelectorAll('.bible-link').length, 1);
});
test('пошкоджений localStorage не ламає застосунок', async () => {
    const a = await makeApp({ bible_pages: '{зламано' });
    assert.strictEqual(a.document.querySelectorAll('.side-tab').length, 0);
    assert.strictEqual(a.localStorage.getItem('bible_pages_corrupt_backup'), '{зламано');
});
test('тап по посиланню показує підказку з текстом вірша (сенсорний режим)', async () => {
    const a = await makeApp({ bible_pages: JSON.stringify([{ title: 'A', content: '<p>Ів 3:16</p>' }]) }, true);
    a.setBibleData(bible);
    a.document.querySelector('.bible-link').dispatchEvent(new a.MouseEvent('click', { bubbles: true }));
    const tip = a.document.getElementById('bible-tooltip');
    assert.ok(tip && tip.textContent.length > 20);
});

test('наведення миші показує й ховає підказку (режим з мишею)', async () => {
    const a = await makeApp({ bible_pages: JSON.stringify([{ title: 'A', content: '<p>Ів 3:16</p>' }]) });
    a.setBibleData(bible);
    const link = a.document.querySelector('.bible-link');
    link.dispatchEvent(new a.MouseEvent('mouseover', { bubbles: true }));
    assert.ok(a.document.getElementById('bible-tooltip'));
    link.dispatchEvent(new a.MouseEvent('mouseout', { bubbles: true }));
    assert.strictEqual(a.document.getElementById('bible-tooltip'), null);
});
test('після багатьох перемикань вкладок слухачі не накопичуються', async () => {
    const pages = [1, 2, 3].map(i => ({ title: 'P' + i, content: '<p>Ів 3:16</p>' }));
    const a = await makeApp({ bible_pages: JSON.stringify(pages) });
    a.setBibleData(bible);
    for (let i = 0; i < 20; i++) a.loadPage(i % 3);
    let shown = 0;
    const origCreate = a.document.createElement.bind(a.document);
    a.document.createElement = (t) => { if (t === 'div') shown++; return origCreate(t); };
    a.document.querySelector('.bible-link').dispatchEvent(new a.MouseEvent('mouseover', { bubbles: true }));
    assert.strictEqual(shown, 1, 'підказка створена ' + shown + ' разів');
});

(async () => {
    w = await makeApp();
    w.setBibleData(bible);
    for (const item of queue) {
        if (item.title) { console.log(item.title); continue; }
        try { await item.fn(); passed++; console.log('  ok   ' + item.name); }
        catch (e) { failed++; console.log('  FAIL ' + item.name + '\n       ' + e.message); }
    }
    console.log(`\nПройшло: ${passed}, не пройшло: ${failed}`);
    process.exit(failed ? 1 : 0);
})();
