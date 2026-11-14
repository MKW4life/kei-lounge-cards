import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require=createRequire(import.meta.url);
function loadTs(relative,bindings={}){
 const filename=new URL(relative,import.meta.url);
 const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const compiledModule={exports:{}};
 vm.runInNewContext(code,{module:compiledModule,exports:compiledModule.exports,require,console,URLSearchParams,...bindings},{filename:filename.pathname});
 return compiledModule.exports.default;
}
async function harness({auto=true}={}){
 const Page=loadTs('../app/card/page.tsx',{require:name=>name==='./CardClient'?{__esModule:true,default:()=>null}:require(name)});
 const initial=(await Page({searchParams:Promise.resolve({lounge:'frozen',events:'999',vevents:'1',auto:auto?'1':'0',refresh:'15'})})).props.initial;
 let stateIndex=0,refIndex=0,effects=[];
 const states=[],refs=[],intervals=[],responses=[];
 const hooks={
  useState(value){const i=stateIndex++;if(!(i in states))states[i]=value;return [states[i],next=>{states[i]=typeof next==='function'?next(states[i]):next;}];},
  useRef(value){const i=refIndex++;return refs[i]??(refs[i]={current:value});},
  useEffect(run,deps){effects.push({run,deps});},
 };
 const Card=loadTs('../app/card/CardClient.tsx',{
  require:name=>name==='react'?hooks:name.startsWith('@/components/')?{__esModule:true,default:()=>null}:require(name),
  fetch:async()=>{const value=responses.shift();if(value instanceof Error)throw value;return {ok:value?.ok!==false,json:async()=>value};},
  setInterval:fn=>{intervals.push(fn);return intervals.length;},clearInterval(){},clearTimeout(){},
 });
 const render=()=>{stateIndex=0;refIndex=0;effects=[];return Card({initial});};
 function eventText(node){
  if(!node||typeof node!=='object')return undefined;
  if(node.props?.className?.split(' ').includes('event-line'))return node.props.children;
  for(const child of [node.props?.children].flat(Infinity)){const result=eventText(child);if(result!==undefined)return result;}
 }
 const initialText=eventText(render());
 const live=effects.find(e=>e.deps?.length===1&&e.deps[0]===initial);
 const response=totalEvents=>({currentMmr:100,currentLr:200,rankNumber:null,rankText:'',emblemUrl:'',totalEvents});
 return {initialText,response,text:()=>eventText(render()),start(value){responses.push(value);return live.run();},async tick(value){responses.push(value);intervals[0]();await new Promise(setImmediate);},async flush(){await new Promise(setImmediate);},intervals};
}

test('OBS Events update with the initial rating fetch and every poll even if ratings are unchanged',async()=>{
 const h=await harness();assert.equal(h.initialText,'999 Events');
 const cleanup=h.start(h.response(31));await h.flush();assert.equal(h.text(),'31 Events');
 await h.tick(h.response(32));assert.equal(h.text(),'32 Events');cleanup();
});
test('zero Events is valid; missing, invalid and failed responses preserve the latest count',async()=>{
 const h=await harness();const cleanup=h.start(h.response(31));await h.flush();
 await h.tick(h.response(0));assert.equal(h.text(),'0 Events');
 for(const value of [undefined,null,-1,1.5,'bad']){await h.tick(h.response(value));assert.equal(h.text(),'0 Events');}
 await h.tick(new Error('offline'));assert.equal(h.text(),'0 Events');
 await h.tick({ok:false});assert.equal(h.text(),'0 Events');cleanup();
});
test('manual cards keep URL Events and do not start live polling',async()=>{
 const h=await harness({auto:false});h.start(h.response(31));await h.flush();
 assert.equal(h.text(),'999 Events');assert.equal(h.intervals.length,0);
});
