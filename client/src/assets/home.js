// Взимаме API_URL от meta tag в HTML-а
// <meta name="api-url" content="%VITE_API_URL%">
const API_URL = document.querySelector('meta[name="api-url"]')?.content || 'http://localhost:8788';

// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// ─── COPY CODE BUTTON ───
function copyCode(btn) {
  const code = `<script\n  src="https://cdn.buvo.io/widget.js"\n  data-key="your-api-key"\n  data-color="#c8f060"\n  defer\n><\/script>`;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ─── NAV HIGHLIGHT ON SCROLL ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current
      ? 'var(--text)'
      : '';
  });
}, { passive: true });

// ─── AUTH ───
async function checkAuthState() {
  try {
    // Първо проверяваме localStorage кеша
    const cached = localStorage.getItem('buvo_user');
    if (cached) {
      const user = JSON.parse(cached);
      if (user._cachedAt && Date.now() - user._cachedAt < 3600000) {
        setLoggedInState(user);
        return;
      }
    }

    // Питаме сървъра
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    });

    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('buvo_user', JSON.stringify({
        ...user,
        _cachedAt: Date.now()
      }));
      setLoggedInState(user);
    } else {
    
      localStorage.removeItem('buvo_user');
      setLoggedOutState();
    }
  } catch (e) {
    setLoggedOutState();
  }
}

function setLoggedInState(user) {
  const btn = document.getElementById('get-started-btn');
  if (!btn) return;

  // Сменяме съдържанието
  btn.innerHTML = `
    <img
      src="${user.picture_url}"
      alt="${user.name}"
       referrerpolicy="no-referrer"
      style="width:28px;height:28px;border-radius:50%;object-fit:cover;"
      onerror="this.style.display='none'"
    />
    <span>${user.name.split(' ')[0]}</span>
    <span style="opacity:0.5">↗</span>
  `;
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '8px';

  // Заменяме елемента за да махнем стария click handler
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener('click', () => {
    window.location.href = '/console';
  });
}

function setLoggedOutState() {
  const btn = document.getElementById('get-started-btn');
  if (!btn) return;

  btn.innerHTML = 'Get started free';
  btn.style.display = '';

  // Заменяме елемента за да махнем евентуални стари handlers
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener('click', openLoginPopup);
}

function openLoginPopup() {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    `${API_URL}/auth/google/login`,
    'google-login',
    `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars=yes,status=1`
  );

  if (!popup) {
    alert('Popup blocked. Please allow popups for this site.');
    return;
  }

  window.addEventListener('message', function handler(event) {
    if (event.origin !== new URL(API_URL).origin) return;

    if (event.data?.type === 'AUTH_SUCCESS') {
      window.removeEventListener('message', handler);
      // Инвалидираме кеша и redirect
      localStorage.removeItem('buvo_user');
      window.location.href = '/console';
    }

    if (event.data?.type === 'AUTH_ERROR') {
      console.error('Login failed:', event.data.message);
      window.removeEventListener('message', handler);
    }
  });
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', checkAuthState);