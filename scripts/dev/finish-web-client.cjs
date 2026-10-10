const fs=require('node:fs');
function edit(file,from,to){let text=fs.readFileSync(file,'utf8');if(!text.includes(from))throw new Error('Missing expected source in '+file);fs.writeFileSync(file,text.replace(from,to));}
edit('app/(tabs)/code.tsx','if(isInitializing||!userId)return;','if(isInitializing||(!userId&&Platform.OS!==\'web\'))return;');
edit('app/(tabs)/code.tsx','if(!userId)return;if(Platform.OS','if(!userId){requestSignIn();return;}if(Platform.OS');
edit('app/(tabs)/code.tsx','onPress={()=>setCreate(true)}','onPress={()=>userId?setCreate(true):requestSignIn()}');
for(const file of ['app/(tabs)/code.tsx','src/features/community/SnippetCard.tsx','src/features/community/ContentShareSheet.tsx']){const text=fs.readFileSync(file,'utf8');if(text.includes('import { requestSignIn }'))throw new Error('Already imported '+file);fs.writeFileSync(file,"import { requestSignIn } from '@/services/webAccess';\n"+text);}
for(const file of ['src/features/community/SnippetCard.tsx','src/features/community/ContentShareSheet.tsx','src/features/community/usePostLike.ts'])edit(file,"router.push('/login')",'requestSignIn()');
const callback='app/auth/callback.tsx';let callbackText=fs.readFileSync(callback,'utf8');if(!callbackText.includes("router.replace('/(tabs)')"))throw new Error('Unexpected callback');callbackText="import { consumeWebReturn } from '@/services/webAccess';\n"+callbackText.replaceAll("router.replace('/(tabs)')","router.replace((Platform.OS === 'web' ? consumeWebReturn() || '/(tabs)' : '/(tabs)') as any)");fs.writeFileSync(callback,callbackText);
console.log('Updated web visitor action gates and OAuth return; native routing remains the same.');
