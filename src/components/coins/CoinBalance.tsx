/**
 * شارة رصيد الكوينات — تفتح صفحة "اجمع الكوينات" عند الضغط
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { CoinIcon, COIN_COLORS } from './CoinIcon';

interface CoinBalanceProps {
  size?: 'small' | 'medium';
  onPress?: () => void;
  showAdd?: boolean;
}

export function CoinBalance({
  size = 'medium',
  onPress,
  showAdd = true,
}: CoinBalanceProps) {
  const router = useRouter();
  const { balance, isLoading } = useCoins();
  const small = size === 'small';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress ?? (() => router.push('/rewards' as any))}
      style={[styles.pill, small && styles.pillSmall]}
      accessibilityRole="button"
      accessibilityLabel={`رصيدك ${balance} كوين. اجمع المزيد`}
    >
      <CoinIcon size={small ? 16 : 20} />
      <Text style={[styles.value, small && styles.valueSmall]}>
        {isLoading ? '—' : balance.toLocaleString()}
      </Text>
      {showAdd && (
        <View style={[styles.add, small && styles.addSmall]}>
          <Ionicons name="add" size={small ? 12 : 14} color="#0f0f1e" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COIN_COLORS.bg,
    borderWidth: 1,
    borderColor: COIN_COLORS.border,
  },
  pillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  value: {
    color: COIN_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  valueSmall: {
    fontSize: 13,
  },
  add: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COIN_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default CoinBalance;
