'use strict';

const pueblos = window.TERRITORIOS;
const grid = document.querySelector('#territory-grid');
const search = document.querySelector('#search');
const dialog = document.querySelector('#detail-dialog');
const formatter = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
let orden = 'todos';
let previousFocus = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function texto(value) {
  return value == null || value === '' ? 'Por confirmar' : escapeHtml(value);
}
function normalizar(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function coordenadasValidas(pueblo) {
  const c = pueblo.coordenadas;
  return c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180;
}
function coordenadasTexto(pueblo) {
  return coordenadasValidas(pueblo) ? `${pueblo.coordenadas.lat.toFixed(6)}, ${pueblo.coordenadas.lng.toFixed(6)}` : 'Ubicación por confirmar';
}
function mapsButton(pueblo) {
  if (!coordenadasValidas(pueblo)) return '<span class="maps-pending">Ubicación por confirmar</span>';
  const { lat, lng } = pueblo.coordenadas;
  return `<a class="button maps-button" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(pueblo.nombre)} en Google Maps (nueva pestaña)">📍 Abrir en Google Maps <span aria-hidden="true">↗</span></a>`;
}
function altitud(pueblo) {
  return Number.isFinite(pueblo.altitud) ? `${formatter.format(pueblo.altitud)} m s. n. m.` : 'Por confirmar';
}
function distancia(pueblo) {
  return Number.isFinite(pueblo.distanciaKm) ? `≈ ${formatter.format(pueblo.distanciaKm)} km` : 'Por confirmar';
}
function tiempo(pueblo) {
  if (pueblo.esBase) return 'Base';
  const t = pueblo.tiempoMin;
  if (!t || !Number.isFinite(t.minimo) || !Number.isFinite(t.maximo)) return 'Por confirmar';
  return `~${formatter.format(t.minimo)}–${formatter.format(t.maximo)} min`;
}
function distanciaDetalle(pueblo) {
  if (pueblo.esBase) return 'Base de referencia';
  const tipo = pueblo.tipoDistancia ? ` <span class="distance-type">· ${texto(pueblo.tipoDistancia.toLowerCase())}</span>` : '';
  return `${distancia(pueblo)}${tipo}`;
}
function metricas(pueblo, detalle = false) {
  return `<dl class="metrics"><div><dt><span aria-hidden="true">△</span> Altitud</dt><dd>${altitud(pueblo)}</dd></div><div><dt><span aria-hidden="true">↔</span> Distancia desde San José de Secce</dt><dd>${detalle ? distanciaDetalle(pueblo) : distancia(pueblo)}</dd></div><div><dt><span aria-hidden="true">◷</span> Tiempo aproximado</dt><dd>${tiempo(pueblo)}</dd></div><div><dt><span aria-hidden="true">⌖</span> Dirección o sector</dt><dd>${texto(pueblo.direccion)}</dd></div></dl>`;
}
function ordenar(lista, criterio) {
  const campos = { cerca: ['distanciaKm', 1], lejos: ['distanciaKm', -1], alta: ['altitud', -1], baja: ['altitud', 1] };
  if (!campos[criterio]) return [...lista].sort((a, b) => Number(Boolean(b.esBase)) - Number(Boolean(a.esBase)));
  const [campo, sentido] = campos[criterio];
  return [...lista].sort((a, b) => {
    const aValido = Number.isFinite(a[campo]);
    const bValido = Number.isFinite(b[campo]);
    if (!aValido && !bValido) return 0;
    if (!aValido) return 1;
    if (!bValido) return -1;
    return (a[campo] - b[campo]) * sentido;
  });
}
function renderTarjetas() {
  const consulta = normalizar(search.value);
  const lista = ordenar(pueblos.filter(pueblo =>
    [pueblo.nombre, ...(pueblo.aliases ?? [])].some(nombre => normalizar(nombre).includes(consulta))
  ), orden);
  grid.innerHTML = lista.map(pueblo => `<article class="territory-card${pueblo.esBase ? ' is-base' : ''}"><div class="card-top"><span class="place-icon" aria-hidden="true">${pueblo.esBase ? '⌂' : '△'}</span><span class="badge">${pueblo.esBase ? 'NUESTRA BASE' : 'TERRITORIO'}</span></div><h3>${escapeHtml(pueblo.nombre)}</h3>${metricas(pueblo)}<div class="card-actions"><button class="button detail-button" type="button" data-detail="${escapeHtml(pueblo.id)}" aria-label="Ver información de ${escapeHtml(pueblo.nombre)}">Ver información <span aria-hidden="true">↗</span></button>${mapsButton(pueblo)}</div></article>`).join('');
  document.querySelector('#empty-state').hidden = lista.length !== 0;
  const status = document.querySelector('#results-status');
  status.hidden = !consulta;
  status.textContent = consulta ? `${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'}` : '';
}
function abrirDetalle(id) {
  const pueblo = pueblos.find(item => item.id === id);
  if (!pueblo) return;
  const recomendaciones = Array.isArray(pueblo.recomendaciones) && pueblo.recomendaciones.length ? `<ul>${pueblo.recomendaciones.map(item => `<li>${texto(item)}</li>`).join('')}</ul>` : '<p>Por confirmar</p>';
  document.querySelector('#detail-content').innerHTML = `<p class="eyebrow">${pueblo.esBase ? 'NUESTRA BASE' : 'CONOCE EL PUEBLO'}</p><h2 id="detail-title">${escapeHtml(pueblo.nombre)}</h2>${metricas(pueblo, true)}<div class="detail-section"><h3>Sobre el lugar</h3><p>${texto(pueblo.descripcion)}</p></div><div class="detail-section"><h3>Observaciones de acceso</h3><p>${texto(pueblo.acceso)}</p></div><div class="detail-section"><h3>Recomendaciones prácticas</h3>${recomendaciones}</div><p class="coordinates detail-coordinates">Coordenadas: ${coordenadasTexto(pueblo)}</p>${mapsButton(pueblo)}`;
  previousFocus = document.activeElement;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  document.querySelector('#close-dialog').focus();
}
search.addEventListener('input', renderTarjetas);
function cambiarOrden(criterio) {
  orden = criterio;
  document.querySelector('#sort-select').value = criterio;
  document.querySelectorAll('[data-sort]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.sort === criterio)));
  renderTarjetas();
}
document.querySelector('#sort-select').addEventListener('change', event => cambiarOrden(event.target.value));
document.querySelector('.sort-bar').addEventListener('click', event => {
  const button = event.target.closest('[data-sort]');
  if (!button) return;
  cambiarOrden(button.dataset.sort);
});
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-detail]');
  if (button) abrirDetalle(button.dataset.detail);
});
document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; renderTarjetas(); search.focus(); });
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); previousFocus?.focus(); });
document.querySelector('#total-count').textContent = `${pueblos.length} lugares`;
renderTarjetas();
