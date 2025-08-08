async function navigate(page) {
    const res = await fetch(`${page}.html`);
    const html = await res.text();
    document.getElementById("mainContent").innerHTML = html;
}

// Default to generator on page load
window.onload = () => navigate('generator');
