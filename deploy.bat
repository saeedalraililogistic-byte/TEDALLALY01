@echo off
chcp 65001 > nul
title رفع وتحديث منصة تدلّلي - tedallaly.com

echo ==========================================================
echo    بدء عملية تجهيز ونشر منصة تدلّلي على tedallaly.com
echo ==========================================================
echo.

echo [1/4] التحقق من أداة Firebase CLI...
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo جارٍ تثبيت firebase-tools...
    call npm install -g firebase-tools
)

echo.
echo [2/4] تسجيل الدخول إلى Firebase...
call firebase login
call firebase use gen-lang-client-0272067510

echo.
echo [3/4] بناء ملفات الإنتاج الحديثة...
set VITE_TAP_PUBLIC_KEY=pk_live_icUaSZ5knBHG9FgEW1q7vwMptCuzI
set VITE_APP_URL=https://tedallaly.com/ar
call npm run build

echo.
echo [4/4] رفع وتحديث الموقع على Firebase Hosting...
call firebase deploy --only hosting

echo.
echo ==========================================================
echo  تم إتمام العملية! الرابط المباشر: https://tedallaly.com
echo ==========================================================
pause
