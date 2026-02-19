// Ініціалізація даних
let bibleData = {};
let tooltip = null;
let currentPageIndex = null;
let pages = JSON.parse(localStorage.getItem("bible_pages")) || [];

// Словник скорочень (переконайтеся, що він у вас є в коді або окремому файлі)
const bookNameMap = {
    "Бут": "Буття", "Буття": "Буття",
    "Вих": "Вихід", "Вихід": "Вихід",
    "Лев": "Левит", "Левит": "Левит",
    "Чис": "Числа", "Числа": "Числа",
    "Повт": "Повторення Закону", "Повторення": "Повторення Закону",
    "ІсН": "Ісус Навин", "Нав": "Ісус Навин",
    "Суд": "Судді", "Суддів": "Судді",
    "Рут": "Рут", "Рути": "Рут",
    "1Сам": "1 Самуїлова", "1Самуїлова": "1 Самуїлова", "1 Сам": "1 Самуїлова",
    "2Сам": "2 Самуїлова", "2Самуїлова": "2 Самуїлова", "2 Сам": "2 Самуїлова",
    "1Цар": "1 Царів", "1Царів": "1 Царів", "1 Цар": "1 Царів",
    "2Цар": "2 Царів", "2Царів": "2 Царів", "2 Цар": "2 Царів",
    "1Хр": "1 Хронік", "1Хронік": "1 Хронік", "1 Хр": "1 Хронік",
    "2Хр": "2 Хронік", "2Хронік": "2 Хронік", "2 Хр": "2 Хронік",
    "Езд": "Ездра", "Ездри": "Ездра",
    "Неем": "Неемія", "Неемії": "Неемія",
    "Ест": "Естер", "Естери": "Естер",
    "Йов": "Йов", "Йова": "Йов",
    "Пс": "Псалми", "Псалом": "Псалми", "Псалми": "Псалми",
    "Прип": "Приповісті", "Приповістей": "Приповісті",
    "Еккл": "Екклезіаст", "Екклезіяст": "Екклезіаст",
    "Пісн": "Пісня Пісень", "Пісня": "Пісня Пісень",
    "Іс": "Ісая", "Ісаї": "Ісая",
    "Єр": "Єремія", "Єремії": "Єремія",
    "Плач": "Плач Єремії", "Плач": "Плач Єремії",
    "Єзк": "Єзекіїль", "Єзекіїля": "Єзекіїль",
    "Дан": "Даниїл", "Даниїла": "Даниїл",
    "Ос": "Осія", "Осії": "Осія",
    "Йоіл": "Йоіл", "Йоіла": "Йоіл",
    "Ам": "Амос", "Амоса": "Амос",
    "Ов": "Овдій", "Овд": "Овдій",
    "Йона": "Йона", "Йони": "Йона",
    "Мих": "Михей", "Михея": "Михей",
    "Наум": "Наум", "Наума": "Наум",
    "Авк": "Авакум", "Авакума": "Авакум",
    "Соф": "Софонія", "Софонії": "Софонія",
    "Ог": "Огій", "Огія": "Огій",
    "Зах": "Захарія", "Захарії": "Захарія",
    "Мал": "Малахія", "Малахії": "Малахія",
    "Мат": "Від Матвія", "Матвія": "Від Матвія", "Мт": "Від Матвія", "Мф": "Від Матвія",
    "Мар": "Від Марка", "Марка": "Від Марка", "Мр": "Від Марка", "Марк": "Від Марка",
    "Лук": "Від Луки", "Луки": "Від Луки", "Лк": "Від Луки",
    "Ів": "Від Івана", "Івана": "Від Івана",
    "Дії": "Дії Апостолів", "Дії": "Дії Апостолів",
    "Рим": "До Римлян", "Римлянам": "До Римлян",
    "1Кор": "1 до Коринтян", "1Коринтянам": "1 до Коринтян", "1 Кор": "1 до Коринтян",
    "2Кор": "2 до Коринтян", "2Коринтянам": "2 до Коринтян", "2 Кор": "2 до Коринтян",
    "Гал": "До Галатів", "Галатів": "До Галатів",
    "Еф": "До Ефесян", "Ефесянам": "До Ефесян",
    "Фил": "До Филип'ян", "Филип'янам": "До Филип'ян",
    "Кол": "До Колосян", "Колосянам": "До Колосян",
    "1Сол": "1 до Солунян", "1Солунянам": "1 до Солунян", "1 Сол": "1 до Солунян",
    "2Сол": "2 до Солунян", "2Солунянам": "2 до Солунян", "2 Сол": "2 до Солунян",
    "1Тим": "1 до Тимофія", "1Тимофію": "1 до Тимофія", "1 Тим": "1 до Тимофія",
    "2Тим": "2 до Тимофія", "2Тимофію": "2 до Тимофія", "2 Тим": "2 до Тимофія",
    "Тит": "До Тита", "Титу": "До Тита",
    "Флм": "До Филимона", "Филимону": "До Филимона",
    "Євр": "До Євреїв", "Євреям": "До Євреїв",
    "Як": "Якова", "Якова": "Якова",
    "1Пет": "1 Петра", "1Петра": "1 Петра", "1 Пет": "1 Петра",
    "2Пет": "2 Петра", "2Петра": "2 Петра", "2 Пет": "2 Петра",
    "1Ів": "1 Івана", "1Івана": "1 Івана", "1 Ів": "1 Івана",
    "2Ів": "2 Івана", "2 Івана": "2 Івана", "2 Ів": "2 Івана",
    "3Ів": "3 Івана", "3Івана": "3 Івана", "3 Ів": "3 Івана",
    "Юди": "Юди", "Юд": "Юди",
    "Об": "Об'явлення", "Об'яв": "Об'явлення", "Одкр": "Об'явлення", "Об'явлення": "Об'явлення"
};

fetch('bibleText.json')
    .then(r => r.json())
    .then(data => {
        bibleData = data;
        renderTabs();
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
    let txt = html.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');
    const regex = /(\d?\s?[А-Яа-яІЇЄҐ][а-яіїєґ']{0,15}\.?)\s*(\d+)(?:\s*[\:\.]\s*(\d+(?:\s*[,\-\–]\s*\d+)*))?/g;

    return txt.replace(regex, function(match, book, ch, vs) {
        const cleanBook = book.trim().replace(/\.$/, "");
        const fullBook = bookNameMap[cleanBook];
        if (!fullBook) return match;

        return `<span class="bible-link" 
                data-book="${fullBook}" 
                data-chapter="${ch}" 
                data-verses="${vs || '1'}"
                style="color: blue !important; cursor: pointer !important;">${match}</span>`;
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

    // 1. Автоматична назва (Пункт 2 з минулого запиту)
    if (!title) {
        title = "Урок " + (pages.length + 1);
    }

    // 2. Додаємо в масив
    pages.push({ title: title, content: content });

    // 3. ГОЛОВНЕ: Зберігаємо в пам'ять браузера
    // Перевірте, як саме називається ваш ключ (зазвичай 'bible_pages' або 'pages')
    localStorage.setItem('bible_pages', JSON.stringify(pages));

    // 4. Оновлюємо інтерфейс
    renderTabs();
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
            if (bibleData[ref]) result.push(`<b>${i}</b> ${bibleData[ref]}`);
        }
    } else {
        verseNumbers.forEach(v => {
            const ref = `${book} ${chapter}:${v}`;
            if (bibleData[ref]) result.push(`<b>${v}</b> ${bibleData[ref]}`);
        });
    }
    return result.length > 0 ? result.join('<br>') : null;
}

function showTooltip(event, text) {
    hideTooltip();
    tooltip = document.createElement('div');
    // Повернуто ваші точні налаштування стилів та розміру 22px
    tooltip.style.cssText = `
        position: absolute; background: #ffffff; border: 1px solid #8b4513; 
        padding: 15px; z-index: 10000; font-size: 22px; max-width: 550px; 
        border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        color: #2c3e50; line-height: 1.5; pointer-events: none;
    `;
    tooltip.innerHTML = text;
    document.body.appendChild(tooltip);
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
}

function hideTooltip() {
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
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
