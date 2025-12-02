// ----------- MENU ACTIF AU SCROLL -----------
const sections = document.querySelectorAll("section, header");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const top = window.scrollY;
        if (top >= section.offsetTop - 200) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(a => {
        a.classList.remove("active");
        if (a.getAttribute("href").includes(current)) {
            a.classList.add("active");
        }
    });
});


// ----------- ANIMATION REVEAL ON SCROLL -----------
const revealElements = document.querySelectorAll("section");

const reveal = () => {
    revealElements.forEach(el => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight - 100) {
            el.style.transition = "1s";
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
        }
    });
}

reveal();
window.addEventListener("scroll", reveal);


// ----------- GALLERY INTERACTIONS (filters / view / theme) -----------
const gallery = document.querySelector('.gallery');
const projects = Array.from(document.querySelectorAll('.gallery .project'));
const filterButtons = document.querySelectorAll('.gallery-toolbar .filter');
const viewToggle = document.getElementById('view-toggle');
const themeToggle = document.getElementById('theme-toggle');
const navThemeToggle = document.getElementById('theme-toggle-nav');

// Filters
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tag = btn.dataset.filter;
        projects.forEach(p => {
            const tags = (p.dataset.tags || '').split(' ').map(t => t.trim()).filter(Boolean);
            const match = tag === 'all' || tags.includes(tag);
            p.classList.toggle('hidden', !match);
        });
    });
});

// View toggle (grid/list)
viewToggle.addEventListener('click', () => {
    const isList = gallery.classList.toggle('list');
    viewToggle.innerHTML = isList ? '<i class="fas fa-list"></i>' : '<i class="fas fa-th-large"></i>';
});

// Theme toggle (persist)
const savedTheme = localStorage.getItem('theme');
function setTheme(isDark){
    if(isDark){
        document.body.classList.add('dark');
        localStorage.setItem('theme','dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme','light');
    }

    // update both toggles if present
    if(themeToggle){
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    if(navThemeToggle){
        navThemeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        navThemeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

if (savedTheme === 'dark') setTheme(true);

// attach handlers for both toggles
if(themeToggle) themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
if(navThemeToggle) navThemeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));

// ----------- PROJECT REVEAL (IntersectionObserver) -----------
const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.15 });
projects.forEach(p => obs.observe(p));


// ----------- LIGHTBOX AVANCÉ (prev/next/close + keyboard) -----------
const galleryImages = Array.from(document.querySelectorAll('.gallery .project img'));

function openLightboxAt(index, visibleOnly = true) {
    // determine the list of candidates to navigate through
    const candidates = visibleOnly ? Array.from(document.querySelectorAll('.gallery .project:not(.hidden) img')) : galleryImages.slice();
    if (candidates.length === 0) return;
    if (index < 0) index = candidates.length - 1;
    if (index >= candidates.length) index = 0;

    const img = candidates[index];
    const title = img.dataset.title || '';
    const desc = img.dataset.desc || '';

    const overlay = document.createElement('div');
    overlay.classList.add('lightbox');
    overlay.innerHTML = `
        <div class="lightbox-content" role="dialog" aria-modal="true">
            <button class="lightbox-close" aria-label="Fermer">&times;</button>
            <img src="${img.src}" alt="${img.alt}" />
            <div class="lightbox-caption">
                ${title ? `<h4>${title}</h4>` : ''}
                ${desc ? `<p>${desc}</p>` : ''}
            </div>
            <div class="lightbox-nav">
                <button class="lightbox-prev" aria-label="Précédent"><i class="fas fa-chevron-left"></i></button>
                <button class="lightbox-next" aria-label="Suivant"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `;

    // functions to remove/update
    let currentIndex = index;

    function updateContent() {
        const candidatesNow = Array.from(document.querySelectorAll('.gallery .project:not(.hidden) img'));
        // if current index is out of range (filter changed) clamp
        if (currentIndex < 0) currentIndex = candidatesNow.length - 1;
        if (currentIndex >= candidatesNow.length) currentIndex = 0;
        if (!candidatesNow.length) return remove();
        const newImg = candidatesNow[currentIndex];
        const contentImg = overlay.querySelector('img');
        const t = newImg.dataset.title || '';
        const d = newImg.dataset.desc || '';
        contentImg.src = newImg.src;
        contentImg.alt = newImg.alt;
        const caption = overlay.querySelector('.lightbox-caption');
        caption.innerHTML = `${t ? `<h4>${t}</h4>` : ''}${d ? `<p>${d}</p>` : ''}`;
    }

    function next() { currentIndex++; updateContent(); }
    function prev() { currentIndex--; updateContent(); }

    function onKey(e) {
        if (e.key === 'Escape') remove();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    }

    function remove() {
        overlay.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    }

    overlay.addEventListener('click', (e) => {
        // close when clicking on the overlay background
        if (e.target === overlay) remove();
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', remove);
    overlay.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); next(); });
    overlay.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
}

// attach click handlers to open lightbox with navigation
galleryImages.forEach((img, i) => img.addEventListener('click', (e) => {
    // compute index among visible images
    const visible = Array.from(document.querySelectorAll('.gallery .project:not(.hidden) img'));
    const idx = visible.indexOf(e.currentTarget);
    openLightboxAt(idx >= 0 ? idx : i, true);
}));

// ----------- FORM HANDLING: Formspree (preferred) with mailto fallback -----------
// If you want to receive submissions in your email automatically, you can use Formspree or EmailJS.
// For Formspree paste your endpoint here (example: 'https://formspree.io/f/abcdxyz').
const FORMSPREE_ENDPOINT = ''; // <-- replace with your Formspree endpoint to enable automatic send

// EmailJS (client-side): sign up at https://www.emailjs.com and create a service + template.
// Then fill these constants with your values below.
const EMAILJS_SERVICE_ID = 'service_5390nk8'; // e.g. 'service_xxx'
const EMAILJS_TEMPLATE_ID = 'template_849zrql'; // e.g. 'template_xxx'
const EMAILJS_PUBLIC_KEY = 'meabqwHURT5HQERUG'; // user's public key

// fallback mailto address (used only if no Formspree or EmailJS configured)
const MAILTO_RECIPIENT = 'kouemabea@gmail.com'; // fallback address for mailto

// initialize EmailJS if keys provided and the SDK loaded
if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY && window.emailjs && typeof emailjs.init === 'function') {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e) { console.warn('emailjs.init failed', e); }
}

const form = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const formConfigHint = document.getElementById('form-config-hint');
if (form) {
    // Show or hide setup hint depending on configuration
    if (FORMSPREE_ENDPOINT || (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)) {
        formConfigHint && formConfigHint.classList.add('hidden');
    } else {
        formConfigHint && formConfigHint.classList.remove('hidden');
        console.info('Contact form: no Formspree/EmailJS configured. Current behaviour will open mail client (mailto) as fallback.');
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        // basic validation - rely on browser validity
        if (!form.checkValidity()) {
            formMessage.textContent = 'Merci de compléter tous les champs requis.';
            formMessage.className = 'form-message error';
            return;
        }

        submitBtn.textContent = 'Envoi...';
        submitBtn.disabled = true;

        try {
            if (FORMSPREE_ENDPOINT) {
                // send to Formspree
                const res = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    formMessage.textContent = 'Message envoyé — je te répondrai bientôt. Merci !';
                    formMessage.className = 'form-message success';
                    submitBtn.textContent = 'Envoyé ✓';
                    submitBtn.classList.add('sent');
                    form.reset();
                } else {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(payload.error || 'Erreur lors de l’envoi');
                }
            } else if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && window.emailjs) {
                // send using EmailJS (client-side)
                // the template should reference the form fields by name (e.g. name, email, message)
                const sendResult = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form, EMAILJS_PUBLIC_KEY);
                if (sendResult && (sendResult.status === 200 || sendResult.text === 'OK')) {
                    formMessage.textContent = 'Message envoyé — je te répondrai bientôt. Merci !';
                    formMessage.className = 'form-message success';
                    submitBtn.textContent = 'Envoyé ✓';
                    submitBtn.classList.add('sent');
                    form.reset();
                } else {
                    throw new Error('EmailJS envoi non OK');
                }
            } else {
                // fallback: open mail client
                const name = formData.get('name') || '';
                const email = formData.get('email') || '';
                const message = formData.get('message') || '';
                const subject = formData.get('_subject') || 'Message depuis le portfolio';
                const body = `Nom: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
                window.location.href = `mailto:${MAILTO_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${body}`;

                // message shown as fallback for manual mail client
                formMessage.textContent = 'Nous allons ouvrir votre client mail — vérifiez l’adresse et envoyez.';
                formMessage.className = 'form-message success';
            }

        } catch (err) {
            formMessage.textContent = 'Désolé, l’envoi a échoué — réessaie plus tard.';
            formMessage.className = 'form-message error';
            console.error('Form submission error', err);
        } finally {
            // restore button state after short delay
            setTimeout(() => {
                submitBtn.textContent = 'Envoyer';
                submitBtn.disabled = false;
                submitBtn.classList.remove('sent');
            }, 1400);
        }
    });
}


// ----------- STYLE POUR LIGHTBOX (injection) -----------
const lightboxCSS = `
.lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 20px;
}
.lightbox-content {
    max-width: 1100px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.lightbox img {
    max-width: 90%;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}
.lightbox-caption {
    background: rgba(255,255,255,0.95);
    padding: 14px;
    border-radius: 8px;
    text-align: center;
    max-width: 95%;
}
.lightbox-caption h4 {
    margin: 0 0 6px 0;
    color: #0a0a23;
}
.lightbox-caption p {
    margin: 0;
    color: #333;
    font-size: 0.95rem;
}

.lightbox-close{
    position:absolute;
    right:22px;
    top:18px;
    font-size:28px;
    background:transparent;
    color:white;
    border:none;
    cursor:pointer;
}
.lightbox-nav{ display:flex; gap:10px; margin-top: 6px }
.lightbox-nav button{ background: rgba(255,255,255,0.95); border-radius:8px; padding:8px 10px; border:none; cursor:pointer }
.lightbox-content{ position:relative }
.lightbox-close:hover{ transform:scale(1.05) }
@media (max-width:700px){
    .lightbox img{ max-width:100%; }
    .lightbox-content{ padding: 8px }
}
`;

const styleEl = document.createElement("style");
styleEl.innerHTML = lightboxCSS;
document.head.appendChild(styleEl);

// ----------- DOWNLOAD FEEDBACK (toast) -----------
function showDownloadToast(text = 'Téléchargement démarré'){
    let toast = document.querySelector('.download-toast');
    if(!toast){
        toast = document.createElement('div');
        toast.className = 'download-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('visible');
    setTimeout(()=> toast.classList.remove('visible'), 1800);
}

document.addEventListener('click', (e)=>{
    const btn = e.target.closest && e.target.closest('.download-btn');
    if(!btn) return;
    // small delay to allow browser download to start
    setTimeout(()=> showDownloadToast('Téléchargement en cours…'), 120);
});
