'use client';

import {useCallback,useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import './office-select.css';

type Option<T extends string>={value:T;label:string;hint?:number|string;disabled?:boolean};
type Props<T extends string>={
  value:T;
  options:Option<T>[];
  onChange:(value:T)=>void;
  label:string;
  disabled?:boolean;
  id?:string;
};

/** Focus stays on the combobox so surrounding modal focus traps retain control of Tab. */
export default function OfficeSelect<T extends string>({value,options,onChange,label,disabled,id}:Props<T>){
  const generatedId=useId(),menuId=`${id||generatedId}-menu`;
  const trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null);
  const search=useRef({text:'',at:0});
  const [host,setHost]=useState<Element|null>(null),[active,setActive]=useState(-1);
  const selected=options.find(option=>option.value===value);
  const expanded=!!host&&!disabled&&options.length>0;
  const activeIndex=options[active]&&!options[active].disabled?active:options.findIndex(option=>!option.disabled);

  const place=useCallback(()=>{
    const anchor=trigger.current,list=menu.current;
    if(!anchor||!list)return;
    const rect=anchor.getBoundingClientRect(),viewport=window.visualViewport;
    const leftEdge=viewport?.offsetLeft||0,topEdge=viewport?.offsetTop||0;
    const viewportWidth=viewport?.width||window.innerWidth,viewportHeight=viewport?.height||window.innerHeight;
    const edge=10,gap=6,width=Math.max(1,Math.min(Math.max(rect.width,200),viewportWidth-edge*2));
    list.style.width=`${width}px`;
    const desiredHeight=list.scrollHeight+2;
    const below=topEdge+viewportHeight-rect.bottom-gap-edge,above=rect.top-topEdge-gap-edge;
    const upward=below<Math.min(desiredHeight,160)&&above>below;
    const maxHeight=Math.max(1,Math.min(320,upward?above:below)),height=Math.min(desiredHeight,maxHeight);
    const left=Math.max(leftEdge+edge,Math.min(rect.left,leftEdge+viewportWidth-width-edge));
    const top=Math.max(topEdge+edge,Math.min(upward?rect.top-height-gap:rect.bottom+gap,topEdge+viewportHeight-height-edge));
    Object.assign(list.style,{left:`${left}px`,top:`${top}px`,maxHeight:`${maxHeight}px`});
  },[]);
  const open=(edge?:'first'|'last')=>{
    if(disabled||!options.length)return;
    const selectedIndex=options.findIndex(option=>option.value===value&&!option.disabled);
    const enabled=options.map((option,index)=>option.disabled?-1:index).filter(index=>index>=0);
    setActive(edge==='first'?(enabled[0]??-1):edge==='last'?(enabled.at(-1)??-1):selectedIndex>=0?selectedIndex:(enabled[0]??-1));
    search.current={text:'',at:0};
    setHost(trigger.current?.closest('dialog[open],[role="dialog"],[role="alertdialog"]')||trigger.current?.closest('.future-office')||document.body);
  };
  const close=(restoreFocus=false)=>{
    setHost(null);
    search.current={text:'',at:0};
    if(restoreFocus)trigger.current?.focus({preventScroll:true});
  };

  useEffect(()=>{
    if(!host||(!disabled&&options.length))return;
    const timer=setTimeout(()=>setHost(null),0);
    return()=>clearTimeout(timer);
  },[disabled,host,options.length]);

  useLayoutEffect(()=>{
    if(!expanded)return;
    const list=menu.current;
    // A top-layer popover escapes scroll/transform clipping while remaining a
    // DOM descendant of its dialog and inheriting the current theme and scale.
    if(list?.showPopover&&!list.matches(':popover-open'))list.showPopover();
    place();
  },[expanded,options,place]);
  useEffect(()=>{
    if(!expanded)return;
    const outside=(event:PointerEvent|FocusEvent)=>{
      if(!menu.current?.contains(event.target as Node)&&!trigger.current?.contains(event.target as Node))setHost(null);
    };
    let frame=0;
    const reposition=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(place)};
    const scroll=(event:Event)=>{
      if(menu.current?.contains(event.target as Node))return;
      const anchor=trigger.current,target=event.target;
      if(anchor&&(target===document||target===window||target instanceof Element&&target.contains(anchor))){
        const rect=anchor.getBoundingClientRect(),bounds=target instanceof Element?target.getBoundingClientRect():{top:0,left:0,bottom:window.innerHeight,right:window.innerWidth};
        if(rect.bottom<=bounds.top||rect.top>=bounds.bottom||rect.right<=bounds.left||rect.left>=bounds.right){setHost(null);return}
      }
      reposition();
    };
    const observer=new ResizeObserver(reposition);
    if(trigger.current)observer.observe(trigger.current);
    if(menu.current)observer.observe(menu.current);
    document.addEventListener('pointerdown',outside);
    document.addEventListener('focusin',outside);
    window.addEventListener('resize',reposition);
    window.addEventListener('scroll',scroll,true);
    window.visualViewport?.addEventListener('resize',reposition);
    window.visualViewport?.addEventListener('scroll',reposition);
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();
      document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);
      window.removeEventListener('resize',reposition);window.removeEventListener('scroll',scroll,true);
      window.visualViewport?.removeEventListener('resize',reposition);window.visualViewport?.removeEventListener('scroll',reposition);
    };
  },[expanded,place]);
  useLayoutEffect(()=>{
    if(!expanded)return;
    const list=menu.current,option=list?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`);
    if(!list||!option)return;
    if(option.offsetTop<list.scrollTop)list.scrollTop=option.offsetTop;
    else if(option.offsetTop+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=option.offsetTop+option.offsetHeight-list.clientHeight;
  },[activeIndex,expanded,options]);

  const move=(key:string)=>{
    const enabled=options.map((option,index)=>option.disabled?-1:index).filter(index=>index>=0);
    if(!enabled.length){setActive(-1);return}
    if(key==='Home'){setActive(enabled[0]);return}
    if(key==='End'){setActive(enabled[enabled.length-1]);return}
    const current=enabled.indexOf(activeIndex),direction=key==='ArrowDown'?1:-1;
    setActive(enabled[current<0?(direction>0?0:enabled.length-1):(current+direction+enabled.length)%enabled.length]);
  };
  const onKeyDown=(event:KeyboardEvent<HTMLButtonElement>)=>{
    if(event.nativeEvent.isComposing||disabled)return;
    if(event.key==='Escape'&&expanded){event.preventDefault();event.stopPropagation();close();return}
    if(event.key==='Tab'){if(expanded)close();return}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();event.stopPropagation();
      if(!expanded)open(event.key==='Home'?'first':event.key==='End'?'last':undefined);else move(event.key);
      return;
    }
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();event.stopPropagation();
      if(!expanded)open();else if(options[activeIndex]&&!options[activeIndex].disabled){onChange(options[activeIndex].value);close()}
      return;
    }
    if(event.key.length===1&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
      const now=Date.now(),key=event.key.toLocaleLowerCase();
      const text=now-search.current.at>700?key:search.current.text+key;
      const query=[...text].every(char=>char===key)?key:text;
      search.current={text,at:now};
      const start=query.length===1?activeIndex+1:Math.max(0,activeIndex);
      const index=options.map((_,offset)=>(start+offset+options.length)%options.length).find(index=>!options[index].disabled&&options[index].label.toLocaleLowerCase().startsWith(query));
      if(index!==undefined){event.preventDefault();event.stopPropagation();if(!expanded)open();setActive(index);search.current={text,at:now}}
    }
  };

  return <div className="fo-dropdown" data-office-select>
    <button ref={trigger} id={id} type="button" role="combobox" className="fo-dropdown-trigger" data-office-select-trigger disabled={disabled||!options.length} aria-label={`${label}: ${selected?.label||''}`} aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded?menuId:undefined} aria-activedescendant={expanded&&activeIndex>=0?`${menuId}-${activeIndex}`:undefined} onClick={()=>expanded?close():open()} onKeyDown={onKeyDown}>
      <span title={selected?.label}>{selected?.label||label}</span><svg className="fo-dropdown-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
    </button>
    {expanded&&createPortal(<div ref={menu} id={menuId} popover="manual" className="fo-dropdown-menu" data-office-select-menu role="listbox" aria-label={label}>
      {options.map((option,index)=><div key={option.value} id={`${menuId}-${index}`} role="option" aria-selected={option.value===value} aria-disabled={option.disabled||undefined} data-option-index={index} className={`fo-dropdown-option${activeIndex===index&&!option.disabled?' is-focused':''}`} onPointerMove={()=>{if(!option.disabled)setActive(index)}} onMouseDown={event=>event.preventDefault()} onClick={()=>{if(!option.disabled){onChange(option.value);close(true)}}}>
        <span className="fo-dropdown-option-label" title={option.label}>{option.label}</span>{option.hint!==undefined&&<span className="fo-dropdown-hint">{option.hint}</span>}<svg className="fo-dropdown-check" data-selected={option.value===value} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8 3 3 6-6"/></svg>
      </div>)}
    </div>,host!)}
  </div>;
}
