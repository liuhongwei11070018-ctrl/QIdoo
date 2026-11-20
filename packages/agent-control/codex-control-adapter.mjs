// CLI generated protocol schema: initialize, thread/resume, thread/read, turn/interrupt, turn/start.
export function createCodexController({rpc,threadId,pollMs=150,wait=ms=>new Promise(r=>setTimeout(r,ms))}) {
 let pausedTurn=null;
 const read=async()=>{const r=await rpc('thread/read',{threadId,includeTurns:true});if(!Array.isArray(r.thread?.turns))throw new Error('Codex did not return turn state');return r.thread.turns};
 return {
  async pause({signal}={}){
   const turns=await read(),active=turns.find(t=>t.status==='inProgress');
   if(signal?.aborted)throw new Error('Command expired');
   if(!active)return {state:pausedTurn?'paused':'idle',message:'当前没有正在运行的轮次'};
   await rpc('turn/interrupt',{threadId,turnId:active.id});
   const deadline=Date.now()+22000;
   while(Date.now()<deadline&&!signal?.aborted){const current=(await read()).find(t=>t.id===active.id);if(current&&current.status==='interrupted'){pausedTurn=active.id;return {state:'paused'}}if(current&&['completed','failed'].includes(current.status))return {state:'idle'};await wait(pollMs)}
   throw new Error('Codex did not confirm interruption');
  },
  async resume({signal}={}){
   if(signal?.aborted)throw new Error('Command expired');
   const turns=await read();if(signal?.aborted)throw new Error('Command expired');if(turns.some(t=>t.status==='inProgress'))return;
   if(!pausedTurn){if(['completed','failed'].includes(turns.at(-1)?.status))return {state:'idle',message:'任务已结束，无需恢复'};throw new Error('No turn paused by this bridge; resume it in Codex first')}
   if(turns.at(-1)?.id!==pausedTurn)throw new Error('Thread changed after pause; resume it in Codex');
   const result=await rpc('turn/start',{threadId,input:[{type:'text',text:'继续刚才被工作室下班控制中断的任务，从已有进度继续。',text_elements:[]}]});
   if(!result.turn?.id||!['inProgress','completed'].includes(result.turn.status))throw new Error('Codex did not confirm a new turn');
   pausedTurn=null;return {state:result.turn.status==='completed'?'idle':'running'};
  },
 };
}
