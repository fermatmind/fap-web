import{readFileSync}from'node:fs';import assert from'node:assert/strict';
const bytes=readFileSync("tests/fixtures/questionnaires/spatial-reference.json"),s=JSON.parse(bytes);
const plan={tasks:s.checks.map((c,index)=>({id:c.id,topic:s.questions[index].options[0].directionId,data:c.geometry}))};
const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),mat=(m,v)=>m.map(row=>dot(row,v));
const turns=[[[1,0],[0,1]],[[0,-1],[1,0]],[[-1,0],[0,-1]],[[0,1],[-1,0]]];
const move=(v,n,c=[0,0])=>mat(turns[(n%4+4)%4],v.map((x,i)=>x-c[i])).map((x,i)=>x+c[i]);
const reflect=(v,kind)=>{const m={'x-axis':[[1,0],[0,-1]],'x=1':[[-1,0],[0,1]],'y=x':[[0,1],[1,0]],'y=-x':[[0,-1],[-1,0]]}[kind];assert(m);const a=mat(m,v);return kind==='x=1'?[a[0]+2,a[1]]:a;};
const cmp=(a,b)=>a[0]-b[0]||a[1]-b[1],canonical=v=>Array.isArray(v)&&Array.isArray(v[0])?JSON.stringify([...v].sort(cmp)):JSON.stringify(v),normalShape=v=>{const min=[Math.min(...v.map(p=>p[0])),Math.min(...v.map(p=>p[1]))];return canonical(v.map(p=>p.map((x,i)=>x-min[i])));};
const same=(a,b)=>canonical(a)===canonical(b),distinct=v=>[...new Map(v.map(p=>[canonical(p),p])).values()];
function mirrorFold(v,f){if(f.axis==='diagonal-y=x')return [v[1],v[0]];const axis=f.axis==='x'?0:1;return v.map((x,i)=>i===axis?2*f.at-x:x);}
function applyFold(v,f){if(f.axis==='diagonal-y=x')return v[1]>v[0]?mirrorFold(v,f):v;const value=v[f.axis==='x'?0:1],moving=f.moving==='positive'?value>f.at:value<f.at;return moving?mirrorFold(v,f):v;}
const applyFolds=(v,fs)=>fs.reduce((point,f)=>applyFold(point,f),v);
const faceVector={top:[0,0,1],bottom:[0,0,-1],front:[0,-1,0],back:[0,1,0],right:[1,0,0],left:[-1,0,0]},faceLabels={top:'T',bottom:'B',front:'F',back:'K',right:'R',left:'L'};
const cubeMatrices={forward:[[1,0,0],[0,0,-1],[0,1,0]],right:[[0,0,1],[0,1,0],[-1,0,0]],'yaw-right':[[0,-1,0],[1,0,0],[0,0,1]]};
for(const [op,m]of Object.entries(cubeMatrices)){assert.equal(m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]),1);for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.equal(dot(m[i],m[j]),i===j?1:0);for(const [from,to]of Object.entries(s.coordinate_and_cube_definitions.cubeMoves[op]))assert.deepEqual(mat(m,faceVector[from]),faceVector[to]);}
assert.deepEqual(s.coordinate_and_cube_definitions.cubeFaces,faceLabels);
const fmt=v=>Array.isArray(v)?Array.isArray(v[0])?'{'+[...v].sort(cmp).map(p=>'('+p.join(', ')+')').join('; ')+'}':'('+v.join(', ')+')':String(v),rows=[];
for(let index=0;index<30;index++){
 const t=plan.tasks[index],q=s.questions[index],c=s.checks[index],d=c.geometry;assert.equal(q.id,t.id);assert.deepEqual(d,t.data);const offered=[c.expected,...c.distractors];let answer;
 if(t.topic==='rotations'){let points=d.points??[d.point];for(const n of d.turnSequence??[d.turns])points=points.map(v=>move(v,n,d.centre));answer=d.queryIndex!==undefined?points[d.queryIndex]:d.point?points[0]:points;}
 else if(t.topic==='reflections'){
  if(d.points){const allowable=d.allowedTurns.map(n=>normalShape(d.points.map(v=>move(v,n)))),hits=offered.filter(v=>allowable.includes(normalShape(v)));assert.equal(hits.length,1);answer=hits[0];}
  else answer=d.sequence?reflect(move(d.point,1),'x-axis'):reflect(d.point,d.reflection);
 }else if(t.topic==='folds'){
  let pre=[d.punch];for(const f of [...d.folds].reverse())pre=distinct(pre.flatMap(v=>[v,mirrorFold(v,f)]).filter(v=>pre.some(out=>same(applyFold(v,f),out))));
  const [xmin,xmax,ymin,ymax]=d.bounds;pre=pre.filter(([x,y])=>x>=xmin&&x<=xmax&&y>=ymin&&y<=ymax&&same(applyFolds([x,y],d.folds),d.punch));assert(pre.length);
  if(d.query==='allLocations')answer=pre;
  else if(d.query==='count')answer=pre.length;
  else if(d.query==='largestX')answer=Math.max(...pre.map(v=>v[0]));
  else if(d.query==='otherLocation'){assert.equal(pre.length,2);answer=pre.find(v=>!same(v,d.punch));}
  else if(d.query==='countAfterUnfoldLast')answer=distinct(pre.map(v=>applyFolds(v,d.folds.slice(0,-1)))).length;
  else throw Error(d.query);
 }else if(t.topic==='cube-turns'){
  let labelled=Object.entries(faceLabels).map(([face,label])=>({label,normal:faceVector[face]}));for(const op of d.operations)labelled=labelled.map(v=>({...v,normal:mat(cubeMatrices[op],v.normal)}));answer=labelled.find(v=>same(v.normal,faceVector[d.queryFace])).label;
 }else if(t.topic==='layouts'){
  if(d.cubes){const cells=distinct(d.cubes.map(v=>d.project==='xz'?[v[0],v[2]]:[v[0],v[1]]));if(d.query==='count')answer=cells.length;else{const hits=offered.filter(v=>!cells.some(a=>same(a,v)));assert.equal(hits.length,1);answer=hits[0];}}
  else if(d.rows){const cubes=d.rows.flatMap((row,y)=>row.flatMap((h,x)=>Array.from({length:h},(_,z)=>[x,y,z])));if(d.query==='sum')answer=cubes.length;else{const projection=distinct(cubes.map(([x,,z])=>[x,z]));answer=Array.from({length:d.rows[0].length},(_,x)=>projection.filter(v=>v[0]===x).length);}}
  else{let heading={east:0,north:1,west:2,south:3}[d.heading],point=[...d.point],vectors=[[1,0],[0,1],[-1,0],[0,-1]];const route=d.query==='leftAdjacent'?[['left',1]]:d.moves;for(const[op,n]of route){heading=(heading+(op==='left'?1:op==='right'?3:0))%4;point=point.map((x,i)=>x+n*vectors[heading][i]);}answer=point;}
 }else throw Error(t.topic);
 assert(same(answer,c.expected),q.id+':'+JSON.stringify(answer));const label=fmt(answer),hits=q.options.filter(o=>o.label.en===label);assert.equal(hits.length,1,q.id);assert.equal(hits[0].id,q.correctOptionId,q.id);assert(q.options.every(o=>o.label.en===o.label.zh&&o.directionId===t.topic));rows.push({id:q.id,computed:answer,correct:hits[0].id,offered_unique:true});
}
process.stdout.write(JSON.stringify(rows));
