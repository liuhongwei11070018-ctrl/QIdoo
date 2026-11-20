import {placeSceneBubbles} from '../packages/scene-layout/scene-bubble-layout.js';
import {placeScenePopover} from '../packages/scene-layout/scene-popover-layout.js';

const bubbles = placeSceneBubbles({
  width: 800,
  height: 600,
  labels: [{id: 'researcher', left: 280, top: 260, width: 64, height: 28}],
  bubbles: [{id: 'researcher', status: 'working', width: 196, height: 48}],
});
const popover = placeScenePopover({
  width: 800,
  height: 600,
  cardWidth: 260,
  cardHeight: 160,
  anchor: {visible: true, x: 320, y: 280},
});
console.log(JSON.stringify({bubbles, popover}, null, 2));
