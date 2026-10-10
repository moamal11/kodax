import React, { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sheet, Col, Row, Text, Field, Button, Avatar, Segmented, useTheme } from '@/design';
import { saveMandatoryData, IRAQ_PROVINCES } from '@/services/profileService';
interface MandatoryDataModalProps {
  visible: boolean;
  userId: string;
  onComplete: () => void;
}
export default function MandatoryDataModal({ visible, userId, onComplete }: MandatoryDataModalProps) {
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [showProvinceList, setShowProvinceList] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValid = fullName.trim().length >= 3 && province !== '' && gender !== '';
  const t = useTheme();

  const handleSave = useCallback(async () => {
    if (!isValid) {
      setError('يرجى إكمال جميع الحقول');
      return;
    }

    setSaving(true);
    setError('');

    const result = await saveMandatoryData(userId, {
      full_name: fullName.trim(),
      province,
      gender,
    });

    setSaving(false);

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'حدث خطأ أثناء الحفظ');
    }
  }, [isValid, fullName, province, gender, userId, onComplete]);

  return (
    <Sheet
      visible={visible}
      onClose={() => {}}
      dismissible={false}
      title="كمّل حسابك"
      footer={<Button label="حفظ ومتابعة" onPress={handleSave} loading={saving} disabled={!isValid || saving} />}
    >
      <Col gap={22}>
        <Row gap={14} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.colors.border, paddingBottom: 20 }}>
          <Avatar name={fullName.trim() || 'Kodax'} size={56} />
          <Col gap={4} flex={1}>
            <Text variant="heading">{fullName.trim() || 'المعلومات الشخصية'}</Text>
            <Text variant="bodySm" tone="secondary">
              اسمك يظهر في المجتمع وعلى شهاداتك.
            </Text>
          </Col>
        </Row>
        <Field
          label="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
          editable={!saving}
          autoComplete="name"
          placeholder="اكتب اسمك كما تحب أن يظهر"
          hint="3 أحرف على الأقل."
        />
        <Col gap={10}>
          <Text variant="label" weight="semibold">
            المحافظة
          </Text>
          <Pressable
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={province || 'اختر محافظتك'}
            accessibilityState={{ expanded: showProvinceList, disabled: saving }}
            onPress={() => setShowProvinceList((v) => !v)}
            style={({ pressed }) => ({
              minHeight: 56,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: showProvinceList ? t.colors.focus : t.colors.borderStrong,
              backgroundColor: pressed ? t.colors.surfacePressed : t.colors.surfaceSunken,
            })}
          >
            <Row gap={10}>
              <Ionicons name="location-outline" size={22} color={province ? t.colors.brandText : t.colors.textSecondary} />
              <Text style={{ flex: 1 }} tone={province ? 'default' : 'secondary'} weight={province ? 'semibold' : 'regular'}>
                {province || 'اختر محافظتك'}
              </Text>
              <Ionicons name={showProvinceList ? 'chevron-up' : 'chevron-down'} size={18} color={t.colors.textSecondary} />
            </Row>
          </Pressable>
          {showProvinceList && (
            <Col gap={10}>
              <Field
                label="ابحث عن محافظة"
                hideLabel
                icon="search-outline"
                placeholder="ابحث عن محافظة…"
                value={provinceQuery}
                onChangeText={setProvinceQuery}
              />
              <Row wrap gap={8}>
                {IRAQ_PROVINCES.filter((p) => p.includes(provinceQuery.trim())).map((p) => (
                  <Pressable
                    key={p}
                    accessibilityRole="radio"
                    accessibilityLabel={p}
                    accessibilityState={{ checked: province === p }}
                    onPress={() => {
                      setProvince(p);
                      setShowProvinceList(false);
                      setProvinceQuery('');
                    }}
                    style={({ pressed }) => ({
                      flexBasis: '47%',
                      flexGrow: 1,
                      minHeight: 48,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: province === p ? t.colors.brand : t.colors.border,
                      backgroundColor: pressed ? t.colors.surfacePressed : province === p ? t.colors.brandSoft : t.colors.surface,
                    })}
                  >
                    <Row gap={6}>
                      <Text variant="bodySm" weight={province === p ? 'semibold' : 'medium'} style={{ flex: 1 }}>
                        {p}
                      </Text>
                      {province === p && <Ionicons name="checkmark" size={18} color={t.colors.brandText} />}
                    </Row>
                  </Pressable>
                ))}
              </Row>
              {!IRAQ_PROVINCES.some((p) => p.includes(provinceQuery.trim())) && (
                <Text variant="bodySm" tone="secondary">
                  ماكو محافظة بهذا الاسم. جرّب كلمة ثانية.
                </Text>
              )}
            </Col>
          )}
          <Text variant="bodySm" tone="secondary">
            تحدد ترتيبك بين متعلمي محافظتك.
          </Text>
        </Col>
        <Col gap={8}>
          <Text variant="label">الجنس</Text>
          <Segmented
            value={gender}
            onChange={(v) => {
              if (!saving) setGender(v as 'male' | 'female');
            }}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </Col>
        {!!error && (
          <Text tone="danger" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
      </Col>
    </Sheet>
  );
}
