import {setTimeout as delay} from 'node:timers/promises';

export function localEndpoint(value, protocols=['http:']) {
 const url=new URL(value);
 if(!protocols.includes(url.protocol)||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.username||url.password)throw new Error('Only loopback endpoints are supported');
 return url;
}
// Callbacks must finish the real operation before returning. Honour signal for deadlines.
export async function runAgentControl({office='http://127.0.0.1:4312',agentId,kind='script',state='unknown',onPause,onResume,signal,fetcher=fetch,onError=console.error}) {
 localEndpoint(office);if(typeof onPause!=='function'||typeof onResume!=='function')throw new Error('Both execution callbacks are required');
 const request=async body=>{const res=await fetcher(new URL('/api/future/control',office),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(5000)});const data=await res.json();if(!res.ok)throw new Error(data.error||'Control request failed');return data};
 const {token}=await request({type:'register',agentId,kind,state});
 const results=new Map();let busy=false;
 const heartbeat=setInterval(()=>{if(busy&&!signal?.aborted)void request({type:'poll',agentId,token}).catch(onError)},4000);
 try{while(!signal?.aborted){
   const commands=await request({type:'poll',agentId,token});
   for(const cmd of commands){
     if(signal?.aborted)break;if(Date.now()>=cmd.expiresAt)continue;
     let result=results.get(cmd.id);busy=true;
     if(!result){const controller=new AbortController();const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,Math.max(1,cmd.expiresAt-Date.now()-500));
       try{const receipt=await (cmd.action==='pause'?onPause:onResume)({signal:controller.signal,commandId:cmd.id});if(controller.signal.aborted)throw new Error('Execution confirmation timed out');result={ok:true,...(receipt&&typeof receipt==='object'?{state:receipt.state,message:receipt.message}:{})};}
       catch(error){result={ok:false,message:error instanceof Error?error.message:'Execution failed'};}
       finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
       results.set(cmd.id,result);if(results.size>100)results.delete(results.keys().next().value);
     }
     try{await request({type:'ack',agentId,token,commandId:cmd.id,...result})}catch(error){onError(error)}finally{busy=false}
   }
   await delay(900,undefined,{signal}).catch(()=>{});
 }}finally{clearInterval(heartbeat)}
}
