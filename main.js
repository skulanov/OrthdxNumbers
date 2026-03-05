class ChurchSlavonicNumbersApp {
    constructor() {
        this.units = [
            { s: 'а', v: 1 }, { s: 'в', v: 2 }, { s: 'г', v: 3 }, { s: 'д', v: 4 },
            { s: 'є', v: 5 }, { s: 'ѕ', v: 6 }, { s: 'з', v: 7 }, { s: 'и', v: 8 }, { s: 'ѳ', v: 9 }
        ];
        this.tens = [
            { s: 'і', v: 10 }, { s: 'к', v: 20 }, { s: 'л', v: 30 }, { s: 'м', v: 40 },
            { s: 'н', v: 50 }, { s: 'ѯ', v: 60 }, { s: 'о', v: 70 }, { s: 'п', v: 80 }, { s: 'ч', v: 90 }
        ];
        this.hundreds = [
            { s: 'р', v: 100 }, { s: 'с', v: 200 }, { s: 'т', v: 300 }, { s: 'у', v: 400 },
            { s: 'ф', v: 500 }, { s: 'х', v: 600 }, { s: 'ѱ', v: 700 }, { s: 'ѿ', v: 800 }, { s: 'ц', v: 900 }
        ];

        this.currentMode = 1;
        this.rememberedCount = 0;
        this.queue = [];
        this.currentIndex = 0;
        this.isRevealed = false;

        this.slavDisplay = document.getElementById('numberSlav');
        this.arabDisplay = document.getElementById('numberArab');
        this.flashcard = document.getElementById('flashcard');
        this.rememberBtn = document.getElementById('rememberBtn');
        this.mode1Btn = document.getElementById('mode1Btn');
        this.mode2Btn = document.getElementById('mode2Btn');

        this.init();
    }

    init() {
        this.mode1Btn.addEventListener('click', () => this.switchMode(1));
        this.mode2Btn.addEventListener('click', () => this.switchMode(2));
        this.flashcard.addEventListener('click', () => this.toggleReveal());
        this.rememberBtn.addEventListener('click', () => this.markAsRemembered());

        this.generateQueue();
        this.displayCurrent();
    }

toSlavonic(num) {
    let res = "";
    let n = num;

    // 1. Собираем строку из букв
    // Тысячи
    if (n >= 1000) {
        let th = Math.floor(n / 1000);
        res += "҂" + this.units.find(u => u.v === th).s;
        n %= 1000;
    }
    // Сотни
    if (n >= 100) {
        res += this.hundreds.find(h => h.v === Math.floor(n / 100) * 100).s;
        n %= 100;
    }
    // 11-19 (особый случай: единицы перед десяткой)
    if (n > 10 && n < 20) {
        res += this.units.find(u => u.v === (n % 10)).s + "і";
    } else {
        // Десятки
        if (n >= 10) {
            res += this.tens.find(t => t.v === Math.floor(n / 10) * 10).s;
            n %= 10;
        }
        // Единицы
        if (n > 0) {
            res += this.units.find(u => u.v === n).s;
        }
    }

    // 2. Логика постановки ТИТЛО над ПЕРВОЙ буквой
    // Если строка начинается с знака тысячи ҂ (длина 2 байта в строке), 
    // ставим титло после второй позиции (над буквой после знака).
    // В остальных случаях - после первой позиции.
    
    if (res.startsWith("҂")) {
        // Пример: ҂а... -> ҂а҃...
        return res.slice(0, 2) + "\u0483" + res.slice(2);
    } else {
        // Пример: рпв -> р҃пв
        return res.slice(0, 1) + "\u0483" + res.slice(1);
    }
}

generateQueue() {
    if (this.currentMode === 1) {
        // Для одиночных букв титло всегда над ними
        this.queue = [...this.units, ...this.tens, ...this.hundreds].map(item => ({
            slav: item.s + "\u0483",
            arab: item.v
        }));
    } else {
        this.queue = [];
        // Генерируем набор случайных составных чисел
        for (let i = 0; i < 30; i++) {
            let val = Math.floor(Math.random() * 2988) + 11;
            this.queue.push({ 
                slav: this.toSlavonic(val), 
                arab: val 
            });
        }
    }
    this.queue.sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
}
    switchMode(mode) {
        this.currentMode = mode;
        this.mode1Btn.classList.toggle('active', mode === 1);
        this.mode2Btn.classList.toggle('active', mode === 2);
        this.rememberedCount = 0;
        this.updateRememberBtn();
        this.generateQueue();
        this.displayCurrent();
    }

    displayCurrent() {
        if (this.currentIndex >= this.queue.length) this.generateQueue();
        const item = this.queue[this.currentIndex];
        this.slavDisplay.textContent = item.slav;
        this.arabDisplay.textContent = item.arab;
        this.isRevealed = false;
        this.arabDisplay.classList.remove('show');
    }

    toggleReveal() {
        if (!this.isRevealed) {
            this.arabDisplay.classList.add('show');
            this.isRevealed = true;
        } else {
            this.nextCard();
        }
    }

    nextCard() {
        this.currentIndex++;
        this.displayCurrent();
    }

    markAsRemembered() {
        this.rememberedCount++;
        this.updateRememberBtn();
        this.nextCard();
    }

    updateRememberBtn() {
        this.rememberBtn.textContent = this.rememberedCount > 0 ? `Помню ${this.rememberedCount}` : "Помню";
    }
}

document.addEventListener('DOMContentLoaded', () => new ChurchSlavonicNumbersApp());