// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// App Configuration
export const APP_NAME = 'Kodax';
export const APP_VERSION = '1.0.0';

// API Configuration (Edge Function ai-chat — Google Gemini على السيرفر)
export const AI_API_ENDPOINT = process.env.EXPO_PUBLIC_AI_API_ENDPOINT || '';

// Gamification Constants
export const XP_PER_LESSON = 100;
export const XP_PER_CHALLENGE = 250;
export const XP_PER_DAILY_CHALLENGE = 500;

// Iraqi Provinces
export const IRAQI_PROVINCES = [
  'بغداد',
  'البصرة',
  'نينوى',
  'الأنبار',
  'أربيل',
  'كركوك',
  'النجف',
  'كربلاء',
  'ديالى',
  'صلاح الدين',
  'واسط',
  'المثنى',
  'القادسية',
  'ذي قار',
  'بابل',
  'ميسان',
  'دهوك',
  'السليمانية',
];

// Programming Fields - مع أيقونات Ionicons
export const PROGRAMMING_FIELDS = [
  {
    id: 'web-dev',
    name: 'Web Development',
    nameAr: 'تطوير الويب',
    icon: 'globe-outline',
    color: '#8b5cf6',
  },
  {
    id: 'python',
    name: 'Python',
    nameAr: 'بايثون',
    icon: 'logo-python',
    color: '#ff6b9d',
  },
  {
    id: 'cpp',
    name: 'C++',
    nameAr: 'سي++',
    icon: 'flash-outline',
    color: '#c471ed',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    nameAr: 'الأمن السيبراني',
    icon: 'shield-checkmark-outline',
    color: '#f64f59',
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    nameAr: 'الذكاء الاصطناعي',
    icon: 'hardware-chip-outline',
    color: '#ff8a80',
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    nameAr: 'تطوير التطبيقات',
    icon: 'phone-portrait-outline',
    color: '#fa7343',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    nameAr: 'تطوير الباك اند',
    icon: 'server-outline',
    color: '#6c5ce7',
  },
  {
    id: 'databases',
    name: 'Databases',
    nameAr: 'قواعد البيانات',
    icon: 'layers-outline',
    color: '#00b894',
  },
];
