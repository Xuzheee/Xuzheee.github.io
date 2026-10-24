// This runs inside the supplied model closure, sharing its camera and buildings.
const updateTownCallouts = (() => {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.id = 'town-guides';
  svg.setAttribute('aria-hidden', 'true');
  wrap.appendChild(svg);
  const notes = { home: '回到开场', about: '教育与经历', works: '项目与实践', interests: '游戏 · 音乐 · 生活', blog: '文章与记录' };
  const entries = ORDER.map(key => {
    const button = nav.querySelector(`button[data-k="${key}"]`);
    button.dataset.note = notes[key];
    button.innerHTML = `<strong>${LINKS[key].cn}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></strong><small>${notes[key]}</small>`;
    button.setAttribute('aria-label', `前往${LINKS[key].cn}`);
    if (key === 'home') button.setAttribute('aria-current', 'page');
    button.addEventListener('focus', () => setHover(key));
    button.addEventListener('blur', () => setHover(null));
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('class', 'town-guide');
    group.dataset.k = key;
    const path = document.createElementNS(svgNS, 'path');
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('r', '2.4');
    group.append(path, dot);
    svg.appendChild(group);
    const b = buildings[key];
    const point = new THREE.Vector3((b.x0 + b.x1) / 2, b.y + b.h, b.z1 + .15);
    return { key, button, group, path, dot, point, projected: new THREE.Vector3(), layout: null };
  });
  let lastW = 0, lastH = 0;
  const round = value => Math.round(value * 10) / 10;
  return () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (w < 1 || h < 1) return;
    if (w !== lastW || h !== lastH || !entries[0].layout) {
      lastW = w; lastH = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const mobile = w < 620, compact = w < 1100;
      const labelW = mobile ? 102 : compact ? 122 : 158;
      const edge = mobile ? 8 : compact ? 14 : 32;
      const positions = {
        about: { side: 'top', x: (w - labelW) / 2, y: mobile ? 8 : 20 },
        home: { side: 'left', x: edge, y: mobile ? h * .24 : h * (compact ? .25 : .31) },
        works: { side: 'right', x: w - edge - labelW, y: mobile ? h * .26 : h * (compact ? .24 : .28) },
        interests: { side: 'left', x: edge, y: h * (mobile ? .79 : compact ? .81 : .64) },
        blog: { side: 'right', x: w - edge - labelW, y: h * (mobile ? .79 : compact ? .79 : .62) },
      };
      for (const entry of entries) {
        const layout = positions[entry.key];
        entry.button.dataset.side = layout.side;
        Object.assign(entry.button.style, { left: `${layout.x}px`, top: `${layout.y}px`, width: `${labelW}px` });
        entry.layout = { ...layout, width: labelW, height: entry.button.offsetHeight };
      }
    }
    camera.updateMatrixWorld();
    for (const entry of entries) {
      const p = entry.projected.copy(entry.point).project(camera);
      const x = round((p.x * .5 + .5) * w), y = round((-p.y * .5 + .5) * h);
      const l = entry.layout, baseline = round(l.y + l.height + 4);
      let d;
      if (l.side === 'top') {
        const sx = round(l.x + l.width / 2), elbow = round((baseline + y) / 2);
        d = `M${sx} ${baseline}V${elbow}L${x} ${y}`;
      } else {
        const start = l.side === 'left' ? l.x : l.x + l.width;
        const elbow = l.side === 'left' ? l.x + l.width + 12 : l.x - 12;
        d = `M${round(start)} ${baseline}H${round(elbow)}L${x} ${y}`;
      }
      entry.path.setAttribute('d', d);
      entry.dot.setAttribute('cx', String(x));
      entry.dot.setAttribute('cy', String(y));
      const active = hovered === entry.key || walking?.key === entry.key || document.activeElement === entry.button;
      entry.group.classList.toggle('is-active', active);
    }
  };
})();
