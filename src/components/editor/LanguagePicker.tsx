import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { LanguageIcon } from './LanguageIcon';
import { Ionicons } from '@expo/vector-icons';
import { Sheet, Col, Row, Text, Field, EmptyState, useTheme } from '@/design';

type Language = { id: string; label: string; mark: string; file: string; hint?: string };
const LANGUAGES: Language[] = [
  { id: 'python', label: 'Python', mark: 'Py', file: '.py', hint: 'اكتب برنامجًا وشوف نتيجة تشغيله.' },
  { id: 'web', label: 'مشروع ويب', mark: 'Web', file: 'HTML · CSS · JS', hint: 'صفحة بثلاثة ملفات ومعاينة مباشرة.' },
  { id: 'javascript', label: 'JavaScript', mark: 'JS', file: '.js', hint: 'جرّب العمليات والدوال واطبع الناتج.' },
  { id: 'typescript', label: 'TypeScript', mark: 'TS', file: '.ts' },
  { id: 'cpp', label: 'C++', mark: 'C++', file: '.cpp' },
  { id: 'java', label: 'Java', mark: 'J', file: '.java' },
  { id: 'csharp', label: 'C#', mark: 'C#', file: '.cs' },
  { id: 'go', label: 'Go', mark: 'Go', file: '.go' },
  { id: 'rust', label: 'Rust', mark: 'Rs', file: '.rs' },
  { id: 'sql', label: 'SQL', mark: 'SQL', file: '.sql' },
  { id: 'kotlin', label: 'Kotlin', mark: 'Kt', file: '.kt' },
  { id: 'swift', label: 'Swift', mark: 'Sw', file: '.swift' },
  { id: 'dart', label: 'Dart', mark: 'D', file: '.dart' },
  { id: 'html', label: 'HTML', mark: 'HTML', file: '.html' },
  { id: 'react', label: 'React JSX', mark: 'JSX', file: '.jsx' },
  { id: 'php', label: 'PHP', mark: 'PHP', file: '.php' },
];
const COMMUNITY_IDS = LANGUAGES.slice(0, 13).map((l) => l.id);

/** Identical names and selection affordances in the community and the editor. */
export function LanguagePicker({
  visible,
  onClose,
  onSelect,
  selected,
  allowed = COMMUNITY_IDS,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  selected?: string;
  allowed?: string[];
}) {
  const t = useTheme();
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);
  const available = LANGUAGES.filter((l) => allowed.includes(l.id));
  const matches = available.filter((l) => (l.label + ' ' + l.file).toLowerCase().includes(query.trim().toLowerCase()));
  const featured = matches.filter((l) => !!l.hint);
  const other = matches.filter((l) => !l.hint);
  const option = (l: Language, large: boolean) => {
    const active = selected === l.id;
    return (
      <Pressable
        key={l.id}
        onPress={() => {
          onSelect(l.id);
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel={l.label}
        accessibilityHint={l.hint}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => ({
          ...(large ? {} : { flexBasis: '47%', flexGrow: 1 }),
          minHeight: large ? 82 : 62,
          padding: large ? 14 : 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: active ? t.colors.brand : t.colors.borderStrong,
          backgroundColor: pressed ? t.colors.surfacePressed : active ? t.colors.brandSoft : t.colors.surface,
        })}
      >
        <Row gap={8}>
          <View
            style={{
              width: large ? 44 : 30,
              height: large ? 44 : 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              backgroundColor: large ? t.colors.surfaceRaised : 'transparent',
            }}
          >
            <LanguageIcon language={l.id} size={large ? 28 : 25} color={active ? t.colors.brandText : t.colors.textSecondary} />
          </View>
          <Col flex={1} gap={3}>
            <Text variant="bodySm" weight="semibold" ltr={l.id !== 'web'} align="right">
              {l.label}
            </Text>
            <Text variant={large ? 'bodySm' : 'caption'} tone="secondary" ltr={!large} align="right">
              {large ? l.hint : l.file}
            </Text>
          </Col>
          {active ? (
            <Ionicons name="checkmark-circle" size={20} color={t.colors.brandText} />
          ) : large ? (
            <Ionicons name="chevron-back" size={18} color={t.colors.textSecondary} />
          ) : null}
        </Row>
      </Pressable>
    );
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="لغة الكود" maxWidth={540}>
      <Col gap={16}>
        <Field
          label="ابحث عن لغة"
          hideLabel
          icon="search-outline"
          placeholder="اسم اللغة…"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {featured.length > 0 && <Col gap={8}>{featured.map((l) => option(l, true))}</Col>}
        {other.length > 0 && (
          <Col gap={10}>
            {!query && (
              <Text variant="label" tone="secondary">
                لغات أخرى
              </Text>
            )}
            <Row gap={8} wrap>
              {other.map((l) => option(l, false))}
            </Row>
          </Col>
        )}
        {!matches.length && (
          <EmptyState compact icon="search-outline" title="ما لقينا هذه اللغة" body="جرّب اسمًا آخر." action="عرض كل اللغات" onAction={() => setQuery('')} />
        )}
      </Col>
    </Sheet>
  );
}
