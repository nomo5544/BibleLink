// Ініціалізація даних
let bibleData = {};
let tooltip = null;
let currentPageIndex = null;
let pages = JSON.parse(localStorage.getItem("bible_pages")) || [];

// Словник скорочень (переконайтеся, що він у вас є в коді або окремому файлі)
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
        "неем": "Неемія", "неемії": "Неемія", "неемія": "Неемія",
        "ест": "Естер", "Естер": "Естер",
        "йов": "Йов", "йова": "Йов",
        "пс": "Псалми", "псалом": "Псалми", "псалми": "Псалми", "псалтир": "Псалми","псалм": "Псалми",
        "прип": "Приповісті", "приповістей": "Приповісті", "приповісті": "Приповісті",
        "еккл": "Екклезіяст", "екклезіяст": "Екклезіяст", "екклезіаст": "Екклезіяст",
        "пісн": "Пісня Над Піснями", "пісня": "Пісня Над Піснями", "Пісня Над Піснями": "Пісня Над Піснями",
        "іс": "Ісая", "ісаї": "Ісая", "ісая": "Ісая",
        "єр": "Єремія", "єремії": "Єремія", "єремія": "Єремія",
        "плач": "Плач Єремії", "плач": "Плач Єремії", "плач єремії": "Плач Єремії",
        "єзк": "Єзекіїль", "єзекіїля": "Єзекіїль", "єзекіїль": "Єзекіїль", "єзек": "Єзекіїль", "єз": "Єзекіїль",
        "дан": "Даниїл", "даниїла": "Даниїл",  "даниїл": "Даниїл",
        "ос": "Осія", "осії": "Осія", "осія": "Осія",
        "йоіл": "Йоїл", "йоіла": "Йоїл", "йоіл": "Йоїл", "йоїл": "Йоїл",
        "ам": "Амос", "амоса": "Амос", "амос": "Амос",
        "ов": "Овадія", "овд": "Овадія", "овдій": "Овадія", "овадія": "Овадія",
        "йона": "Йона", "йони": "Йона", "йона": "Йона", "іона": "Йона",
        "мих": "Михей", "михея": "Михей", "михей": "Михей",
        "наум": "Наум", "наума": "Наум", "наум": "Наум",
        "авк": "Авакум", "авакума": "Авакум", "авакум": "Авакум", "авак": "Авакум", "аввакум": "Авакум", "ав": "Авакум",
        "соф": "Софонія", "софонії": "Софонія", "софонія": "Софонія",
        "ог": "Огій", "огія": "Огій", "огій": "Огій",
        "зах": "Захарія", "захарії": "Захарія", "захарія": "Захарія",
        "мал": "Малахія", "малахії": "Малахія", "малахія": "Малахія",
        "мат": "Від Матвія", "матвія": "Від Матвія", "мт": "Від Матвія", "мф": "Від Матвія", "від матвія": "Від Матвія",
        "мар": "Від Марка", "марка": "Від Марка", "мр": "Від Марка", "марк": "Від Марка", "від марка": "Від Марка", "мк": "Від Марка",
        "лук": "Від Луки", "луки": "Від Луки", "лк": "Від Луки", "від луки": "Від Луки",
        "ів": "Від Івана", "івана": "Від Івана","від івана": "Від Івана","іван": "Від Івана",
        "дії": "Дії Апостолів", "Дії": "Дії Апостолів", "Дії апостолів": "Дії Апостолів",
        "рим": "До Римлян", "римлянам": "До Римлян", "до римлян": "До Римлян", "римлян": "До Римлян", "До римлян": "До Римлян",
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

renderTabs();

fetch('bibleText.json')
    .then(r => r.json())
    .then(data => {
        bibleData = data;
        
        if (pages.length > 0) loadPage(0);
    })
    .catch(err => console.error("Помилка завантаження бази:", err));

function renderTabs() {
    const container = document.getElementById("side-tabs");
    if (!container) return;

    const tabsHtml = pages.map((page, index) => `
        <div class="side-tab ${currentPageIndex === index ? 'active' : ''}" onclick="loadPage(${index})">
            <span class="delete-tab" onclick="deletePage(event, ${index})">✕</span>
            ${page.title}
        </div>
    `).join('');

    const addBtn = `<button class="add-tab-btn" onclick="openAddDialog()">+</button>`;
    container.innerHTML = tabsHtml + addBtn;
}

function loadPage(index) {
    currentPageIndex = index;
    const page = pages[index];
    const contentDiv = document.getElementById("textcontent");
    
    if (page && contentDiv) {
        contentDiv.innerHTML = processText(page.content);
        setupEventListeners(contentDiv);
    }
    renderTabs();
}

function processText(html) {
    if (!html) return "";

    // 1. Очищення пробілів (як у вашому розширенні)
    let cleanHtml = html.replace(/&nbsp;/g, ' ').replace(/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, ' ');

    // 2. Створення гнучкої карти (flexibleMap)
    const flexibleMap = {};
    for (let key in bookNameMap) {
        const normKey = key.toLowerCase().replace(/\s+/g, '').replace(/\.$/, "");
        flexibleMap[normKey] = bookNameMap[key];
    }

    // 3. Динамічний Regex (саме він у розширенні працює краще)
    const sortedKeys = Object.keys(bookNameMap).sort((a, b) => b.length - a.length);
    const booksPattern = sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const bibleRegex = new RegExp(`(${booksPattern})\\.?\\s+(\\d+)(?:[\\:\\.]\\s*(\\d+(?:(?:\\s*[\\-\\–]\\s*)\\d+)*))?`, 'gi');

    // 4. Заміна (чистий код без примусових стилів, все через CSS)
    return cleanHtml.replace(bibleRegex, function (fullMatch, bookPart, chapter, versesStr) {
        const cleanBookKey = bookPart.trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, "");
        const fullBookName = flexibleMap[cleanBookKey];
        
        if (!fullBookName) return fullMatch;

        let cleanVerses = versesStr || "1";
        return `<span class="bible-link" data-book="${fullBookName}" data-chapter="${chapter}" data-verses="${cleanVerses}">${fullMatch}</span>`;
    });
}

function openAddDialog() {
    document.getElementById('addDialog').style.display = 'flex';
    document.getElementById('pageTitle').value = ''; // Очистити назву
    document.getElementById('inputArea').innerHTML = ''; // Очистити текст
    
    // ПУНКТ 3: Фокус на полі вводу тексту при відкритті
    setTimeout(() => {
        document.getElementById('inputArea').focus();
    }, 100);
}

function closeAddDialog() {
    document.getElementById("addDialog").style.display = "none";
    document.getElementById("pageTitle").value = "";
    document.getElementById("inputArea").innerHTML = "";
}

function saveNewPage() {
    let title = document.getElementById('pageTitle').value.trim();
    const content = document.getElementById('inputArea').innerHTML;

    if (!title) {
        title = "Урок " + (pages.length + 1);
    }

    // 1. Додаємо нову сторінку в масив
    pages.push({ title: title, content: content });

    // 2. Зберігаємо оновлений список у пам'ять
    localStorage.setItem('bible_pages', JSON.stringify(pages));

    // 3. РОБИМО НОВУ СТОРІНКУ АКТИВНОЮ
    // Індекс нової сторінки — це останній елемент масиву (довжина масиву мінус 1)
    currentPageIndex = pages.length - 1;

    // 4. Оновлюємо інтерфейс
    renderTabs();
    
    // 5. Одразу завантажуємо вміст нової сторінки
    loadPage(currentPageIndex);

    // 6. Закриваємо вікно
    closeAddDialog();
}
function deletePage(e, index) {
    e.stopPropagation();
    if (confirm(`Видалити сторінку "${pages[index].title}"?`)) {
        pages.splice(index, 1);
        localStorage.setItem("bible_pages", JSON.stringify(pages));
        if (currentPageIndex === index) currentPageIndex = null;
        renderTabs();
        location.reload(); 
    }
}

// --- ПОВЕРНЕНО ВАШІ ОРИГІНАЛЬНІ ФУНКЦІЇ ТУЛТІПІВ ТА ПОДІЙ ---

function setupEventListeners(container) {
    container.addEventListener('mouseover', (e) => {
        const link = e.target.closest('.bible-link');
        if (link) {
            const book = link.getAttribute('data-book');
            const chapter = link.getAttribute('data-chapter');
            const versesStr = link.getAttribute('data-verses');
            const combinedText = getCombinedText(book, chapter, versesStr);
            if (combinedText) showTooltip(e, combinedText);
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (tooltip) {
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
        }
    });

    container.addEventListener('mouseout', (e) => {
        if (e.target.closest('.bible-link')) {
            hideTooltip();
        }
    });
}

function getCombinedText(book, chapter, versesStr) {
    const verseNumbers = versesStr.match(/\d+/g);
    if (!verseNumbers) return null;

    let result = [];
    if (versesStr.includes('-') || versesStr.includes('–')) {
        const start = parseInt(verseNumbers[0]);
        const end = parseInt(verseNumbers[verseNumbers.length - 1]);
        for (let i = start; i <= end; i++) {
            const ref = `${book} ${chapter}:${i}`;
            // ЗАМІНЕНО: прибрано <b>, залишено тільки span
            if (bibleData[ref]) result.push(`<span class="verse-num">${i}</span> ${bibleData[ref]}`);
        }
    } else {
        verseNumbers.forEach(v => {
            const ref = `${book} ${chapter}:${v}`;
            // ЗАМІНЕНО: прибрано <b>, залишено тільки span
            if (bibleData[ref]) result.push(`<span class="verse-num">${v}</span> ${bibleData[ref]}`);
        });
    }
    return result.length > 0 ? result.join('<br>') : null;
}

function showTooltip(event, text) {
    let tooltip = document.getElementById('bible-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'bible-tooltip';
        tooltip.className = 'bible-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = text;
    
    // Координати (залишаємо вашу логіку)
    const rect = event.target.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    let top = rect.top + window.scrollY - 10; // Тимчасова точка

    // Встановлюємо позицію ПЕРЕД додаванням класу show
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    // ПЕРЕВІРКА МЕЖ ЕКРАНУ (ваша логіка...)
    if (left + tooltip.offsetWidth > window.innerWidth) {
        left = window.innerWidth - tooltip.offsetWidth - 20;
    }
    if (left < 10) left = 10;
    if (rect.top < tooltip.offsetHeight + 20) {
        top = rect.bottom + window.scrollY + 10;
    } else {
        top = rect.top + window.scrollY - tooltip.offsetHeight - 10;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    // Вмикаємо плавну появу
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

function hideTooltip() {
    const tooltip = document.getElementById('bible-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
}
// Додаємо слухача подій на обидва поля
document.getElementById('pageTitle').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Щоб не було зайвих переходів
        saveNewPage();
    }
});

document.getElementById('inputArea').addEventListener('keydown', function(e) {
    // Якщо натиснуто Enter БЕЗ Shift — зберігаємо
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        saveNewPage();
    }
});
