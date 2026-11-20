/* Adapted from My Office's interact/place-chips.js (MIT). Keep local placements
   attached to their owner; use a compact task button when the full text cannot fit. */
const overlaps = (a, b, gap = 6) => a.left < b.left + b.width + gap && a.left + a.width + gap > b.left && a.top < b.top + b.height + gap && a.top + a.height + gap > b.top;
const rank = status => status === 'error' ? 0 : status === 'waiting' ? 1 : 2;

export function placeSceneBubbles({width, height, labels, bubbles, obstacles = [], previous = []}) {
  const occupied = [...labels, ...obstacles];
  const placed = [];
  for (const bubble of [...bubbles].sort((a, b) => rank(a.status) - rank(b.status))) {
    const label = labels.find(label => label.id === bubble.id);
    if (!label || bubble.width > width - 24 || label.left + label.width < 0 || label.left > width || label.top + label.height < 0 || label.top > height) continue;
    const anchor = label.left + label.width / 2;
    const last = previous.find(item => item.id === bubble.id);
    // Retain a valid detour. Re-centering on every frame used to make moving
    // neighbors push a bubble back and forth across collision boundaries.
    const candidates = [
      ...(last && !last.compact ? [{shift: last.shift, offset: last.offset || 0, retained: true}] : []),
      {shift: 0, offset: 0},
      ...[0, 8, 16, 24].flatMap(shift => [0, 24, -24, 48, -48].map(offset => ({shift, offset}))),
    ];
    let found = false;
    for (const {shift, offset, retained} of candidates) {
      const left = Math.round(Math.max(12, Math.min(width - bubble.width - 12, anchor - bubble.width / 2 + offset)));
      const top = label.top - bubble.height - 12 - shift;
      const arrow = anchor - left;
      // An edge clamp must never make the tail point at a neighboring owner.
      if (arrow < 12 || arrow > bubble.width - 12) continue;
      // The tail is part of the footprint. Never clamp over the owner's name.
      const footprint = {left, top: Math.round(top), width: bubble.width, height: bubble.height + 6};
      // A little hysteresis absorbs subpixel head motion without permitting an
      // actual overlap. New placements require more space than retained ones.
      const gap = retained ? 2 : last?.compact ? 12 : 6;
      if (top < 12 || top + footprint.height > height - 12 || occupied.some(rect => overlaps(footprint, rect, gap))) continue;
      placed.push({id: bubble.id, left, top: footprint.top, shift, offset, arrow: Math.round(arrow)});
      occupied.push(footprint);
      found = true;
      break;
    }
    if (found || !bubble.compactWidth || !bubble.compactHeight) continue;
    const w = bubble.compactWidth, h = bubble.compactHeight;
    const beside = [
      {side:'right', left: label.left + label.width + 8, top: label.top + (label.height - h) / 2},
      {side:'left', left: label.left - w - 8, top: label.top + (label.height - h) / 2},
      {side:'above', left: anchor - w / 2, top: label.top - h - 8},
      {side:'below', left: anchor - w / 2, top: label.top + label.height + 8},
    ];
    if (last?.compact) beside.sort((a,b) => Number(b.side === last.side) - Number(a.side === last.side));
    for (const candidate of beside) {
      const footprint = {left:Math.round(candidate.left), top:Math.round(candidate.top), width:w, height:h};
      if (footprint.left < 12 || footprint.left + w > width - 12 || footprint.top < 12 || footprint.top + h > height - 12 || occupied.some(rect => overlaps(footprint, rect, 2))) continue;
      placed.push({id:bubble.id, left:footprint.left, top:footprint.top, shift:0, offset:0, arrow:Math.round(anchor-footprint.left), compact:true, side:candidate.side});
      occupied.push(footprint);
      break;
    }
  }
  return placed;
}
