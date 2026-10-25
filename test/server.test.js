import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.js';
test('exact asset routes, no upload endpoint and privacy headers',async()=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+s.address().port;
 try{
  const page=await fetch(url);assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/connect-src 'none'/);assert.match(await page.text(),/Incident Brief/);
  assert.equal((await fetch(url+'/.env')).status,404);assert.equal((await fetch(url+'/devpost/learner-profile.md')).status,404);
  assert.equal((await fetch(url+'/analyze',{method:'POST',body:'synthetic'})).status,405);
  const h=await fetch(url+'/app.js',{method:'HEAD'});assert.equal(h.status,200);assert.equal(await h.text(),'');
 }finally{await new Promise(r=>s.close(r));}
});
