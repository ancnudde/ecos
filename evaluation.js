let container, totalDisplay, fileInput;

window.onload = function () {
    container = document.getElementById('formContainer');
    totalDisplay = document.getElementById('total');
    fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const json = JSON.parse(e.target.result);
                clearForm();
                renderForm(json);
            } catch (err) {
                alert("Erreur JSON : " + err.message);
            }
        };
        reader.readAsText(file);
    });
};

function clearForm() {
    container.innerHTML = '';
    totalDisplay.textContent = 'Total: 0';
}

function renderForm(data) {
    const studentName = document.createElement("input");
    studentName.type = "text";
    studentName.placeholder = "NOM";
    studentName.className = "student-name";
    container.appendChild(studentName);

    const studentFirstName = document.createElement("input");
    studentFirstName.type = "text";
    studentFirstName.placeholder = "Prénom";
    studentFirstName.className = "student-name student-first-name";
    container.appendChild(studentFirstName);

    const caseName = document.createElement('div');
    caseName.className = "case-name";
    caseName.innerText = `${data.title}`;
    container.appendChild(caseName);

    let index = 0;
    let superSectionIndex = 0;
    let sectionIndex = 0;
    const superSections = data.superSections || [{ title: null, sections: data.sections }];

    superSections.forEach(superSection => {
        const superSectionEl = document.createElement('div');
        superSectionEl.className = "super-section-bloc"
        superSectionEl.id = `superSection${superSectionIndex}`

        if (superSection.title) {

            const superSectionNav = document.createElement('div');
            superSectionNav.innerText = superSection.title;
            superSectionNav.className = 'navigation-container__navigation-element navigation-container__navigation-element--supersection';
            superSectionNav.dataset.superSectionIndex = superSectionIndex;
            superSectionNav.addEventListener('click', function () {
                document.getElementById(`superSection${this.dataset.superSectionIndex}`).scrollIntoView();
            })
            document.querySelector('.navigation-container').appendChild(superSectionNav)

            const superTitle = document.createElement('div');
            superTitle.className = 'super-section-title';
            superTitle.textContent = superSection.title;
            const superTotalDisplay = document.createElement('div');
            superTotalDisplay.className = 'super-section-total';
            superTitle.appendChild(superTotalDisplay);
            superSectionEl.appendChild(superTitle);
        }

        superSectionIndex++;

        superSection.sections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'section';
            sectionEl.id = `section${sectionIndex}`
            sectionEl.dataset.maxScore = parseInt(section.maxScore) || 999;

            const sectionNav = document.createElement('div');
            sectionNav.innerText = section.title;
            sectionNav.className = 'navigation-container__navigation-element navigation-container__navigation-element--section';
            sectionNav.dataset.sectionIndex = sectionIndex;
            sectionNav.addEventListener('click', function () {
                document.getElementById(`section${this.dataset.sectionIndex}`).scrollIntoView();
            })
            document.querySelector('.navigation-container').appendChild(sectionNav)

            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = section.title;
            const totalDisplay = document.createElement('div');
            totalDisplay.className = 'section-total';
            title.appendChild(totalDisplay);
            sectionEl.appendChild(title);

            sectionIndex++;

            section.questions.forEach(q => {
                const item = document.createElement('div');
                item.className = 'item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `q${index++}`;
                checkbox.classList.add('question-checkbox');
                checkbox.dataset.points = q.points;
                checkbox.addEventListener('change', updateTotal);

                const label = document.createElement('label');
                label.setAttribute('for', checkbox.id);
                label.textContent = q.text;

                const score = document.createElement('span');
                score.textContent = `${q.points >= 0 ? '+' : ''}${q.points}`;

                item.appendChild(checkbox);
                item.appendChild(label);
                item.appendChild(score);
                sectionEl.appendChild(item);
            });

            superSectionEl.appendChild(sectionEl);
        });

        container.appendChild(superSectionEl);
    });

    setupSectionHighlighting();

}

function updateSectionScore(section) {
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');
    let total = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) {
            total += parseInt(cb.dataset.points);
        }
    });
    const max = parseInt(section.dataset.maxScore);
    total = Math.min(total, max);
    section.querySelector('.section-total').textContent = total;
    return total;
}

function updateSuperSectionScore(superSection) {
    const sections = superSection.querySelectorAll('.section');
    let total = 0;
    sections.forEach(section => {
        total += updateSectionScore(section);
    });
    const superTotal = superSection.querySelector('.super-section-total');
    if (superTotal) superTotal.textContent = total;
    return total;
}

function updateTotal() {
    let total = 0;
    const superSections = document.querySelectorAll('.super-section-title').length > 0
        ? document.querySelectorAll('.super-section-title').forEach(sup => {
            total += updateSuperSectionScore(sup.parentNode);
        })
        : document.querySelectorAll('.section').forEach(section => {
            total += updateSectionScore(section);
        });

    totalDisplay.textContent = `Total: ${total}`;
}

function generateHTMLReport() {
    const name = document.querySelector('.student-name')?.value || 'Unnamed';
    const totalScore = totalDisplay.textContent;
    const reportWin = window.open('', '_blank');

    let html = `
      <html><head><title>Report - ${name}</title>
      <style>
        body { font-family: "Segoe UI", sans-serif; font-size: 12px; padding: 20px; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin: 12px 0 4px 0; border-bottom: 1px solid #ccc; }
        .summary { margin-bottom: 10px; font-size: 13px; font-weight: bold; }
        ul { padding-left: 15px; margin: 4px 0 10px 0; }
        li { margin: 2px 0; line-height: 1.3; }
        .score { font-weight: bold; float: right; }
      </style></head><body>
      <h1>Report: ${name}</h1>
      <div class="summary">${totalScore}</div>
      `;

    document.querySelectorAll('.section').forEach(section => {
        const sectionTitle = section.querySelector('.section-title')?.textContent?.trim();
        const items = section.querySelectorAll('.item');
        if (!items.length) return;

        html += `<h2>${sectionTitle}</h2><ul>`;
        items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const label = item.querySelector('label')?.textContent?.trim();
            const score = checkbox.checked ? item.querySelector('span')?.textContent : '0';
            html += `<li>${label} <span class="score">${score}</span></li>`;
        });
        html += `</ul>`;
    });

    html += `</body></html>`;
    reportWin.document.write(html);
    reportWin.document.close();
}

async function exportAsPDF() {
    const { jsPDF } = window.jspdf;
    const studentName = document.querySelector('.student-name')?.value || 'Unnamed';
    const studentFirstName = document.querySelector('.student-first-name')?.value || 'Unnamed';
    const caseName = document.querySelector('.case-name')?.innerText || 'Case';

    // Temporary styled container
    const tempContainer = document.createElement('div');
    tempContainer.style = `
    padding: 20px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 12px;
    background: white;
    color: #222;
    max-width: 800px;
  `;
    tempContainer.innerHTML = `
    <h1 style="font-size:16px; margin-bottom: 6px;">Report: ${studentName}</h1>
    <div style="font-size:13px; font-weight:bold; margin-bottom: 16px;">${totalDisplay.textContent}</div>
  `;

    const allSuperSections = document.querySelectorAll('.super-section-title');
    const isSuperStructured = allSuperSections.length > 0;

    if (isSuperStructured) {
        allSuperSections.forEach(superTitleEl => {
            const superTitleText = superTitleEl.childNodes[0]?.textContent?.trim() || '';
            const superContainer = document.createElement('div');
            superContainer.innerHTML = `
        <h2 style="font-size:14px; margin:18px 0 6px 0; border-bottom:1px solid #aaa; background-color: #ccc; padding: 8px">
          ${superTitleText}
        </h2>
      `;

            const superParent = superTitleEl.parentNode;
            const sections = superParent.querySelectorAll('.section');

            sections.forEach(section => {
                const sectionTitle = section.querySelector('.section-title')?.childNodes[0]?.textContent?.trim();
                const sectionScore = section.querySelector('.section-total')?.textContent?.trim() || '0';

                const sectionHTML = document.createElement('div');
                sectionHTML.innerHTML = `
          <div style="font-size:13px; margin:10px 0 4px 0; font-weight:bold; display:flex; justify-content:space-between; border-bottom:1px dashed #ccc; background-color: #f9f9f9; padding: 8px;">
            <span>${sectionTitle}</span>
            <span>Score: ${sectionScore}</span>
          </div>
        `;

                const ul = document.createElement('ul');
                ul.style = "padding-left:15px; margin:4px 0 10px 0; list-style: none;";

                section.querySelectorAll('.item').forEach(item => {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    const label = item.querySelector('label')?.textContent?.trim();
                    const rawScore = item.querySelector('span')?.textContent?.trim();
                    const score = checkbox.checked ? rawScore : '0';

                    const li = document.createElement('li');
                    li.style = "margin:2px 0; line-height:1.4; display:flex; justify-content:space-between; border-bottom:1px dotted #ddd;";
                    li.innerHTML = `<span>• ${label}</span><span><strong>${score}</strong></span>`;
                    ul.appendChild(li);
                });

                sectionHTML.appendChild(ul);
                superContainer.appendChild(sectionHTML);
            });

            tempContainer.appendChild(superContainer);
        });
    } else {
        document.querySelectorAll('.section').forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent?.trim();
            const sectionScore = section.querySelector('.section-total')?.textContent?.trim() || '0';

            const sectionHTML = document.createElement('div');
            sectionHTML.innerHTML = `
        <div style="font-size:13px; margin:10px 0 4px 0; font-weight:bold; display:flex; justify-content:space-between; border-bottom:1px dashed #ccc;">
          <span>${sectionTitle}</span>
          <span>Score: ${sectionScore}</span>
        </div>
      `;

            const ul = document.createElement('ul');
            ul.style = "padding-left:15px; margin:4px 0 10px 0; list-style: none;";

            section.querySelectorAll('.item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('label')?.textContent?.trim();
                const rawScore = item.querySelector('span')?.textContent?.trim();
                const score = checkbox.checked ? rawScore : '0';

                const li = document.createElement('li');
                li.style = "margin:2px 0; line-height:1.4; display:flex; justify-content:space-between; border-bottom:1px dotted #ddd;";
                li.innerHTML = `<span>• ${label}</span><span><strong>${score}</strong></span>`;
                ul.appendChild(li);
            });

            sectionHTML.appendChild(ul);
            tempContainer.appendChild(sectionHTML);
        });
    }

    document.body.appendChild(tempContainer);
    const canvas = await html2canvas(tempContainer, { scale: 2 });
    document.body.removeChild(tempContainer);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let offsetY = 0;
    let pageHeightLeft = imgHeight;

    while (pageHeightLeft > 0) {
        const pageCanvas = document.createElement('canvas');
        const ctx = pageCanvas.getContext('2d');
        const pageImageHeight = Math.min(pageHeightLeft, pdfHeight - 40);

        pageCanvas.width = canvas.width;
        pageCanvas.height = (pageImageHeight * canvas.width) / imgWidth;

        ctx.drawImage(canvas, 0, offsetY, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        const pageImg = pageCanvas.toDataURL('image/png');

        if (offsetY > 0) pdf.addPage();
        pdf.addImage(pageImg, 'PNG', 20, 20, imgWidth, pageImageHeight);

        offsetY += pageCanvas.height;
        pageHeightLeft -= pageImageHeight;
    }

    pdf.save(`report_${studentName.replace(/\s+/g, '_')}_${studentFirstName.replace(/\s+/g, '_')}_${caseName.replace(/\s+/g, '_')}.pdf`);
}

function setupSectionHighlighting() {
    const navElements = document.querySelectorAll(
        '.navigation-container__navigation-element--section, .navigation-container__navigation-element--supersection'
    );
    const sectionElements = [
        ...document.querySelectorAll('.section'),
        ...document.querySelectorAll('.super-section-bloc')
    ];

    const navContainer = document.querySelector('.navigation-container');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove highlight from all
                navElements.forEach(nav => nav.classList.remove('active'));

                // Find matching nav element
                const id = entry.target.id;
                const navMatch = [...navElements].find(nav => {
                    return nav.dataset.sectionIndex == id.replace('section', '') ||
                        nav.dataset.superSectionIndex == id.replace('superSection', '');
                });
                if (navMatch) {
                    navMatch.classList.add('active');

                    // Scroll nav container so active element stays visible
                    navMatch.scrollIntoView({
                        block: 'nearest',
                        inline: 'nearest',
                        behavior: 'smooth'
                    });
                }
            }
        });
    }, {
        root: container,      // Your scrollable content container
        rootMargin: '0px 0px -80% 0px', // Trigger when section is near the top
        threshold: 0
    });

    sectionElements.forEach(sec => observer.observe(sec));
}

