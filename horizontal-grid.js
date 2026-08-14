/* Keep the map data row-major, but stagger alternate rows horizontally. */
function render() {
  $('mapTitle').value = state.title;
  $('mapMode').value = state.mode;
  $('workspaceTitle').textContent = state.title || 'Untitled Map';
  const { cols, rows } = dims();
  $('workspaceMeta').textContent = `${cols} × ${rows} parsecs · ${Object.values(state.hexes).filter(h => h.kind === 'world').length} worlds`;

  const map = $('map');
  map.style.setProperty('--cols', cols);
  map.style.setProperty('--rows', rows);
  map.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const h = state.hexes[key(q, r)] || { kind: 'empty' };
      const k = key(q, r);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `hex ${h.kind || 'empty'}${selected === k ? ' selected' : ''}`;
      // Odd rows are shifted half a hex to the right.
      el.style.setProperty('--offset', r % 2);
      el.dataset.key = k;
      if (h.type) el.dataset.type = h.type;
      el.title = tooltip(q, r, h);
      el.innerHTML = `<span class="coord">${coord(q, r)}</span><span class="symbol">${h.kind === 'world' ? (h.type === 'S' ? '◉' : h.type === 'A' ? '✦' : '●') : h.kind === 'anomaly' ? '✹' : ''}</span>${h.kind === 'world' ? `<span class="code">${code(h)}</span>` : ''}${h.name ? `<span class="name">${escapeHtml(h.name)}</span>` : ''}`;
      el.onclick = () => selectHex(k);
      map.appendChild(el);
    }
  }

  $('emptySelection').hidden = !!selected;
  $('hexEditor').hidden = !selected;
  if (selected) populateEditor(state.hexes[selected] || { kind: 'empty' });
}

render();
