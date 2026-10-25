import {analyzeLog,toMarkdown,nextCheck} from './analyzer.js';
const $=id=>document.getElementById(id),input=$('logs');let snapshot=null;
const example=[
'2026-10-25T09:01:00Z INFO api request accepted request_id=req-41',
'2026-10-25T09:02:00Z ERROR worker upstream timeout after 5000ms request_id=req-42 token=synthetic-example',
'2026-10-25T09:03:00Z ERROR worker upstream timeout after 8000ms request_id=req-43 token=synthetic-other',
'2026-10-25T09:04:00Z WARN worker retry budget almost exhausted host=192.0.2.10',
'2026-10-25T09:05:00Z INFO worker recovered',
'2026-10-25T09:06:00Z INFO api request complete email=synthetic@example.test'].join('\n');
function status(text,error=false){$('status').textContent=text;$('status').className=error?'error':'';}
function el(tag,text,css=''){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(css)n.className=css;return n;}
function invalidate(message='Input changed. Analyze again to refresh the brief.'){
 snapshot=null;$('download').disabled=true;$('report').hidden=true;$('empty-report').hidden=false;$('groups').replaceChildren();$('sanitized').textContent='';
 const lines=input.value.split(/\r?\n/).filter(v=>v.trim()).length,bytes=new TextEncoder().encode(input.value).length;
 $('input-size').textContent=lines+' lines · '+(bytes/1024).toFixed(1)+' KiB';status(message);
}
function render(r){
 $('metrics').replaceChildren(...[['Lines',r.counts.total,''],['Errors',r.counts.error,'error'],['Warnings',r.counts.warn,'warn'],['Other',r.counts.info+r.counts.debug+r.counts.unknown,'']].map(([label,value,css])=>{const n=el('div',undefined,'metric '+css);n.append(el('strong',String(value)),el('span',label));return n;}));
 $('groups').replaceChildren(...r.groups.slice(0,8).map(g=>{
 const n=el('article',undefined,'group'),h=el('div',undefined,'group-header');
 h.append(el('span',g.severity.toUpperCase(),'badge '+g.severity),el('span',g.count+' EVENT'+(g.count===1?'':'S')));
 n.append(h,el('h3',g.message),el('p','Source lines: '+g.lines.join(', ')),el('p','Next check: '+nextCheck(g)),el('pre',g.examples.map(e=>'L'+e.line+'  '+e.text).join('\n')));return n;}));
 $('sanitized').textContent=r.redactedLines.map(e=>'L'+e.line+'  '+e.text).join('\n');$('empty-report').hidden=true;$('report').hidden=false;$('download').disabled=false;
}
input.addEventListener('input',()=>invalidate());
$('example').addEventListener('click',()=>{input.value=example;invalidate('Synthetic example loaded. Select Analyze logs.');});
$('reset').addEventListener('click',()=>{input.value='';invalidate('Cleared. Nothing is stored.');input.focus();});
$('analyze').addEventListener('click',()=>{try{snapshot=analyzeLog(input.value);render(snapshot);status('Brief ready. '+snapshot.counts.total+' lines analyzed locally; review before sharing.');}catch(e){invalidate('');status(e.message,true);}});
$('download').addEventListener('click',()=>{
 if(!snapshot)return;const url=URL.createObjectURL(new Blob([toMarkdown(snapshot)],{type:'text/markdown;charset=utf-8'})),a=el('a');
 a.href=url;a.download='incident-brief.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Downloaded the current sanitized brief. Review it before sharing.');
});
