from pathlib import Path
import shutil, json
from PIL import Image

root=Path(__file__).parent
project=root.parent.parent
assets=root/'assets'; assets.mkdir(exist_ok=True)
files={
 'icon.png':project/'assets/icon.png',
 'IBM-Regular.ttf':project/'node_modules/@expo-google-fonts/ibm-plex-sans-arabic/400Regular/IBMPlexSansArabic_400Regular.ttf',
 'IBM-Medium.ttf':project/'node_modules/@expo-google-fonts/ibm-plex-sans-arabic/500Medium/IBMPlexSansArabic_500Medium.ttf',
 'IBM-SemiBold.ttf':project/'node_modules/@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold/IBMPlexSansArabic_600SemiBold.ttf',
 'IBM-Bold.ttf':project/'node_modules/@expo-google-fonts/ibm-plex-sans-arabic/700Bold/IBMPlexSansArabic_700Bold.ttf',
 'JetBrainsMono.ttf':project/'node_modules/@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf',
 'Ionicons.ttf':project/'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
}
for dest,source in files.items(): shutil.copy2(source,assets/dest)
glyphs=json.loads((project/'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json').read_text())
selected=['images','camera','mail','musical-notes','settings','calendar','map','calculator','chatbubble','cloud','code-slash','play','copy-outline','arrow-forward','checkmark-circle','heart','heart-outline','chatbox-outline','share-social-outline','eye-outline','add','search','home-outline','school-outline','hardware-chip-outline','person-circle-outline','ellipsis-horizontal','send','chevron-down']
(assets/'icons.json').write_text(json.dumps({k:glyphs[k] for k in selected},indent=2),encoding='utf-8')
print('Copied actual app fonts, icon and Ionicons glyph map')
