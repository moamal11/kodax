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

        {/* Prevent scroll restoration issues */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveCSS = `
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
