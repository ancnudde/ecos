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

        rows.push([
            "Super Section",
            "Section",
            "Question",
            "Score",
            "Points"
        ]);

        const studentName = `${document.querySelector('.student-box__student-name').value}`;
        const studentLastName = `${document.querySelector('.student-box__student-last-name').value}`;

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

        this.container.querySelectorAll('super-section-bloc').forEach(superSection => {
            const superTitle = superSection.dataset.title || "";
            const comment = superSection.querySelector('textarea')?.value || "";

            rows.push([
                superTitle,
                superSection.updateScore(),
                comment
            ]);
        });

        const finalScore = document.querySelector('.total-box__current-score')?.innerText || 0;


        rows.push([
            "FINAL TOTAL",
            finalScore,
            ""
        ]);

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

window.onload = function () {
    renderer = new FormHandler();
    document.querySelector('.file-download').addEventListener('click', function () { renderer.exportCSV() })
    fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const json = JSON.parse(e.target.result);
                renderer.clearForm();
                renderer.renderForm(json);
                renderer.setMaxScore();
            } catch (err) {
                console.log(err)
                alert("Erreur JSON : " + err.message);
            }
        };
        reader.readAsText(file);
    });
};








