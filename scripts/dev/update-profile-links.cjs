const fs=require('node:fs');
const files=[
 ['app/(tabs)/code.tsx',[['`/user/${item.data.user_id}`','profilePath(item.data.user_id!,item.data.profiles?.username)']]],
 ['app/(tabs)/index.tsx',[['`/user/${sn.user_id}`','profilePath(sn.user_id,sn.profiles?.username)'],['`/user/${u.id}`','profilePath(u.id,u.username)']]],
 ['app/code/[id].tsx',[['`/user/${snippet.user_id}`','profilePath(snippet.user_id,author?.username)']]],
 ['app/discussion/[id].tsx',[['`/user/${post.user_id}`','profilePath(post.user_id,post.profiles?.username)']]],
 ['app/message/[id].tsx',[['`/user/${other.id}`','profilePath(other.id,other.username)']]],
 ['app/leaderboard.tsx',[['`/user/${item.id}`','profilePath(item.id,item.username)']]],
 ['app/blocked-users.tsx',[['`/user/${u.id}`','profilePath(u.id,u.username)']]],
 ['src/features/community/SnippetComments.tsx',[['`/user/${c.user_id}`','profilePath(c.user_id!,c.profiles?.username)']]],
 ['src/features/community/FollowListSheet.tsx',[['`/user/${p.id}`','profilePath(p.id,p.username)']]],
];
for(const [file,replacements] of files){let s=fs.readFileSync(file,'utf8');for(const [from,to] of replacements){if(!s.includes(from))throw new Error('Profile link not found in '+file);s=s.replaceAll(from,to);}if(!s.includes("from '@/services/profileLinks'"))s="import { profilePath } from '@/services/profileLinks';\n"+s;fs.writeFileSync(file,s);}
