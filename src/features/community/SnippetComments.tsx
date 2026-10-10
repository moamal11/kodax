import { profilePath } from '@/services/profileLinks';
import { requestSignIn } from '@/services/webAccess';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { generateUUID, getComments, addComment, editComment, deleteComment, type SnippetComment } from '@/services/codeFeedService';
import { Text, Row, Col, Avatar, Field, Button, IconButton, Sheet, Surface, SectionHeader, ListSkeleton, ErrorState, CodeView, useTheme } from '@/design';
import { timeAgo } from '@/components/editor/NotificationButton';

export function CommentContent({ content }: { content: string }) {
  return <Col gap={8}>{content.split(/(```[\s\S]*?(?:```|$))/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('```')) {
      const m = part.match(/^```([^\n]*)\n?([\s\S]*?)(?:```)?$/);
      return <CodeView key={i} code={m?.[2] || part} language={m?.[1]?.trim() || 'text'} scrollHeight={140} />;
    }
    return <Text key={i} variant="bodySm" tone="secondary" selectable style={Platform.OS === 'web' ? ({ overflowWrap: 'anywhere' } as any) : undefined}>
      {part.split(/(https?:\/\/[^\s<>]+)/g).map((p, n) => /^https?:\/\//.test(p)
        ? <Text key={n} ltr tone="brand" variant="bodySm" accessibilityRole="link" onPress={() => Linking.openURL(p).catch(() => undefined)}>{p}</Text> : p)}
    </Text>;
  })}</Col>;
}

export type CommentAdapter={get:typeof getComments;add:typeof addComment;edit:typeof editComment;remove:typeof deleteComment};
const codeAdapter:CommentAdapter={get:getComments,add:addComment,edit:editComment,remove:deleteComment};
export function SnippetComments({ snippetId, count, onCount, adapter=codeAdapter, solution, report }: { snippetId: string; count: number; onCount: (n: number) => void; adapter?:CommentAdapter;
  solution?:{id:string|null;owner:boolean;onChoose:(id:string|null)=>Promise<void>;onJump:(y:number)=>void}; report?:(comment:SnippetComment)=>void }) {
  const t = useTheme();
  const { userId } = useAuth();
  const [comments, setComments] = useState<SnippetComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState<SnippetComment | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [sendError, setSendError] = useState('');
  const [edit, setEdit] = useState<SnippetComment | null>(null);
  const [editText, setEditText] = useState('');
  const [remove, setRemove] = useState<SnippetComment | null>(null);
  const [actionError, setActionError] = useState('');
  const busy = useRef(false);
  const pending = useRef<{ id: string; content: string; parent: string | null } | null>(null);
  const activeUser=useRef(userId);activeUser.current=userId;
  const countCallback = useRef(onCount); countCallback.current = onCount;
  const rootPositions=useRef<Record<string,number>>({});const listTop=useRef(0);
  const jumpSolution=()=>{const target=comments.find(c=>c.id===solution?.id);if(!target)return;const parent=target.parent_id||target.id;if(target.parent_id)setOpen(prev=>new Set([...prev,parent]));setTimeout(()=>solution?.onJump(listTop.current+(rootPositions.current[parent]||0)),100);};
  const load = useCallback(async () => {
    setLoadError('');
    const requestedUser=activeUser.current;
    const r = await adapter.get(snippetId);
    if(requestedUser!==activeUser.current)return;
    if (r.error) setLoadError('تعذّر تحميل التعليقات. حاول مرة أخرى.');
    else { setComments(r.data); countCallback.current(r.data.filter(c => !c.deleted_at).length); }
    setLoading(false);
  }, [snippetId,adapter]);
  useEffect(() => { setLoading(true); setComments([]); setOpen(new Set()); setDraft(''); setReply(null);pending.current=null; load(); }, [load, userId]);
  const send = async () => {
    if (!userId || !draft.trim() || busy.current) return;
    busy.current = true; setSaving(true); setSendError('');
    const parent = reply?.id || null;
    if (!pending.current || pending.current.content !== draft.trim() || pending.current.parent !== parent)
      pending.current = { id: generateUUID(), content: draft.trim(), parent };
    try {
      const r = await adapter.add(userId, snippetId, draft.trim(), parent, pending.current.id);
      if (!r.success) { setSendError(r.error || 'تعذّر الإرسال'); return; }
      setDraft(''); setReply(null); pending.current = null;
      if (parent) setOpen(prev => new Set([...prev, parent]));
      await load();
    } finally { busy.current = false; setSaving(false); }
  };
  const action = async (kind: 'edit' | 'delete') => {
    const target = kind === 'edit' ? edit : remove;
    if (!target || busy.current || (kind === 'edit' && !editText.trim())) return;
    busy.current = true; setSaving(true); setActionError('');
    try {
      const r = kind === 'edit' ? await adapter.edit(target.id, editText) : await adapter.remove(target.id);
      if (!r.success) { setActionError(r.error || 'تعذّر الحفظ'); return; }
      setEdit(null); setRemove(null); await load();
    } finally { busy.current = false; setSaving(false); }
  };
  const choose=async(id:string|null)=>{if(busy.current||!solution)return;busy.current=true;setSaving(true);setActionError('');try{await solution.onChoose(id);}catch(e){setActionError(e instanceof Error?e.message:'تعذّر تغيير الحل');}finally{busy.current=false;setSaving(false);}};
  const name = (c: SnippetComment) => c.profiles?.full_name || c.profiles?.username || 'عضو';
  const replies = (id: string) => comments.filter(c => c.parent_id === id && !c.deleted_at);
  const render = (c: SnippetComment, child = false) => <Col key={c.id} gap={8}>
    <Row gap={10} align="flex-start">
      {!c.deleted_at && <Pressable accessibilityRole="link" accessibilityLabel={`ملف ${name(c)}`} onPress={() => router.push(c.user_id === userId ? '/profile' : profilePath(c.user_id!,c.profiles?.username) as any)}><Avatar uri={c.profiles?.avatar_url} name={name(c)} size={32} /></Pressable>}
      <Col gap={6} flex={1} style={{ minWidth: 0 }}>
        {c.deleted_at ? <Text variant="bodySm" tone="muted">{c.unavailable?'التعليق غير متاح':'حُذف هذا التعليق'}</Text> : <>
          <Row gap={8} wrap><Text variant="label" weight="semibold" style={{ flexShrink: 1 }}>{name(c)}</Text><Text variant="caption" tone="muted">{timeAgo(new Date(c.created_at))}{c.edited_at ? ' · تم التعديل' : ''}</Text></Row>
          <CommentContent content={c.content} />
          {solution?.id===c.id&&<Surface variant="success" padding={8}><Text variant="label" tone="success">✓ الحل المختار</Text></Surface>}
          <Row gap={4} wrap>
            {!child && userId && <Button label="رد" icon="return-down-back-outline" variant="ghost" size="sm" disabled={saving} onPress={() => { setReply(c); setSendError(''); }} />}
            {c.user_id === userId && <>
              <Button label="تعديل" variant="ghost" size="sm" disabled={saving} onPress={() => { setEdit(c); setEditText(c.content); setActionError(''); }} />
              <Button label="حذف" variant="ghost" size="sm" disabled={saving} onPress={() => { setRemove(c); setActionError(''); }} />
            </>}
            {solution?.owner&&<Button label={solution.id===c.id?'إلغاء الحل':'اختيار كحل'} icon="checkmark-circle-outline" variant="ghost" size="sm" disabled={saving} onPress={()=>choose(solution.id===c.id?null:c.id)} />}
            {report&&c.user_id!==userId&&<IconButton icon="flag-outline" label={`الإبلاغ عن تعليق ${name(c)}`} disabled={saving} onPress={()=>report(c)} />}
          </Row>
        </>}
      </Col>
    </Row>
    {!child && replies(c.id).length > 0 && <Col gap={12}>
      <Button label={open.has(c.id) ? 'إخفاء الردود' : `عرض ${replies(c.id).length} ردود`} variant="secondary" size="sm" icon={open.has(c.id) ? 'chevron-up' : 'chevron-down'} onPress={() => setOpen(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })} />
      {open.has(c.id) && <Col gap={16} style={{ marginRight: 12, paddingRight: 12, borderRightWidth: 1, borderRightColor: t.colors.borderStrong }}>{replies(c.id).map(r => render(r, true))}</Col>}
    </Col>}
  </Col>;
  return <Col gap={14}>
    <SectionHeader title={`التعليقات${count ? ` (${count})` : ''}`} />
    {!!solution?.id&&comments.some(c=>c.id===solution.id&&!c.deleted_at)&&<Surface variant="success" padding={12}><Row gap={8} wrap><Text variant="label" style={{flex:1}}>اختار صاحب السؤال حلًا</Text><Button label="انتقل إلى الحل" icon="arrow-down-outline" variant="secondary" size="sm" onPress={jumpSolution} /></Row></Surface>}
    {!!actionError&&!edit&&!remove&&<Text tone="danger" accessibilityLiveRegion="polite">{actionError}</Text>}
    {!!loadError && <ErrorState body={loadError} onRetry={load} />}
    {loading ? <ListSkeleton rows={2} /> : comments.filter(c => !c.parent_id && (!c.deleted_at || replies(c.id).length)).length ?
      <Col gap={20} onLayout={e=>{listTop.current=e.nativeEvent.layout.y;}}>{comments.filter(c => !c.parent_id && (!c.deleted_at || replies(c.id).length)).map(c => <Surface key={c.id} padding={12} onLayout={e=>{rootPositions.current[c.id]=e.nativeEvent.layout.y;}}>{render(c)}</Surface>)}</Col>
      : !loadError && <Text variant="bodySm" tone="muted">ماكو تعليقات بعد.</Text>}
    {Platform.OS === 'web' && !userId && <Button label="اكتب تعليقًا" variant="secondary" onPress={() => requestSignIn()} style={{ alignSelf: 'flex-end' }} />}
    {!!userId && <Col gap={8}>
      {!!reply && <Surface variant="brand" padding={10}><Row gap={8}><Text variant="bodySm" style={{ flex: 1 }}>رد على {name(reply)}</Text><IconButton icon="close-outline" label="إلغاء الرد" disabled={saving} onPress={() => setReply(null)} /></Row></Surface>}
      <Field label={reply ? `رد على ${name(reply)}` : 'اكتب تعليقًا'} placeholder="اكتب تعليقك…" value={draft} onChangeText={setDraft} multiline maxLength={1000} minHeight={80} editable={!saving} error={sendError || null} />
      <Row gap={8} wrap justify="space-between"><Text variant="caption" tone="secondary" tabular>{draft.length} / 1000</Text><Button label={sendError ? 'إعادة إرسال' : reply ? 'إرسال الرد' : 'إرسال التعليق'} icon="send" onPress={send} loading={saving && !edit && !remove} disabled={!draft.trim() || !!edit || !!remove} /></Row>
    </Col>}
    <Sheet visible={!!edit} title="تعديل التعليق" dismissible={!saving} onClose={() => !saving && setEdit(null)} footer={<Button label={actionError ? 'إعادة محاولة الحفظ' : 'حفظ التعديل'} onPress={() => action('edit')} loading={saving} disabled={!editText.trim() || editText.length > 1000} full />}>
      <Col gap={12}><Field label="التعليق" hint={`${editText.length} / 1000 حرفًا`} value={editText} onChangeText={setEditText} maxLength={1000} multiline editable={!saving} />{!!actionError && <Text tone="danger" accessibilityLiveRegion="polite">{actionError}</Text>}</Col>
    </Sheet>
    <Sheet visible={!!remove} title="حذف التعليق؟" dismissible={!saving} onClose={() => !saving && setRemove(null)} maxWidth={440}>
      <Col gap={16}><Text tone="secondary">{remove&&!remove.parent_id ? 'سيُحذف تعليقك وجميع الردود التابعة له، بما فيها ردود الآخرين. لا يمكن التراجع عن الحذف.' : 'سيُحذف ردك فقط. لا يمكن التراجع عن الحذف.'}</Text>
        {!!actionError && <Text tone="danger" accessibilityLiveRegion="polite">{actionError}</Text>}<Row gap={8}><Button label="حذف التعليق" variant="danger" onPress={() => action('delete')} loading={saving} style={{ flex: 1 }} /><Button label="إلغاء" variant="secondary" onPress={() => setRemove(null)} disabled={saving} /></Row></Col>
    </Sheet>
  </Col>;
}
