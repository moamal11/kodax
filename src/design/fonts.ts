/**
 * خطوط Kodax: IBM Plex Sans Arabic (عربي + لاتيني) و JetBrains Mono (الكود).
 * كل وزن يُسجَّل كعائلة مستقلة (انظر tokens.fontFamily).
 */
import { useFonts } from 'expo-font';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { fontFamily } from './tokens';

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    [fontFamily.regular]: IBMPlexSansArabic_400Regular,
    [fontFamily.medium]: IBMPlexSansArabic_500Medium,
    [fontFamily.semibold]: IBMPlexSansArabic_600SemiBold,
    [fontFamily.bold]: IBMPlexSansArabic_700Bold,
    [fontFamily.mono]: JetBrainsMono_400Regular,
    [fontFamily.monoBold]: JetBrainsMono_600SemiBold,
  });
  // فشل تحميل الخطوط لا يمنع التطبيق: يُستخدم خط النظام بنفس المقاسات
  return loaded || !!error;
}
