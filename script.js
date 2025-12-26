document.addEventListener('DOMContentLoaded', () => {
  // Pobieranie parametru z URL
  const getParam = name => new URLSearchParams(location.search).get(name) || '';

  // Bezpieczna normalizacja do tekstu (bez .normalize())
  const norm = str => {
    if (str === undefined || str === null) return '';
    return ('' + str).trim().toLowerCase();
  };

  const params = {
    udzwig: getParam('udzwig'),
    ciegna: getParam('ciegna'),
    dlugosc: getParam('dlugosc'),
    kat: getParam('kat'),
    skracane: getParam('skracane'),
    ogniwo: getParam('ogniwo'),
    hak: getParam('hak')
  };

  const summaryEl = document.getElementById('summary');
  const cardsEl = document.getElementById('cards');

  // Podsumowanie parametrów
  function renderSummary() {
    const rows = Object.entries(params).map(([k, v]) => {
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      return `<tr><td>${label}</td><td>${v || '-'}</td></tr>`;
    });
    summaryEl.innerHTML = `<table>${rows.join('')}</table>`;
  }

  // Ładowanie i filtrowanie produktów
  async function loadProducts() {
    try {
      const res = await fetch('products.json');
      if (!res.ok) {
        throw new Error('Nie udało się pobrać products.json: ' + res.status);
      }

      const data = await res.json();
      const all = Array.isArray(data) ? data : data.products;

      const filtered = all.filter(p => {
        const cf = p.custom_fields || {};

        return (!params.udzwig   || norm(cf.udzwig)   === norm(params.udzwig)) &&
               (!params.ciegna   || norm(cf.ciegna)   === norm(params.ciegna)) &&
               (!params.dlugosc  || norm(cf.dlugosc)  === norm(params.dlugosc)) &&
               (!params.kat      || norm(cf.kat)      === norm(params.kat)) &&
               (!params.skracane || norm(cf.skracane) === norm(params.skracane)) &&
               (!params.ogniwo   || norm(cf.ogniwo)   === norm(params.ogniwo)) &&
               (!params.hak      || norm(cf.hak)      === norm(params.hak));
      });

      // Debug do konsoli, żebyś widział, co się dzieje
      console.log('PARAMS:', params);
      console.log('WSZYSTKIE PRODUKTY:', all);
      console.log('PRZEFILTROWANE PRODUKTY:', filtered);

      if (!filtered.length) {
        cardsEl.innerHTML = '<p>Brak produktów spełniających kryteria.</p>';
        return;
      }

      cardsEl.innerHTML = filtered.map(p => `
        <div class="product-card">
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <div class="sku">SKU: ${p.sku}</div>
          <a href="${p.url}" class="btn" target="_blank">Zobacz produkt</a>
        </div>
      `).join('');
    } catch (err) {
      cardsEl.innerHTML = '<p>Błąd podczas ładowania produktów.</p>';
      console.error('Błąd w loadProducts:', err);
    }
  }

  // Kopiowanie linku
  window.copyLink = () => {
    navigator.clipboard.writeText(location.href).then(() => {
      alert('Link skopiowany do schowka!');
    }).catch(err => {
      console.error('Błąd kopiowania linku:', err);
    });
  };

  // Eksport do PDF
  window.exportToPDF = () => {
    const element = document.body;
    if (typeof html2pdf === 'undefined') {
      alert('Brak biblioteki html2pdf.min.js');
      return;
    }
    html2pdf().from(element).save('wynik-konfiguratora.pdf');
  };

  // Tryb debugowania (?debug=1)
  if (location.search.includes('debug=1')) {
    const debugEl = document.getElementById('debug');
    const output = {
      params,
      url: location.href,
      timestamp: new Date().toISOString()
    };
    if (debugEl) {
      debugEl.style.display = 'block';
      document.getElementById('debug-output').textContent = JSON.stringify(output, null, 2);
    }
  }

  renderSummary();
  loadProducts();
});
