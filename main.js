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
        // Используем Set для хранения уникальных выученных ID в этой сессии
        this.learnedIds = new Set(); 
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

    // Перевод числа в текст с титло над первой буквой
    toSlavonic(num) {
        let res = "";
        let n = num;

        if (n >= 1000) {
            let th = Math.floor(n / 1000);
            res += "҂" + this.units.find(u => u.v === th).s;
            n %= 1000;
        }
        if (n >= 100) {
            res += this.hundreds.find(h => h.v === Math.floor(n / 100) * 100).s;
            n %= 100;
        }
        if (n > 10 && n < 20) {
            res += this.units.find(u => u.v === (n % 10)).s + "і";
        } else {
            if (n >= 10) {
                res += this.tens.find(t => t.v === Math.floor(n / 10) * 10).s;
                n %= 10;
            }
            if (n > 0) res += this.units.find(u => u.v === n).s;
        }

        // Титло \u0483 над первой буквой (после знака тысячи, если он есть)
        if (res.startsWith("҂")) {
            return res.slice(0, 2) + "\u0483" + res.slice(2);
        } else {
            return res.slice(0, 1) + "\u0483" + res.slice(1);
        }
    }

    generateQueue() {
        if (this.currentMode === 1) {
            // Режим букв: берем все 27 знаков, но фильтруем те, что уже в learnedIds
            const allPossible = [...this.units, ...this.tens, ...this.hundreds];
            this.queue = allPossible
                .filter(item => !this.learnedIds.has(`m1_${item.v}`))
                .map(item => ({
                    slav: item.s + "\u0483",
                    arab: item.v,
                    id: `m1_${item.v}`
                }));
        } else {
            // Режим составных: генерируем 20 случайных чисел, которых нет в выученных
            this.queue = [];
            let attempts = 0;
            while (this.queue.length < 20 && attempts < 100) {
                let val = Math.floor(Math.random() * 2988) + 11;
                let id = `m2_${val}`;
                if (!this.learnedIds.has(id)) {
                    this.queue.push({ slav: this.toSlavonic(val), arab: val, id: id });
                }
                attempts++;
            }
        }

        // Перемешиваем
        this.queue.sort(() => Math.random() - 0.5);
        this.currentIndex = 0;
    }

    displayCurrent() {
        // Если очередь пуста (все выучено), показываем поздравление
        if (this.queue.length === 0) {
            this.slavDisplay.textContent = "🎉";
            this.arabDisplay.textContent = "Все выучено!";
            this.arabDisplay.classList.add('show');
            return;
        }

        const item = this.queue[this.currentIndex];
        this.slavDisplay.textContent = item.slav;
        this.arabDisplay.textContent = item.arab;
        this.isRevealed = false;
        this.arabDisplay.classList.remove('show');
    }

    toggleReveal() {
        if (this.queue.length === 0) return;
        if (!this.isRevealed) {
            this.arabDisplay.classList.add('show');
            this.isRevealed = true;
        } else {
            this.nextCard();
        }
    }

    nextCard() {
        if (this.queue.length === 0) return;
        this.currentIndex++;
        if (this.currentIndex >= this.queue.length) {
            this.generateQueue();
        }
        this.displayCurrent();
    }

    markAsRemembered() {
        if (this.queue.length === 0) return;
        
        const currentItem = this.queue[this.currentIndex];
        
        // 1. Добавляем в список выученных
        this.learnedIds.add(currentItem.id);
        
        // 2. Обновляем текст кнопки (счётчик)
        this.updateRememberBtn();
        
        // 3. Удаляем элемент из текущей очереди, чтобы он не попался до конца круга
        this.queue.splice(this.currentIndex, 1);
        
        // 4. Проверяем, не пуста ли очередь после удаления
        if (this.queue.length === 0) {
            this.generateQueue();
        } else {
            // Если в очереди что-то осталось, индекс может выйти за границы, 
            // поэтому сбрасываем или оставляем текущий (следующий элемент подтянется сам)
            if (this.currentIndex >= this.queue.length) {
                this.currentIndex = 0;
            }
        }
        
        this.displayCurrent();
    }

    updateRememberBtn() {
        const count = this.learnedIds.size;
        this.rememberBtn.textContent = count > 0 ? `Помню ${count}` : "Помню";
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.mode1Btn.classList.toggle('active', mode === 1);
        this.mode2Btn.classList.toggle('active', mode === 2);
        // При смене режима обнуляем выученное? 
        // Обычно в таких приложениях лучше обнулять, чтобы начать тренировку нового режима с нуля.
        this.learnedIds.clear(); 
        this.updateRememberBtn();
        this.generateQueue();
        this.displayCurrent();
    }
}

document.addEventListener('DOMContentLoaded', () => new ChurchSlavonicNumbersApp());
