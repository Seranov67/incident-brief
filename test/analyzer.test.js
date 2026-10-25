import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeLog,redact,toMarkdown,MAX_BYTES} from '../public/analyzer.js';
test('repeats group but severities remain separate; source numbers survive blanks',()=>{
 const r=analyzeLog('2026-10-25T09:00:00Z ERROR timeout 10ms request_id=a\n\n2026-10-25T09:00:01Z ERROR timeout 20ms request_id=b\nWARN timeout 20ms request_id=b');
 assert.equal(r.counts.total,3);assert.equal(r.counts.error,2);assert.equal(r.counts.warn,1);assert.deepEqual(r.groups[0].lines,[1,3]);assert.equal(r.groups[0].count,2);
});
test('JSONL levels and messages are supported without leaking other fields',()=>{
 const r=analyzeLog('{"level":"error","message":"Cannot connect","token":"synthetic-secret"}\n{"severity":"warning","msg":"retry"}');
 assert.equal(r.counts.error,1);assert.equal(r.counts.warn,1);assert.equal(r.groups[0].message,'Cannot connect');assert.ok(!JSON.stringify(r).includes('synthetic-secret'));
});
test('lowercase prose does not become an error',()=>{const r=analyzeLog('there is no error here\nunstructured line');assert.equal(r.counts.error,0);assert.equal(r.counts.unknown,2);});
test('common secrets, URL credentials, emails and IPs are masked',()=>{
 const safe=redact('ERROR password="two words" token=synthetic-secret Authorization: Bearer synthetic-bearer https://alice:synthetic-pass@example.test user@example.test 192.0.2.12 2001:db8::1 ::1');
 for(const s of ['two words','synthetic-secret','synthetic-bearer','synthetic-pass','alice','user@example.test','192.0.2.12','2001:db8::1','::1'])assert.ok(!safe.includes(s),s);
 assert.equal(redact('09:00:00'),'09:00:00');
});
test('private-key blocks are masked without shifting line references',()=>{
 const r=analyzeLog('-----BEGIN PRIVATE KEY-----\nSYNTHETIC-KEY-DATA\n-----END PRIVATE KEY-----\nERROR failed'); // gitleaks:allow -- literal synthetic fixture, no encoded key
 assert.ok(!JSON.stringify(r).includes('SYNTHETIC-KEY-DATA'));assert.deepEqual(r.groups.find(g=>g.severity==='error').lines,[4]);
});
test('input limits and empty input reject clearly',()=>{
 assert.throws(()=>analyzeLog(' \n'),/Paste/);assert.throws(()=>analyzeLog('x'.repeat(MAX_BYTES+1)),/200 KiB/);assert.throws(()=>analyzeLog('INFO x\n'.repeat(2001)),/2,000/);
});
test('Markdown escapes untrusted markup and exports sanitized evidence',()=>{
 const md=toMarkdown(analyzeLog('ERROR <script>alert(1)</script> password=synthetic-secret'));
 assert.ok(!md.includes('synthetic-secret'));assert.ok(!md.includes('<script>'));assert.ok(md.includes('Source lines: 1'));assert.ok(md.includes('not a root-cause diagnosis'));
});
test('evidence examples are bounded but totals cover all input',()=>{
 const r=analyzeLog(Array.from({length:15},(_,i)=>'ERROR timeout '+i+'ms').join('\n'));
 assert.equal(r.counts.error,15);assert.equal(r.groups[0].examples.length,3);assert.equal(r.groups[0].lines.length,15);
});


test('different HTTP status codes are not merged by normalization',()=>{
 const r=analyzeLog('ERROR HTTP 404 response\nERROR HTTP 500 response');
 assert.equal(r.groups.length,2);
});
test('JSON authorization header is redacted',()=>{
 const r=analyzeLog('{"level":"error","message":"denied","Authorization":"Bearer synthetic-private"}');
 assert.ok(!JSON.stringify(r).includes('synthetic-private'));
});
test('truncated private-key blocks cannot leak their remaining body',()=>{
 const safe=redact('-----BEGIN PRIVATE KEY-----\nSYNTHETIC-INCOMPLETE-KEY');
 assert.ok(!safe.includes('SYNTHETIC-INCOMPLETE-KEY'));
});
