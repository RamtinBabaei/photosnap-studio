# راه‌اندازی Photosnap در VS Code

## ۱. ابزارهای لازم

نسخهٔ Node.js باید حداقل 22.12 باشد. Git و VS Code را نیز نصب کنید. در ترمینال بررسی کنید:

```powershell
node -v
npm -v
git --version
```

## ۲. باز کردن پروژه

فایل ZIP را Extract کنید و پوشه‌ای را باز کنید که فایل `package.json` داخل آن است. در VS Code از **File → Open Folder** استفاده کنید. سپس **Terminal → New Terminal** را انتخاب کنید.

اگر می‌خواهید پروژه را مستقیم از GitHub بگیرید:

```powershell
git clone https://github.com/RamtinBabaei/photosnap-studio.git
cd photosnap-studio
code .
```

## ۳. نصب و اجرا

```powershell
npm ci
npm run dev
```

این دستور پایگاه‌دادهٔ محلی را آماده می‌کند و فرانت‌اند و API را با هم اجرا می‌کند. برای اجرای محلی نیازی به ورود Cloudflare، توکن یا رمز پایگاه‌داده نیست.

آدرس سایت:

**http://localhost:4173**

برای متوقف‌کردن سایت در همان ترمینال **Ctrl+C** را بزنید. برای اجرای دوباره فقط `npm run dev` کافی است.

## ۴. بررسی عملکرد

1. صفحات Home، Stories، Features و Pricing را باز کنید.
2. در Pricing گزینهٔ Yearly را فعال کنید. قیمت Basic باید 190 دلار در سال شود.
3. پلن Pro را انتخاب کنید. فرم دعوت باید Pro و Yearly را نشان دهد.
4. فرم خالی را ارسال کنید تا پیام‌های اعتبارسنجی مشخص شوند.
5. نام، ایمیل معتبر و رضایت ثبت اطلاعات را وارد کنید. پس از ارسال، پیام «You’re on the list» باید ظاهر شود.
6. آدرس `http://localhost:4173/api/health` باید پاسخ `{"status":"ok"}` بدهد.

اطلاعاتی که در اجرای محلی وارد می‌کنید فقط در پایگاه‌دادهٔ محلی ذخیره می‌شوند و به نسخهٔ آنلاین نمی‌روند. سایت نمایشی ایمیل دعوت ارسال نمی‌کند و مبلغی دریافت نمی‌کند.

## ۵. اجرای تست‌ها و ساخت نهایی

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:integration
npm run build:worker
```

تست یکپارچه یک پایگاه‌دادهٔ موقت جداگانه می‌سازد و پس از آزمایش پاک می‌کند. پایگاه‌دادهٔ آنلاین را تغییر نمی‌دهد.

برای بررسی واکنش‌گرایی و دسترس‌پذیری، در حالی که سایت در حال اجرا است، یک ترمینال جدید باز کنید:

```powershell
npm run review:browser
```

سپس `http://localhost:4173/__qa.html` را باز کنید و **Run responsive suite** را بزنید. پس از اتمام:

```powershell
npm run review:clean
```

## خطاهای رایج

- اگر `npm` شناخته نشد، Node.js را نصب کنید و VS Code را کامل ببندید و دوباره باز کنید.
- اگر PowerShell اجرای `npm.ps1` را مسدود کرد، ترمینال **Command Prompt** را در VS Code انتخاب کنید یا به‌جای `npm` از `npm.cmd` استفاده کنید.
- اگر نصب پکیج‌ها کامل نشد، اتصال به npm را بررسی و `npm ci` را دوباره اجرا کنید. فایل lock را حذف نکنید.
- اگر پورت 4173 یا 8787 اشغال است، اجرای قبلی همین پروژه را با Ctrl+C متوقف کنید.
- اگر فرم خطای ارتباط داد، مطمئن شوید API در همان ترمینال راه‌اندازی شده و پاسخ health درست است. `npm run preview` به‌تنهایی API را اجرا نمی‌کند.
- فایل‌های `.github/workflows/*.yml` دستور ترمینال نیستند؛ آن‌ها در GitHub Actions اجرا می‌شوند.

## انتشار با حساب Cloudflare خودتان

```powershell
npx wrangler login
npm run build
npm run db:remote
npx wrangler deploy
```

این پروژه برای حساب فعلی شما تنظیم شده است. برای حساب دیگر، ابتدا یک D1 جدید بسازید و شناسهٔ آن را در `wrangler.jsonc` جایگزین کنید. آدرس تولید را نیز در `scripts/prerender.mjs` تغییر دهید. هیچ رمز یا توکنی را داخل کد یا README قرار ندهید.
