import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { Asset } from 'expo-asset';
import { brandArtwork, brandPrintSVG } from '@/components/ui/brandArtwork';
import { useLocalSearchParams } from 'expo-router';
import { Screen, AppBar, Col, Text, Button, Surface, ListSkeleton, ErrorState } from '@/design';
import { useCertificateDetail } from '@/hooks/useCertificateDetail';
import { CertificateSummary } from '@/components/certificate/CertificateSummary';
import { certificateSignature, signatureBox, certificateSealSVG, certificateSealColors } from '@/components/certificate/CertificatePaper';
import { CERTIFICATE_LEVEL_CONFIG, type CertificateSummaryItem } from '@/types/certificate';

export default function CertificateDownloadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { certificate, holder, loading, error, reload } = useCertificateDetail(id);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const print = () => {
    if (!certificate) return;
    setActionError(null);
    const preview = window.open('', '_blank');
    if (!preview) {
      setActionError('اسمح بفتح نافذة الطباعة في المتصفح ثم حاول مرة أخرى.');
      return;
    }
    preview.opener = null;
    preview.document.write(generateCertificateHTML(certificate, holder, 'pdf'));
    preview.document.close();
    // The button remains available if the user dismisses the browser print dialog.
    const control = preview.document.createElement('button');
    control.textContent = 'طباعة / حفظ PDF';
    control.setAttribute('style', 'position:fixed;top:16px;right:16px;padding:12px 20px;cursor:pointer;z-index:10');
    control.onclick = () => preview.print();
    preview.document.body.appendChild(control);
    const style = preview.document.createElement('style');
    style.textContent = '@media print {button {display:none!important}}';
    preview.document.head.appendChild(style);
  };
  const share = async () => {
    if (!certificate || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await Share.share({
        message: `شهادة إتمام ${certificate.field_name_ar || certificate.field_name} من Kodax\nhttps://kodax.app/certificate/verify?id=${encodeURIComponent(certificate.id)}`,
      });
    } catch {
      setActionError('تعذّرت مشاركة الشهادة. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen width="reading" header={<AppBar title="طباعة ومشاركة الشهادة" fallback="/certificate" />}>
      {loading ? (
        <ListSkeleton rows={2} />
      ) : error || !certificate ? (
        <ErrorState body={error || 'الشهادة غير متاحة.'} onRetry={reload} />
      ) : (
        <Col gap={24}>
          <CertificateSummary certificate={certificate} holder={holder} />
          <Surface padding={16}>
            <Col gap={12}>
              <Text variant="heading">{Platform.OS === 'web' ? 'نسخة قابلة للطباعة' : 'مشاركة الشهادة'}</Text>
              <Text tone="secondary" variant="bodySm">
                {Platform.OS === 'web'
                  ? 'افتح النسخة، ثم اختر «طباعة / حفظ PDF». يمكنك حفظها كملف PDF من نافذة الطباعة في متصفحك.'
                  : 'شارك رابط التحقق من شهادتك. لحفظ ملف PDF، افتح الشهادة من حسابك على موقع Kodax.'}
              </Text>
              {Platform.OS === 'web' && <Button label="فتح نسخة الطباعة" icon="print-outline" onPress={print} />}
              <Button label="مشاركة رابط الشهادة" icon="share-outline" variant="secondary" onPress={share} loading={busy} />
              {!!actionError && (
                <Text tone="danger" accessibilityLiveRegion="polite">
                  {actionError}
                </Text>
              )}
            </Col>
          </Surface>
        </Col>
      )}
    </Screen>
  );
}

function generateCertificateHTML(certificate: CertificateSummaryItem, userName: string, type: 'pdf' | 'png'): string {
  const escape = (value: string | undefined) =>
    (value || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  const assetURI = (source: number) => {
    const uri = Asset.fromModule(source).uri;
    return Platform.OS === 'web' ? new URL(uri, window.location.href).href : uri;
  };
  const logoHTML = brandPrintSVG(assetURI(brandArtwork.full.source), 144, true);
  const symbol = brandArtwork.symbol.box;
  const watermarkHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="290" height="310" viewBox="${symbol.left} ${symbol.top} ${symbol.width} ${symbol.height}" aria-hidden="true"><image href="${escape(assetURI(brandArtwork.symbol.source))}" width="${symbol.imageW}" height="${symbol.imageH}"/></svg>`;
  const b = signatureBox;
  const signatureHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="74" viewBox="${b.left} ${b.top} ${b.width} ${b.height}" role="img" aria-label="توقيع مؤمل"><image href="${escape(assetURI(certificateSignature))}" width="${b.imageW}" height="${b.imageH}"/></svg>`;
  const config = CERTIFICATE_LEVEL_CONFIG[certificate.level];
  const date = new Date(certificate.issued_at).toLocaleDateString('ar-IQ-u-nu-latn', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Baghdad',
  });
  const field = certificate.field_name_ar || certificate.field_name || certificate.course_title_ar || certificate.course_title;
  const verify = `https://kodax.app/certificate/verify?id=${encodeURIComponent(certificate.id)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verify)}&bgcolor=F7FBFC&color=262C35`;
  const status = certificate.status === 'valid' ? '' : certificate.status === 'revoked' ? 'ملغاة' : 'مؤرشفة بعد الترقية';
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>شهادة Kodax — ${escape(userName)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
*{box-sizing:border-box}body{margin:0;padding:32px 16px;background:#E9F0F2;font-family:Cairo,Tahoma,sans-serif;color:#262C35;display:flex;justify-content:center;align-items:center;min-height:100vh}
.certificate{position:relative;overflow:hidden;width:900px;max-width:100%;background:#F7FBFC;border:1px solid #DCE6E9;padding:14px;box-shadow:0 12px 32px #262C3514}
.watermark{position:absolute;top:-82px;right:-68px;opacity:.07;pointer-events:none}.seal-ribbon{position:absolute;left:calc(50% - 200px);top:-154px;width:400px;height:400px;pointer-events:none;z-index:0}.content{position:relative;z-index:1;padding:32px 44px 24px;min-height:560px;text-align:center;display:flex;flex-direction:column;align-items:center}
.logo{margin-bottom:10px}h1{font-size:25px;font-weight:400;color:#626B73;margin:0 0 64px;line-height:1.5}.level{font-size:12px;color:#786644;margin-top:4px}.seal>svg:not(.seal-ribbon),.seal>.level{position:relative;z-index:1}.seal{position:relative;display:flex;flex-direction:column;align-items:center;min-width:110px}.issuer{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1}.issuer small{font-size:11px;color:#626B73}
.label{font-size:14px;color:#626B73;margin:0}.recipient{font-size:44px;font-weight:800;line-height:1.5;overflow-wrap:anywhere;margin:10px 0 18px;max-width:100%}
.rule{width:72px;height:1px;background:#DCE6E9;margin-bottom:18px}.field{font-size:30px;font-weight:700;margin:6px 0 44px;overflow-wrap:anywhere}
.status{color:#9B3434;font-size:14px;margin-bottom:12px}.footer{width:100%;margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}
.signature{display:flex;flex-direction:column;align-items:center;min-width:128px}.signature strong{font-size:15px;font-weight:600}.signature small,.date small,.qr small{font-size:11px;color:#626B73}.date{font-size:13px;display:flex;flex-direction:column;gap:6px;text-align:center}.qr{display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;color:inherit}.qr img{width:44px;height:44px}.verification{width:100%;display:flex;gap:14px;align-items:center;justify-content:center;border-top:1px solid #DCE6E9;padding-top:12px;margin-top:20px}.verification .id{margin-top:0}
.id{font-family:monospace;font-size:10px;color:#626B73;direction:ltr;overflow-wrap:anywhere;max-width:100%;margin-top:16px}
@media(max-width:520px){.watermark{top:-48px;right:-48px}.watermark svg{width:180px;height:193px}body{padding:12px 8px}.content{padding:24px 16px;min-height:0}h1{margin-bottom:30px;font-size:22px}.recipient{font-size:28px}.issuer{min-width:120px}.seal{min-width:90px}.field{font-size:20px}.footer{gap:16px}.date{flex:1;min-width:100px}.qr{margin-inline-start:auto}}
@page{size:A4 landscape;margin:12mm}
@media print{body{padding:0;background:white;min-height:0;display:block}.certificate{width:100%;max-width:none;box-shadow:none;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}.content{min-height:174mm;padding:28px 40px 20px}.footer{flex-wrap:nowrap}}
</style></head><body><main class="certificate"><div class="watermark">${watermarkHTML}</div><div class="content">
<h1>شهادة إتمام المسار</h1>
<p class="label">تُمنح إلى</p><div class="recipient">${escape(userName || 'الطالب')}</div>
<p class="label">لإتمام مسار</p><div class="field">${escape(field)}</div>
${status ? `<div class="status">${status}</div>` : ''}
<div class="footer">
<div class="signature">${signatureHTML}<strong>مؤمل</strong><small>Kodax</small></div>
<div class="issuer"><div class="logo">${logoHTML}</div><small>${escape(date)}</small></div>
<div class="seal"><svg class="seal-ribbon" viewBox="0 0 400 400" aria-hidden="true"><path d="M0 0H54L400 346V400H346L0 54Z" fill="#DDEBED"/><circle cx="200" cy="200" r="58" fill="#DDEBED"/></svg>${certificateSealSVG(certificate.level)}<div class="level" style="color:${certificateSealColors[certificate.level].stroke}">${escape(config.labelAr)}</div></div>
</div><div class="verification">
<a class="qr" href="${escape(verify)}"><img src="${escape(qrUrl)}" alt="رمز التحقق من الشهادة"><small>تحقق من الشهادة</small></a>
<div class="id">${escape(certificate.id)}</div></div>
</div></main></body></html>`;
}
