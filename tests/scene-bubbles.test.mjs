import test from 'node:test';
import assert from 'node:assert/strict';
import {placeSceneBubbles} from '../packages/scene-layout/scene-bubble-layout.js';

const intersects = (a, b) => a.left < b.left+b.width && a.left+a.width > b.left && a.top < b.top+b.height && a.top+a.height > b.top;
const label = (id, left, top) => ({id,left,top,width:64,height:28});
const bubble = (id, status='working') => ({id,status,width:196,height:48});

test('a task bubble clears its owner and every other employee name', () => {
  const labels = [label('a',160,260),label('b',220,200),label('c',100,160)];
  const bubbles = [bubble('a'),bubble('b'),bubble('c','error')];
  const placed = placeSceneBubbles({width:600,height:500,labels,bubbles});
  assert.ok(placed.length > 0);
  for (const position of placed) {
    const box = {...position,...bubbles.find(b => b.id===position.id)};
    for (const name of labels) assert.equal(intersects(box,name),false);
    for (const other of placed.filter(p=>p.id!==position.id)) assert.equal(intersects(box,{...other,...bubbles.find(b=>b.id===other.id)}),false);
  }
});

test('limited room prioritizes errors and keeps names uncovered instead of clamping', () => {
  const labels = [label('normal',140,90),label('error',140,90)];
  const placed = placeSceneBubbles({width:360,height:300,labels,bubbles:[bubble('normal'),bubble('error','error')]});
  assert.deepEqual(placed.map(p=>p.id),['error']);
  assert.deepEqual(placeSceneBubbles({width:360,height:300,labels:[label('a',140,30)],bubbles:[bubble('a')]}),[]);
});

test('hiding a name or leaving the scene also removes the related bubble', () => {
  assert.deepEqual(placeSceneBubbles({width:600,height:500,labels:[],bubbles:[bubble('gone')]}),[]);
});

test('measured toolbar obstacles and previous offsets survive camera changes', () => {
  const options = {width:600,height:500,labels:[label('a',160,260)],bubbles:[bubble('a')],obstacles:[{left:100,top:190,width:30,height:26}]};
  const first = placeSceneBubbles(options);
  assert.ok(first[0].shift > 0 || first[0].offset !== 0);
  assert.deepEqual(placeSceneBubbles({...options,previous:first}),first);
  assert.equal(intersects({...first[0],width:196,height:54},options.obstacles[0]),false);
});

test('a valid detour stays attached to its owner after a neighbor moves away', () => {
  const options = {width:600,height:500,labels:[label('a',160,260)],bubbles:[bubble('a')],obstacles:[{left:100,top:190,width:30,height:26}]};
  const detour = placeSceneBubbles(options);
  assert.ok(detour[0].shift > 0 || detour[0].offset !== 0);
  const [centered] = placeSceneBubbles({...options,obstacles:[],previous:detour});
  assert.equal(centered.shift,detour[0].shift);
  assert.equal(centered.offset,detour[0].offset);
  assert.equal(centered.left+centered.arrow,192);
  assert.equal(centered.top+48+6,260-6-centered.shift);
});

test('tails point at the owner even after an edge clamp, or the bubble yields', () => {
  const options = {width:360,height:300,bubbles:[bubble('a')]};
  assert.deepEqual(placeSceneBubbles({...options,labels:[label('a',-30,200)]}),[]);
  const [position] = placeSceneBubbles({...options,labels:[label('a',-3,200)]});
  assert.equal(position.left+position.arrow,29);
  assert.ok(position.shift<=24);
});

test('subpixel obstacle motion does not make a valid bubble alternate between slots', () => {
  const options = {width:600,height:500,labels:[label('a',160,260)],bubbles:[bubble('a')],obstacles:[{left:100,top:190,width:30,height:26}]};
  const first = placeSceneBubbles(options);
  let previous = first;
  for (let frame=0; frame<120; frame++) {
    const next=placeSceneBubbles({...options,obstacles:options.obstacles.map(rect=>({...rect,left:rect.left+Math.sin(frame)*1.5})),previous});
    assert.equal(next[0].offset,first[0].offset);
    assert.equal(next[0].shift,first[0].shift);
    previous=next;
  }
});

test('a crowded task keeps an accessible compact target beside its owner', () => {
  const labels=[label('a',160,140)];
  const bubbles=[{...bubble('a'),compactWidth:28,compactHeight:28}];
  const placed=placeSceneBubbles({width:600,height:500,labels,bubbles,obstacles:[{left:20,top:40,width:550,height:86}]});
  assert.equal(placed.length,1);
  assert.equal(placed[0].compact,true);
  assert.equal(placed[0].left,160+64+8);
  assert.equal(intersects({...placed[0],width:28,height:28},labels[0]),false);
});

test('a compact task expands when sufficient space returns without using its compact size as the full size', () => {
  const options={width:600,height:500,labels:[label('a',160,140)],bubbles:[{...bubble('a'),compactWidth:28,compactHeight:28}]};
  const previous=placeSceneBubbles({...options,obstacles:[{left:20,top:40,width:550,height:86}]});
  assert.equal(previous[0].compact,true);
  const [expanded]=placeSceneBubbles({...options,previous});
  assert.equal(!!expanded.compact,false);
  assert.equal(expanded.left,94);
});

test('dense layouts stay inside phone and desktop viewports without overlap', () => {
  let seed=19;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  for(let sample=0;sample<600;sample++) {
    const width=sample%2?366:940,height=sample%2?650:740;
    const labels=Array.from({length:6},(_,i)=>label(String(i),random()*(width-64),40+random()*(height-80)));
    const bubbles=labels.slice(0,3).map((name,i)=>({...bubble(name.id,i===2?'error':'working'),width:sample%2?180:210}));
    const placed=placeSceneBubbles({width,height,labels,bubbles});
    const boxes=placed.map(p=>({...p,width:bubbles.find(b=>b.id===p.id).width,height:54}));
    boxes.forEach((box,i)=>{
      assert.ok(box.left>=12&&box.top>=12&&box.left+box.width<=width-11&&box.top+box.height<=height-11);
      assert.ok(box.shift <= 24 && Math.abs(box.offset) <= 64);
      labels.forEach(name=>assert.equal(intersects(box,name),false));
      boxes.slice(i+1).forEach(other=>assert.equal(intersects(box,other),false));
    });
  }
});
