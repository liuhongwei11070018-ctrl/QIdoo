const clamp=(value,min,max)=>Math.max(min,Math.min(Math.max(min,max),value));
const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

// Prefer a nearby free side of the complete projected companion, not just its head.
export function placeScenePopover({width,height,cardWidth,cardHeight,anchor,placement='auto'}){
  const visible=!!anchor?.visible,maxLeft=width-cardWidth-16,maxTop=height-cardHeight-66;
  const x=visible?clamp(anchor.x,18,width-18):width-cardWidth/2-16;
  const y=visible?clamp(anchor.y,24,height-74):64;
  const body=anchor?.avoid||{left:x-12,right:x+12,top:y-12,bottom:y+12};
  if(visible&&placement==='above'){
    const left=clamp(x-cardWidth/2,16,maxLeft),top=clamp(body.top-cardHeight-14,16,maxTop),arrow=clamp(x-left,24,cardWidth-24);
    return {left,top,arrow,above:true,x,y,tipX:left+arrow,tipY:top+cardHeight+7,visible};
  }
  const candidates=visible?[
    {left:x-cardWidth/2,top:body.top-cardHeight-20},
    {left:x-cardWidth/2,top:body.bottom+20},
    {left:body.right+20,top:y-cardHeight/2},
    {left:body.left-cardWidth-20,top:y-cardHeight/2},
    {left:16,top:16},{left:maxLeft,top:16},
    {left:16,top:maxTop},{left:maxLeft,top:maxTop},
  ]:[{left:x-cardWidth/2,top:64}];
  const padded={left:body.left-10,right:body.right+10,top:body.top-10,bottom:body.bottom+10};
  const ranked=candidates.map((candidate,index)=>{
    const left=clamp(candidate.left,16,maxLeft),top=clamp(candidate.top,16,maxTop);
    const rect={left,top,right:left+cardWidth,bottom:top+cardHeight};
    const distance=Math.hypot(clamp(x,rect.left,rect.right)-x,clamp(y,rect.top,rect.bottom)-y);
    return {left,top,score:overlap(rect,padded)*1000+distance+index*2};
  }).sort((a,b)=>a.score-b.score);
  const {left,top}=ranked[0],above=top+cardHeight/2<y;
  const arrow=clamp(x-left,24,cardWidth-24);
  return {left,top,arrow,above,x,y,tipX:left+arrow,tipY:above?top+cardHeight+7:top-7,visible};
}
