
const FIRSTNAME_INDEX = 0;
const NAME_INDEX = 1;
const START_ROW = 1;



class QuestionItem extends HTMLElement {

    constructor() {
        super();
        this.appendChild(this.render());
        this.classList.add('question')
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <input type="checkbox" class="question__question-checkbox">
            <div class="question__question-title"></div>
            <span class="question__question-total"></span>
        `;
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        const checkbox = this.querySelector('input');
        const label = this.querySelector('.question__question-title');
        const score = this.querySelector('.question__question-total');

        label.textContent = this.dataset.text;
        score.textContent = this.dataset.points;

        this.addEventListener('click', (e) => {

            if (e.target === checkbox) return;

            checkbox.checked = !checkbox.checked;

            this.dispatchEvent(new CustomEvent('score-change', { bubbles: true }));
        });

        checkbox.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('score-change', { bubbles: true }));
        });
    }

    getScore() {
        const checkbox = this.querySelector('input');
        return checkbox.checked ? parseInt(this.dataset.points) : 0;
    }
}

customElements.define('question-item', QuestionItem);

class SectionBloc extends HTMLElement {

    constructor() {
        super();
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="section__section-title"> 
                <div class="section__section-title__title-text"></div>
                <div class="section__section-title__max-score"></div>
                <div class="section__section-title__section-total">0</div>
            </div>
            <div class="section__questions"></div>
        `;
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.appendChild(this.render());
        this.classList.add('section');
        this.querySelector('.section__section-title__title-text').textContent = this.dataset.title;
        this.querySelector('.section__section-title__max-score').textContent = `(Max: ${this.dataset.maxScore})`;
        this.addEventListener('score-change', () => {
            this.updateScore();
        });
    }

    addQuestion(question) {
        this.querySelector('.section__questions').appendChild(question);
    }

    updateScore() {
        const questions = this.querySelectorAll('question-item');
        let total = 0;

        questions.forEach(q => total += q.getScore());

        const max = parseInt(this.dataset.maxScore || 999);
        total = Math.min(total, max);

        this.querySelector('.section__section-title__section-total').textContent = total;
        return total;
    }

    getScore() {
        return parseInt(this.querySelector('.section__section-title__section-total').textContent);
    }
}

customElements.define('section-bloc', SectionBloc);

class SuperSectionBloc extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let template = document.createElement('template');
        template.innerHTML = `
        <div class="super-section__title-bloc">
          <div class="super-section__title-bloc__title">
            ${this.dataset.title}
          </div>
          <div class="super-section__title-bloc__total"></div>
        </div>
        <textarea class="super-section__comment" placeholder="commentaire"></textarea>
        <div class="super-section__sections-pane"></div>
        `
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.appendChild(this.render());
        this.classList.add('super-section-bloc')

        this.addEventListener('score-change', () => {
            this.updateScore();
        });

    }

    addSection(section) {
        this.querySelector('.super-section__sections-pane').appendChild(section);
    }

    updateScore() {
        const sections = this.querySelectorAll('section-bloc');
        let total = 0;
        sections.forEach(s => total += s.getScore());
        this.querySelector('.super-section__title-bloc__total').textContent = total;
        return total;
    }
}

customElements.define('super-section-bloc', SuperSectionBloc);



class FormHandler {

    constructor() {
        this.container = document.getElementById('formContainer');
        this.updateTotalScore();
    }

    setupSectionHighlighting() {

        const sections = [
            ...document.querySelectorAll('.super-section-bloc'),
            ...document.querySelectorAll('.section')
        ];

        const navElements = document.querySelectorAll(
            '.navigation-container__navigation-element'
        );

        const navMap = new Map();

        navElements.forEach(nav => {

            if (nav.dataset.sectionIndex) {
                navMap.set(`section${nav.dataset.sectionIndex}`, nav);
            }

            if (nav.dataset.superSectionIndex) {
                navMap.set(`superSection${nav.dataset.superSectionIndex}`, nav);
            }

        });

        const visibleSections = new Set();

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    visibleSections.add(entry.target);
                } else {
                    visibleSections.delete(entry.target);
                }

            });

            updateActiveSection();

        }, {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));

        function updateActiveSection() {

            if (visibleSections.size === 0) return;

            let topSection = null;
            let topOffset = Infinity;

            visibleSections.forEach(section => {

                const rect = section.getBoundingClientRect();

                if (rect.top >= 0 && rect.top < topOffset) {
                    topOffset = rect.top;
                    topSection = section;
                }

            });

            if (!topSection) return;

            const navMatch = navMap.get(topSection.id);

            if (!navMatch) return;

            navElements.forEach(n => n.classList.remove('active'));
            navMatch.classList.add('active');

            navMatch.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });

        }

    }

    clearForm() {
        this.container.innerHTML = '';
        document.querySelector('.total-box__current-score').textContent = 0;
    }

    renderForm(data) {

        const caseName = document.createElement('div');
        caseName.className = "case-name";
        caseName.innerText = `${data.title}`;
        this.container.appendChild(caseName);

        let superSectionIndex = 0;
        let sectionIndex = 0;
        const superSections = data.superSections || [{ title: null, sections: data.sections }];

        superSections.forEach(superSection => {

            const superSectionBloc = document.createElement('super-section-bloc');
            superSectionBloc.dataset.title = superSection.title;
            superSectionBloc.id = `superSection${superSectionIndex}`;
            this.container.appendChild(superSectionBloc);

            if (superSection.title) {

                const superSectionNav = document.createElement('div');
                superSectionNav.innerText = superSection.title;
                superSectionNav.className = 'navigation-container__navigation-element navigation-container__navigation-element--supersection';
                superSectionNav.dataset.superSectionIndex = superSectionIndex;
                superSectionNav.addEventListener('click', function () {
                    document.getElementById(`superSection${this.dataset.superSectionIndex}`).scrollIntoView();
                })
                document.querySelector('.navigation-container').appendChild(superSectionNav)
            }

            superSectionIndex++;


            superSection.sections.forEach(section => {
                const sectionEl = document.createElement('section-bloc');
                sectionEl.dataset.maxScore = parseInt(section.maxScore);
                sectionEl.dataset.title = section.title;
                sectionEl.id = `section${sectionIndex}`;

                const sectionNav = document.createElement('div');
                sectionNav.innerText = section.title;
                sectionNav.className = 'navigation-container__navigation-element navigation-container__navigation-element--section';
                sectionNav.dataset.sectionIndex = sectionIndex;
                sectionNav.addEventListener('click', function () {
                    document.getElementById(`section${this.dataset.sectionIndex}`).scrollIntoView();
                })

                document.querySelector('.navigation-container').appendChild(sectionNav)
                superSectionBloc.addSection(sectionEl);

                sectionIndex++;

                section.questions.forEach(question => {
                    const item = new QuestionItem();
                    item.dataset.text = question.text;
                    item.dataset.points = question.points;
                    sectionEl.appendChild(item);
                });

            });

        });

        this.setupSectionHighlighting();

    }

    updateTotalScore() {

        this.container.addEventListener('score-change', () => {

            let totalScore = 0;
            const superSections = this.container.querySelectorAll('.super-section-bloc');
            superSections.forEach(superSection => {
                totalScore += superSection.updateScore();
            });
            document.querySelector('.total-box__current-score').textContent = totalScore;

        });

    }

    setMaxScore() {
        let maxScore = 0;
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            maxScore += parseInt(section.dataset.maxScore)
        });
        document.querySelector('.total-box__max-score').innerText = maxScore;
    }

    exportCSV() {

        const rows = [];

        const caseName = document.querySelector('.case-name')?.innerText || "";

        const fullName = document.querySelector('.student-box__student-name').value || "unknown";
        const [studentName, studentLastName] = fullName.split(" ");

        const finalScore = document.querySelector('.total-box__current-score')?.innerText || 0;

        rows.push([
            "FINAL TOTAL",
            finalScore,
            ""
        ]);

        this.container.querySelectorAll('super-section-bloc').forEach(superSection => {
            const superTitle = superSection.dataset.title || "";
            const comment = superSection.querySelector('textarea')?.value || "";

            rows.push([
                superTitle,
                superSection.updateScore(),
                comment
            ]);
        });

        rows.push([
            "Super Section",
            "Section",
            "Question",
            "Score",
            "Points"
        ]);

        this.container.querySelectorAll('super-section-bloc').forEach(superSection => {

            const superTitle = superSection.dataset.title || "";


            superSection.querySelectorAll('section-bloc').forEach(section => {

                const sectionTitle = section.dataset.title;

                section.querySelectorAll('question-item').forEach(question => {

                    const text = question.dataset.text;
                    const points = `/${question.dataset.points}`;
                    const score = question.getScore();

                    rows.push([
                        superTitle,
                        sectionTitle,
                        text,
                        score,
                        points
                    ]);

                });

            });

        });

        this.downloadCSV(rows, `${caseName}_${studentLastName}_${studentName}.csv`);

    }

    downloadCSV(rows, filename) {

        const csvContent = rows
            .map(row => row.map(value => `"${value}"`).join(";"))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }
}

function populateStudentSelect(students) {
    const select = document.querySelector('.student-box__student-name');
    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.textContent = "Sélectionner un étudiant";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    students.forEach(s => {
        if (!s.firstname || !s.name) return;

        const option = document.createElement('option');
        option.value = `${s.firstname} ${s.name}`;
        option.textContent = `${s.firstname} ${s.name}`;
        select.appendChild(option);
    });
}


function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');

    const students = [];

    for (let i = START_ROW; i < lines.length; i++) {
        const cols = lines[i].split(',');

        students.push({
            firstname: cols[FIRSTNAME_INDEX]?.trim(),
            name: cols[NAME_INDEX]?.trim()
        });
    }

    return students;
}


function parseXLS(buffer) {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    return rows.slice(START_ROW).map(row => ({
        firstname: row[FIRSTNAME_INDEX],
        name: row[NAME_INDEX]
    }));
}


// ===============================
// INIT
// ===============================

window.onload = function () {

    const fileInput = document.getElementById('students_list_select');
    const button = document.getElementById('studentUploadBtn');
    const fileNameDisplay = document.getElementById('studentFileName');

    button.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            fileNameDisplay.textContent = "Aucun fichier sélectionné";
            return;
        }

        fileNameDisplay.textContent = file.name;
    });

    const renderer = new FormHandler();

    document.querySelector('.file-download')
        .addEventListener('click', () => renderer.exportCSV());

    // JSON form loader
    document.getElementById('fileInput')
        .addEventListener('change', function (e) {

            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = function (ev) {
                try {
                    const json = JSON.parse(ev.target.result);
                    renderer.clearForm();
                    renderer.renderForm(json);
                    renderer.setMaxScore();
                } catch (err) {
                    alert("Erreur JSON: " + err.message);
                }
            };

            reader.readAsText(file);
        });


    // STUDENTS FILE
    document.getElementById('students_list_select')
        .addEventListener('change', function (e) {

            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            const name = file.name.toLowerCase();

            reader.onload = function (ev) {

                let students = [];

                if (name.endsWith('.csv')) {
                    students = parseCSV(ev.target.result);
                } else {
                    students = parseXLS(ev.target.result);
                }

                populateStudentSelect(students);
            };

            if (name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });

    document.getElementById('resetAppBtn').addEventListener('click', () => {

        if (!confirm("Réinitialiser les scores et commentaires ?")) return;

        // 1. Uncheck all tickboxes
        document.querySelectorAll('question-item input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // 2. Reset question-level scores display
        document.querySelectorAll('section-bloc').forEach(section => {
            const scoreEl = section.querySelector('.section__section-title__section-total');
            if (scoreEl) scoreEl.textContent = "0";
        });

        // 3. Reset super-section scores
        document.querySelectorAll('.super-section__title-bloc__total').forEach(el => {
            el.textContent = "";
        });

        // 4. Clear comments (✅ NEW)
        document.querySelectorAll('.super-section__comment').forEach(textarea => {
            textarea.value = "";
        });

        // 5. Reset global score
        document.querySelector('.total-box__current-score').textContent = "0";

        // 6. Recompute score state
        if (window.renderer) {
            renderer.container.dispatchEvent(
                new CustomEvent('score-change', { bubbles: true })
            );
        }

    });
};