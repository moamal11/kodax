const fs=require('node:fs');
const sql=fs.readFileSync('supabase/migrations/20261009000000_profile_identity_privacy_comments.sql','utf8');
const data=JSON.parse(fs.readFileSync('reports/profile-live-20261010/supabase-functions.json','utf8').replace(/^\uFEFF/,''));
const matches=[...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(\w+)\([\s\S]*?AS \$\$([\s\S]*?)\$\$;/g)];
const norm=s=>s.replace(/--[^\n]*/g,'').replace(/\s/g,'');
const result=matches.map(m=>({name:m[1],matches:norm(m[2])===norm(data.rows.find(x=>x.proname===m[1])?.prosrc||'')}));
fs.writeFileSync('reports/profile-live-20261010/function-audit.json',JSON.stringify(result,null,2));console.log(result);
if(result.length!==9||result.some(r=>!r.matches))process.exitCode=1;
