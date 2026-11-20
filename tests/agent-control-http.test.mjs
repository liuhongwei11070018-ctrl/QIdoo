import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import {createControlHub} from '../packages/agent-control/control-hub.mjs';
import {runAgentControl} from '../packages/agent-control/agent-control-client.mjs';

test('loopback HTTP control waits for a real cooperative executor, resumes it, and reports callback failure',async t=>{
 const hub=createControlHub(),journal=[],stop=new AbortController();
 let ready;const registered=new Promise(resolve=>{ready=resolve});
 const server=createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://127.0.0.1');
   if(url.pathname!=='/api/future/control'){res.writeHead(404).end();return}
   if(req.method==='GET'){res.setHeader('content-type','application/json');res.end(JSON.stringify(hub.snapshot(url.searchParams.get('id')||undefined)));return}
   let raw='';for await(const chunk of req)raw+=chunk;
   const body=JSON.parse(raw);journal.push(body.type);let result;
   if(body.type==='register'){result=hub.register(body);ready()}
   else if(body.type==='poll')result=hub.poll(body);
   else if(body.type==='ack'){journal.push('ack:'+body.ok);result=hub.acknowledge(body)}
   else if(body.type==='command')result=hub.request(body);
   else throw new Error('Unknown type');
   res.setHeader('content-type','application/json');res.end(JSON.stringify(result));
  }catch(e){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({error:e.message}))}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const office='http://127.0.0.1:'+server.address().port;
 let paused=false,inFlight=0,completed=0,rejectNextPause=false;
 const tick=setInterval(()=>{
  if(paused)return;inFlight++;
  void delay(18).then(()=>{inFlight--;completed++});
 },8);
 const errors=[];
 const running=runAgentControl({office,agentId:'ai-01',state:'running',signal:stop.signal,onError:e=>errors.push(e),
  onPause:async({signal})=>{
   if(rejectNextPause)throw new Error('Safe point unavailable');
   paused=true;
   while(inFlight){signal.throwIfAborted();await delay(2)}
   journal.push('executor:drained');return {state:'paused'};
  },
  onResume:async()=>{paused=false;journal.push('executor:resumed');return {state:'running'}},
 });
 t.after(async()=>{stop.abort();clearInterval(tick);await running;await new Promise(resolve=>server.close(resolve))});
 const post=async body=>{
  const response=await fetch(office+'/api/future/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal(response.status,200);return response.json();
 };
 const awaitBatch=async id=>{
  const deadline=Date.now()+4500;
  while(Date.now()<deadline){const response=await fetch(office+'/api/future/control?id='+id);assert.equal(response.status,200);const data=await response.json();if(data.batch.status!=='pending')return data;await delay(15)}
  assert.fail('HTTP executor did not acknowledge before test deadline');
 };
 await registered;
 await delay(40);assert.ok(completed>0,'executor must be genuinely working first');
 const pause=await post({type:'command',action:'pause',agentIds:['ai-01']});
 const pausedResult=await awaitBatch(pause.id);
 assert.equal(pausedResult.batch.status,'applied');assert.equal(pausedResult.runners[0].state,'paused');assert.equal(paused,true);assert.equal(inFlight,0);
 assert.ok(journal.indexOf('executor:drained')<journal.indexOf('ack:true'),'confirmation must follow draining');
 const atPause=completed;await delay(45);assert.equal(completed,atPause,'no execution continues after pause receipt');
 const resume=await post({type:'command',action:'resume',agentIds:['ai-01']});
 const resumedResult=await awaitBatch(resume.id);
 assert.equal(resumedResult.batch.status,'applied');assert.equal(resumedResult.runners[0].state,'running');await delay(45);assert.ok(completed>atPause,'resume must restart actual work');
 rejectNextPause=true;
 const fail=await post({type:'command',action:'pause',agentIds:['ai-01']});
 const failedResult=await awaitBatch(fail.id);
 assert.equal(failedResult.batch.status,'failed');assert.equal(failedResult.batch.results[0].message,'Safe point unavailable');assert.equal(failedResult.runners[0].state,'running');assert.equal(paused,false);
 assert.deepEqual(errors,[]);
 t.diagnostic('Ephemeral loopback HTTP: command → poll → drain/resume callback → ack → public snapshot verified. No 4312 data or user task was touched.');
});
