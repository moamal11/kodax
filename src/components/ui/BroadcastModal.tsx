import React from 'react';
import { Image } from 'react-native';
import { Sheet, Col, Text, Button } from '@/design';
interface BroadcastModalProps {
  visible: boolean;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  onClose: () => void;
}
export default function BroadcastModal({ visible, title, body, imageUrl, onClose }: BroadcastModalProps) {
  if (!visible) return null;
  return (
    <Sheet visible={visible} onClose={onClose} title={title} footer={<Button label="حسنًا" onPress={onClose} />}>
      <Col gap={16}>
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', aspectRatio: 1.6, borderRadius: 12 }} resizeMode="contain" accessibilityLabel={title} />
        )}
        {!!body && <Text>{body}</Text>}
      </Col>
    </Sheet>
  );
}
