# ==============================================================================
# سكربت النشر المباشر لمنصة تدلّلي إلى Firebase Hosting (tedallaly.com)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🌸 بدء عملية النشر المباشر لمنصة تدلّلي على Firebase Hosting 🌸" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. التحقق من تثبيت firebase-tools وتثبيتها إذا لم تكن موجودة
Write-Host "[1/3] التحقق من وجود أداة firebase-tools..." -ForegroundColor Cyan
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "  أداة firebase-tools غير مثبتة، جارٍ تثبيتها الآن عالمياً عبر npm..." -ForegroundColor Yellow
    npm install -g firebase-tools
} else {
    Write-Host "  ✓ أداة firebase-tools مثبتة وجاهزة." -ForegroundColor Green
}

# 2. تنفيذ firebase login للربط بحساب Firebase
Write-Host ""
Write-Host "[2/3] تسجيل الدخول إلى Firebase (firebase login)..." -ForegroundColor Cyan
Write-Host "  (سيفتح المتصفح لتسجيل الدخول بحسابك saeedalraililogistic@gmail.com إذا لم تكن مسجلاً مسبقاً)" -ForegroundColor DarkGray
firebase login

# التأكد من اختيار مشروع تدلّلي
firebase use gen-lang-client-0272067510

# بناء أحدث كود للمشروع وتجهيز مجلد dist
Write-Host ""
Write-Host "  جارٍ بناء وتجهيز أحدث نسخة من ملفات الموقع (npm run build)..." -ForegroundColor Cyan
$env:VITE_TAP_PUBLIC_KEY = "pk_live_icUaSZ5knBHG9FgEW1q7vwMptCuzI"
$env:VITE_APP_URL = "https://tedallaly.com/ar"
npm run build

# 3. تنفيذ أمر الرفع المباشر إلى Firebase Hosting
Write-Host ""
Write-Host "[3/3] رفع أحدث التعديلات مباشرة إلى Firebase Hosting (firebase deploy --only hosting)..." -ForegroundColor Cyan
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  🎉 تم رفع ونشر التحديثات بنجاح تام إلى tedallaly.com! 🎉 " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "رابط الموقع المباشر: https://tedallaly.com" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ حدثت مشكلة أثناء الرفع، يرجى مراجعة رسالة الخطأ أعلاه." -ForegroundColor Red
}
