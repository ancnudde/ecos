function addQuestion(questionList) {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    const closebutton = document.createElement("div");
    closebutton.className = "close-button";
    closebutton.innerText = "X"
    questionDiv.appendChild(closebutton)
    closebutton.addEventListener('click', function () {
        this.parentElement.remove(this)
    })

    const questionText = document.createElement("input");
    questionText.type = "text";
    questionText.placeholder = "Question text";
    questionDiv.appendChild(questionText);

    const questionPoints = document.createElement("input");
    questionPoints.type = "number";
    questionPoints.placeholder = "Points";
    questionDiv.appendChild(questionPoints);

    questionList.appendChild(questionDiv);
}

function addSection() {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    const closebutton = document.createElement("div");
    closebutton.className = "close-button";
    closebutton.innerText = "X"
    sectionDiv.appendChild(closebutton)
    closebutton.addEventListener('click', function () {
        this.parentElement.remove(this)
    })


    const sectionTitle = document.createElement("input");
    sectionTitle.type = "text";
    sectionTitle.placeholder = "Section Title";
    sectionTitle.className = "section-title";
    sectionDiv.appendChild(sectionTitle);

    const questionList = document.createElement("div");
    questionList.className = "questions";
    sectionDiv.appendChild(questionList);

    const addQuestionBtn = document.createElement("button");
    addQuestionBtn.textContent = "+ Add Question";
    addQuestionBtn.onclick = () => {
        addQuestion(questionList);
    };

    sectionDiv.appendChild(addQuestionBtn);
    formContainer.appendChild(sectionDiv);

    const maxScoreContainer = document.createElement('div');
    maxScoreContainer.className = "max-score-container";
    const maxScore = document.createElement("input");
    maxScore.className = "max-score"
    maxScoreContainer.innerText = "Max Score"
    maxScoreContainer.appendChild(maxScore)
    maxScore.type = "number";
    maxScore.placeholder = "Max score"
    questionList.appendChild(maxScoreContainer)
}

function downloadJSON() {
    const jsonData = generateJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_data.json";
    a.click();
    URL.revokeObjectURL(url);
}


function addSuperSection() {
    const superSectionDiv = document.createElement("div");
    superSectionDiv.className = "super-section";

    const closeSuperBtn = document.createElement("div");
    closeSuperBtn.className = "close-button";
    closeSuperBtn.innerText = "X";
    superSectionDiv.appendChild(closeSuperBtn);
    closeSuperBtn.addEventListener('click', function () {
        this.parentElement.remove(this);
    });

    const superTitle = document.createElement("input");
    superTitle.type = "text";
    superTitle.placeholder = "Super Section Title";
    superTitle.className = "section-title super-section-title";
    superSectionDiv.appendChild(superTitle);

    const sectionsContainer = document.createElement("div");
    sectionsContainer.className = "sections-container";
    superSectionDiv.appendChild(sectionsContainer);

    const addSectionBtn = document.createElement("button");
    addSectionBtn.textContent = "+ Add Section";
    addSectionBtn.onclick = () => {
        addSectionToSuper(sectionsContainer);
    };
    superSectionDiv.appendChild(addSectionBtn);

    formContainer.appendChild(superSectionDiv);
}

function addSectionToSuper(sectionsContainer) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    const closebutton = document.createElement("div");
    closebutton.className = "close-button";
    closebutton.innerText = "X";
    sectionDiv.appendChild(closebutton);
    closebutton.addEventListener('click', function () {
        this.parentElement.remove(this);
    });

    const sectionTitle = document.createElement("input");
    sectionTitle.type = "text";
    sectionTitle.placeholder = "Section Title";
    sectionTitle.className = "section-title";
    sectionDiv.appendChild(sectionTitle);

    const questionList = document.createElement("div");
    questionList.className = "questions";
    sectionDiv.appendChild(questionList);

    const addQuestionBtn = document.createElement("button");
    addQuestionBtn.textContent = "+ Add Question";
    addQuestionBtn.onclick = () => {
        addQuestion(questionList);
    };
    sectionDiv.appendChild(addQuestionBtn);

    const maxScoreContainer = document.createElement('div');
    maxScoreContainer.className = "max-score-container";
    maxScoreContainer.innerText = "Max Score";
    const maxScore = document.createElement("input");
    maxScore.className = "max-score";
    maxScore.type = "number";
    maxScore.placeholder = "Max score";
    maxScoreContainer.appendChild(maxScore);
    questionList.appendChild(maxScoreContainer);

    sectionsContainer.appendChild(sectionDiv);
}

// Modified loadFromJSON to support super sections
function loadFromJSON(jsonData) {
    formContainer.innerHTML = "";
    if (!jsonData.superSections) return;

    document.getElementById('caseTitle').value = jsonData.title;
    console.log(jsonData.title)

    jsonData.superSections.forEach(superSection => {
        const superSectionDiv = document.createElement("div");
        superSectionDiv.className = "super-section";

        const closeSuperBtn = document.createElement("div");
        closeSuperBtn.className = "close-button";
        closeSuperBtn.innerText = "X";
        superSectionDiv.appendChild(closeSuperBtn);
        closeSuperBtn.addEventListener('click', function () {
            this.parentElement.remove(this);
        });

        const superTitle = document.createElement("input");
        superTitle.type = "text";
        superTitle.placeholder = "Super Section Title";
        superTitle.className = " section-title super-section-title";
        superTitle.value = superSection.title || "";
        superSectionDiv.appendChild(superTitle);

        const sectionsContainer = document.createElement("div");
        sectionsContainer.className = "sections-container";
        superSectionDiv.appendChild(sectionsContainer);

        if (Array.isArray(superSection.sections)) {
            superSection.sections.forEach(section => {
                // Use addSectionToSuper to add each section
                const sectionDiv = document.createElement("div");
                sectionDiv.className = "section";

                const closebutton = document.createElement("div");
                closebutton.className = "close-button";
                closebutton.innerText = "X";
                sectionDiv.appendChild(closebutton);
                closebutton.addEventListener('click', function () {
                    this.parentElement.remove(this);
                });

                const sectionTitle = document.createElement("input");
                sectionTitle.type = "text";
                sectionTitle.placeholder = "Section Title";
                sectionTitle.className = "section-title";
                sectionTitle.value = section.title || "";
                sectionDiv.appendChild(sectionTitle);

                const questionList = document.createElement("div");
                questionList.className = "questions";
                sectionDiv.appendChild(questionList);

                if (Array.isArray(section.questions)) {
                    section.questions.forEach(q => {
                        const questionDiv = document.createElement("div");
                        questionDiv.className = "question";

                        const qClose = document.createElement("div");
                        qClose.className = "close-button";
                        qClose.innerText = "X";
                        questionDiv.appendChild(qClose);
                        qClose.addEventListener('click', function () {
                            this.parentElement.remove(this);
                        });

                        const questionText = document.createElement("input");
                        questionText.type = "text";
                        questionText.placeholder = "Question text";
                        questionText.value = q.text || "";
                        questionDiv.appendChild(questionText);

                        const questionPoints = document.createElement("input");
                        questionPoints.type = "number";
                        questionPoints.placeholder = "Points";
                        questionPoints.value = q.points || "";
                        questionDiv.appendChild(questionPoints);

                        questionList.appendChild(questionDiv);
                    });
                }

                const addQuestionBtn = document.createElement("button");
                addQuestionBtn.textContent = "+ Add Question";
                addQuestionBtn.onclick = () => {
                    addQuestion(questionList);
                };
                sectionDiv.appendChild(addQuestionBtn);

                const maxScoreContainer = document.createElement('div');
                maxScoreContainer.className = "max-score-container";
                maxScoreContainer.innerText = "Max Score";
                const maxScore = document.createElement("input");
                maxScore.className = "max-score";
                maxScore.type = "number";
                maxScore.placeholder = "Max score";
                maxScore.value = section.maxScore || "";
                maxScoreContainer.appendChild(maxScore);
                questionList.appendChild(maxScoreContainer);

                sectionsContainer.appendChild(sectionDiv);
            });
        }

        const addSectionBtn = document.createElement("button");
        addSectionBtn.textContent = "+ Add Section";
        addSectionBtn.onclick = () => {
            addSectionToSuper(sectionsContainer);
        };
        superSectionDiv.appendChild(addSectionBtn);

        formContainer.appendChild(superSectionDiv);
    });
}

// Modified generateJSON to support super sections
function generateJSON() {
    const title = document.getElementById('caseTitle').value;
    const superSections = [];
    const allSuperSections = formContainer.querySelectorAll(".super-section");

    allSuperSections.forEach(superSection => {
        const title = superSection.querySelector(".super-section-title").value.trim();
        const sections = [];
        const sectionDivs = superSection.querySelectorAll(".section");

        sectionDivs.forEach(section => {
            const sectionTitle = section.querySelector(".section-title").value.trim();
            const maxScore = section.querySelector('.max-score').value;
            const questions = [];
            const questionDivs = section.querySelectorAll(".question");

            questionDivs.forEach(q => {
                const text = q.querySelector("input[type='text']").value.trim();
                const points = parseInt(q.querySelector("input[type='number']").value);
                if (text && !isNaN(points)) {
                    questions.push({ text, points });
                }
            });

            if (sectionTitle && questions.length > 0) {
                sections.push({ title: sectionTitle, questions, maxScore });
            }
        });

        if (title && sections.length > 0) {
            superSections.push({ title, sections });
        }
    });

    const jsonOutput = { title, superSections };
    return jsonOutput;
}

// Add button to add super section
window.onload = function () {
    const formContainer = document.getElementById("formContainer");

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    const importButton = document.createElement("button");
    importButton.id = "importButton";
    importButton.textContent = "Import JSON";
    document.body.insertBefore(importButton, document.body.firstChild);

    importButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", function () {
        if (fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                loadFromJSON(jsonData);
            } catch (err) {
                console.log(err)
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    });
}