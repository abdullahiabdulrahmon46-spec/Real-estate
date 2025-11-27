(function(){
  // Mobile bottom nav behavior: active state and hide-on-scroll
  const nav = document.querySelector('.bottom-nav');
  if(!nav) return;
  const items = nav.querySelectorAll('.bn-item');

  // Determine active key from path
  const path = location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html':'home',
    '':'home',
    'portfolio.html':'portfolio',
    'service.html':'services',
    'about.html':'about',
    'contact.html':'contact'
  };
  const key = map[path] || null;
  if(key){
    items.forEach(i=> { if(i.dataset.key===key) i.classList.add('active'); else i.classList.remove('active'); });
  }

  // Set active state on top navbar links (desktop & mobile collapsed menu)
  try {
    var topPath = path;
    var topLinks = document.querySelectorAll('.navbar .nav-link, .navbar .navbar-nav a');
    topLinks.forEach(function (ln) {
      try {
        var href = ln.getAttribute('href') || '';
        // normalize last segment
        var last = href.split('/').pop();
        if (!last || last === '') last = 'index.html';
        if (last === topPath) {
          ln.classList.add('active');
        } else {
          ln.classList.remove('active');
        }
      } catch (e) { /* ignore */ }
    })
  } catch (e) { /* ignore */ }

  // Hide on scroll down, show on scroll up
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        const y = window.scrollY;
        if(y > lastY && y > 100){ nav.classList.add('hidden'); }
        else { nav.classList.remove('hidden'); }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, {passive:true});

  // Make nav keyboard accessible: on Enter trigger navigation
  items.forEach(a=>{
    a.setAttribute('tabindex', '0');
    a.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); a.click(); } });
  });

  // Show simple account area in the navbar if a user is signed in (realhome_current)
  try {
      var current = localStorage.getItem('realhome_current')
    if (current) {
      // attempt to read display name from stored users
      var users = {}
      try { users = JSON.parse(localStorage.getItem('realhome_users') || '{}') } catch (e) { users = {} }
      var display = (users[current] && users[current].display) ? users[current].display : current

      // Replace any "Get Started" links with a Sign out action so it doesn't show again
      // Transform only the Get Started links inside navbars; avoid double-binding by marking modified nodes
      var anchors = Array.from(document.querySelectorAll('.navbar a'))
      anchors.forEach(function (a) {
        try {
          if (a.dataset.authModified) return
          var href = a.getAttribute('href') || ''
          var txt = (a.textContent || '').trim()
          if (href.indexOf('get-started.html') !== -1 || /get\s*started/i.test(txt)) {
            a.dataset.authModified = '1'
            a.textContent = 'Sign out'
            // preserve appearance but make it act as sign-out
            a.classList.remove('btn-light')
            a.classList.add('nav-link')
            a.setAttribute('href', '#')
            a.setAttribute('role', 'button')
            a.addEventListener('click', function (e) {
              e.preventDefault()
              localStorage.removeItem('realhome_current')
              // reload to update UI and show Get Started again
              window.location.reload()
            })
          }
        } catch (ee) { /* ignore individual anchor errors */ }
      })

      // Add a small greeting to the navbar on larger screens (kept separate from mobile menu)
      var navContainer = document.querySelector('.navbar .container')
      if (navContainer) {
        var acct = document.createElement('div')
        acct.className = 'd-none d-lg-flex align-items-center ms-3'
        acct.style.gap = '0.5rem'
        acct.innerHTML = '<span class="text-white small">Hi, ' + (display) + '</span>'

        var signoutBtn = document.createElement('button')
        signoutBtn.className = 'btn btn-sm btn-outline-light'
        signoutBtn.textContent = 'Sign out'
        signoutBtn.addEventListener('click', function () {
          localStorage.removeItem('realhome_current')
          window.location.reload()
        })

        acct.appendChild(signoutBtn)
        navContainer.appendChild(acct)
      }
    }
  } catch (e) {
    // non-fatal — if localStorage is unavailable just skip
    console.warn('account UI: ', e)
  }
})();
