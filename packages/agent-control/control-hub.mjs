import {randomUUID, timingSafeEqual} from 'node:crypto';

// Cooperative execution: a registered runner must confirm the actual action.
export function createControlHub({now=()=>Date.now(),id=randomUUID}={}) {
  const runners=new Map(),batches=new Map();
  const validAgent=value=>typeof value==='string'&&/^ai-[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value);
  const authenticate=(agentId,token)=>{const r=runners.get(agentId);if(!r||typeof token!=='string'||token.length!==r.token.length||!timingSafeEqual(Buffer.from(token),Buffer.from(r.token)))throw new Error('Invalid runner credentials');return r};
  const register=({agentId,kind='script',state='unknown'})=>{if(!validAgent(agentId))throw new Error('Invalid agentId');const previous=runners.get(agentId);if(previous&&now()-previous.seen<15000)throw new Error('Runner already connected');if(!['script','codex'].includes(kind)||!['unknown','running','paused'].includes(state))throw new Error('Invalid runner metadata');const r={agentId,kind,token:id(),seen:now(),state};runners.set(agentId,r);return {...r}};
  const publicBatch=b=>({...b,results:b.results.map(r=>({...r})),status:b.results.some(r=>r.status==='pending')?'pending':b.results.every(r=>r.status==='applied')?'applied':'failed'});
  function expire(){for(const b of batches.values())for(const r of b.results)if(r.status==='pending'&&now()>b.expiresAt)r.status='expired';for(const [key,b]of batches)if(now()-b.createdAt>3600000)batches.delete(key)}
  function request({action,agentIds}) {
    expire();
    // Control batches follow the connected runner set.  The six desks in the
    // scene are not a workforce or control-plane limit.
    if(!['pause','resume'].includes(action)||!Array.isArray(agentIds)||!agentIds.length||new Set(agentIds).size!==agentIds.length)throw new Error('Invalid control request');
    if([...batches.values()].some(b=>publicBatch(b).status==='pending'))throw new Error('Wait for the previous command');
    for(const agentId of agentIds){const r=runners.get(agentId);if(!r||now()-r.seen>=15000)throw new Error('Some agents have no connected control runner')}
    const b={id:id(),action,createdAt:now(),expiresAt:now()+30000,results:agentIds.map(agentId=>({agentId,status:'pending'}))};batches.set(b.id,b);return publicBatch(b);
  }
  function poll({agentId,token}){expire();const r=authenticate(agentId,token);r.seen=now();return [...batches.values()].filter(b=>b.results.some(x=>x.agentId===agentId&&x.status==='pending')).map(b=>({id:b.id,action:b.action,expiresAt:b.expiresAt}))}
  function acknowledge({agentId,token,commandId,ok,message,state}){expire();const runner=authenticate(agentId,token),b=batches.get(commandId),r=b?.results.find(x=>x.agentId===agentId);if(!r||r.status!=='pending')throw new Error('Command is no longer pending');if(typeof ok!=='boolean')throw new Error('ok must be boolean');r.status=ok?'applied':'failed';r.message=typeof message==='string'?message.slice(0,200):'';if(ok)runner.state=['idle','running','paused'].includes(state)?state:b.action==='pause'?'paused':'running';runner.seen=now();return publicBatch(b)}
  function snapshot(commandId){expire();return {runners:[...runners.values()].map(r=>({agentId:r.agentId,connected:now()-r.seen<15000,state:r.state,kind:r.kind})),batch:commandId&&batches.has(commandId)?publicBatch(batches.get(commandId)):undefined}}
  function remove({agentId}){expire();const runner=runners.get(agentId);if(!runner)throw new Error('Runner not found');if(now()-runner.seen<15000)throw new Error('Disconnect the runner first');if([...batches.values()].some(b=>b.results.some(r=>r.agentId===agentId&&r.status==='pending')))throw new Error('Wait for pending commands');runners.delete(agentId);return snapshot()}
  return {register,request,poll,acknowledge,snapshot,remove};
}
const key=Symbol.for('trimr.office.control');
export const controlHub=globalThis[key]||(globalThis[key]=createControlHub());
