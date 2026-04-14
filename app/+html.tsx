import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * HTML template for Expo Router web
 * Prevents full page reloads and maintains SPA state
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
        />

        {/* SEO Meta Tags */}
        <title>
          KODAX - منصة تعليم البرمجة العراقية | تعلّم البرمجة بالعربية
        </title>
        <meta
          name="description"
          content="KODAX منصة تعليم برمجة عراقية - تعلّم البرمجة بالعربية من خلال دورات تفاعلية، تحديات برمجية، محرر أكواد متقدم، ومساعد ذكاء اصطناعي. انضم لمجتمع المبرمجين العراقيين!"
        />
        <meta
          name="keywords"
          content="KODAX, كوداكس, تعليم برمجة, برمجة عراقية, تعلم البرمجة بالعربية, دورات برمجة, تحديات برمجية, محرر أكواد, Python, JavaScript, HTML, CSS, عراق, برمجة"
        />
        <meta name="author" content="KODAX" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0f0f1e" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="KODAX - منصة تعليم البرمجة العراقية"
        />
        <meta
          property="og:description"
          content="تعلّم البرمجة بالعربية من خلال دورات تفاعلية، تحديات برمجية، ومحرر أكواد متقدم. انضم لمجتمع المبرمجين العراقيين!"
        />
        <meta property="og:site_name" content="KODAX" />
        <meta property="og:locale" content="ar_IQ" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="KODAX - منصة تعليم البرمجة العراقية"
        />
        <meta
          name="twitter:description"
          content="تعلّم البرمجة بالعربية مع KODAX - دورات، تحديات، محرر أكواد، وذكاء اصطناعي"
        />

        {/* SPA - prevent browser from reloading on navigation */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="KODAX" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons — required for iOS Add to Home Screen */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-touch-icon.png"
        />

        {/* Standard favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />

        {/* Apple splash screens */}
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />

        {/* Prevent scroll restoration issues */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveCSS = `
  /* ── Vector Icons Font Faces ── */
  /* font-display:block prevents "rectangles" before fonts load */
  @font-face { font-family:'AntDesign'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.3f78af31cca60105799838a1a7a59fbd.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Entypo'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.31b5ffea3daddc69dd01a1f3d6cf63c5.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'EvilIcons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/EvilIcons.140c53a7643ea949007aa9a282153849.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Feather'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ca4b48e04dc1ce10bfbddb262c8b835f.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.b06871f281fee6b241d60582ae9369b9.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome5_Brands'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Brands.3b89dd103490708d19a95adcae52210e.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome5_Regular'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.1f77739ca9ff2188b539c36f30ffa2be.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome5_Solid'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.605ed7926cf39a2ad5ec2d1f9d391d3d.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome6_Brands'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Brands.56c8d80832e37783f12c05db7c8849e2.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome6_Regular'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Regular.370dd5af19f8364907b6e2c41f45dbbf.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'FontAwesome6_Solid'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Solid.adec7d6f310bc577f05e8fe06a5daccf.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Fontisto'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Fontisto.b49ae8ab2dbccb02c4d11caaacf09eab.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Foundation'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Foundation.e20945d7c929279ef7a6f1db184a4470.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Ionicons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'MaterialCommunityIcons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'MaterialIcons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Octicons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Octicons.871378c6eab492a3e689a9385dc45a12.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'SimpleLineIcons'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.d2285965fe34b05465047401b8595dd0.ttf') format('truetype'); font-display:block; }
  @font-face { font-family:'Zocial'; src:url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Zocial.1681f34aaca71b8dfb70756bca331eb2.ttf') format('truetype'); font-display:block; }

  body {
    overflow: hidden;
    background-color: #0f0f1e;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Prevent pull-to-refresh on mobile web */
  html {
    overscroll-behavior: none;
    overflow: hidden;
    height: 100%;
  }

  #root {
    display: flex;
    flex: 1;
    height: 100vh;
    overflow: hidden;
  }

  /* Disable text selection in UI elements */
  input, textarea {
    -webkit-user-select: auto !important;
    user-select: auto !important;
  }
`;
