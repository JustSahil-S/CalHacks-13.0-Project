// Daily revenue across all copies of each option: the median line plus a band covering the
// middle 80% of futures. Plain SVG, so it stays crisp in the paper sheet.

export interface Series {
  label: string;
  color: string;
  copies: number[][]; // copies[k][day] = revenue (dollars)
}

const quantile = (sorted: number[], q: number) => {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
};

/** 7-day rolling mean, so daily noise doesn't hide the trend. */
const smooth = (xs: number[]) => xs.map((_, i) => {
  const w = xs.slice(Math.max(0, i - 6), i + 1);
  return w.reduce((a, b) => a + b, 0) / w.length;
});

export function drawChart(svg: SVGSVGElement, legend: HTMLElement, series: Series[], dayCursor: number | null) {
  const W = 320, H = 150, padL = 34, padB = 16, padT = 6;
  const days = Math.max(1, ...series.flatMap(s => s.copies.map(c => c.length)));
  const bands = series.map(s => {
    const sm = s.copies.map(smooth);
    const lo: number[] = [], mid: number[] = [], hi: number[] = [];
    for (let d = 0; d < days; d++) {
      const vals = sm.map(c => c[d]).filter(v => v !== undefined).sort((a, b) => a - b);
      lo.push(quantile(vals, 0.1));
      mid.push(quantile(vals, 0.5));
      hi.push(quantile(vals, 0.9));
    }
    return { ...s, lo, mid, hi };
  });
  const all = bands.flatMap(b => [...b.lo, ...b.hi]).filter(v => v > 0);
  const yMin = all.length ? Math.min(...all) * 0.97 : 0;
  const yMax = all.length ? Math.max(...all) * 1.03 : 1;
  const x = (d: number) => padL + (d / Math.max(1, days - 1)) * (W - padL - 4);
  const y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - padT - padB);
  const path = (vals: number[]) => vals.map((v, d) => `${d ? 'L' : 'M'}${x(d).toFixed(1)},${y(v).toFixed(1)}`).join('');

  let out = '';
  for (const t of [yMin, (yMin + yMax) / 2, yMax]) {
    out += `<line x1="${padL}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(31,28,24,.08)"/>`;
    out += `<text x="${padL - 4}" y="${y(t) + 3}" text-anchor="end" font-family="IBM Plex Mono" font-size="8" fill="#958c7c">$${Math.round(t)}</text>`;
  }
  out += `<text x="${padL}" y="${H - 3}" font-family="IBM Plex Mono" font-size="8" fill="#958c7c">day 1</text>`;
  out += `<text x="${W - 4}" y="${H - 3}" text-anchor="end" font-family="IBM Plex Mono" font-size="8" fill="#958c7c">day ${days}</text>`;
  for (const b of bands) {
    const band = `${path(b.hi)}L${b.lo.map((v, d) => `${x(d).toFixed(1)},${y(v).toFixed(1)}`).reverse().join('L')}Z`;
    out += `<path d="${band}" fill="${b.color}" opacity=".16"/>`;
    out += `<path d="${path(b.mid)}" fill="none" stroke="${b.color}" stroke-width="1.6"/>`;
  }
  if (dayCursor !== null && dayCursor >= 0) {
    out += `<line x1="${x(dayCursor)}" x2="${x(dayCursor)}" y1="${padT}" y2="${H - padB}" stroke="#1f1c18" stroke-dasharray="2 2" opacity=".5"/>`;
  }
  svg.innerHTML = out;
  legend.innerHTML = series
    .map(s => `<span><i style="background:${s.color}"></i>${s.label}</span>`)
    .join('') + '<span style="margin-left:auto">daily revenue · median + middle 80%</span>';
}
