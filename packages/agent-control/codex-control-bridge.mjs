import {parseArgs} from 'node:util';
import {runAgentControl,localEndpoint} from './agent-control-client.mjs';
import {createCodexController} from './codex-control-adapter.mjs';
const {values}=parseArgs({options:{url:{type:'string'},thread:{type:'string'},agent:{type:'string'},office:{type:'string',default:'http://127.0.0.1:4312'}}});
if(!values.url||!values.thread||!/^ai-0[1-6]$/.test(values.agent||''))throw new Error('Usage: node packages/agent-control/codex-control-bridge.mjs --url ws://127.0.0.1:4500 --thread THREAD_ID --agent ai-01');
localEndpoint(values.url,['ws:']);localEndpoint(values.office);
const socket=new WebSocket(values.url),pending=new Map();let sequence=0;
const stopped=new AbortController();
const fail=()=>{stopped.abort();for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Codex connection closed'))}pending.clear()};
socket.addEventListener('close',fail);socket.addEventListener('error',fail);
socket.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.method&&m.id!==undefined){socket.send(JSON.stringify({id:m.id,error:{code:-32601,message:'Use Codex to answer approvals; QIdoo does not grant approvals'}}));return}const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message||'Codex rejected command')):p.resolve(m.result)});
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
const rpc=(method,params)=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Codex request timed out'))},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))});
try{
 await rpc('initialize',{clientInfo:{name:'trimr_control',version:'1.0.0'},capabilities:{experimentalApi:true}});socket.send(JSON.stringify({method:'initialized'}));
 await rpc('thread/resume',{threadId:values.thread,excludeTurns:true});
 const controller=createCodexController({rpc,threadId:values.thread});
 console.log('Control bridge connected. Codex pauses by interrupting; resume starts a continuation turn.');
 await runAgentControl({office:values.office,agentId:values.agent,kind:'codex',onPause:controller.pause,onResume:controller.resume,signal:stopped.signal});
}finally{socket.close()}
