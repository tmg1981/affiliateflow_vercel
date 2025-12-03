import React from 'react';

const GuidePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-gray-200">
      <h1 className="text-3xl font-bold text-white mb-6">راهنمای حل خطای محدودیت استفاده (Rate Limit)</h1>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-6">
        
        <div>
          <h2 className="text-xl font-semibold text-teal-400 mb-2">مشکل چیست؟</h2>
          <p className="leading-relaxed">
            خطای "Persistent API Rate Limit Error" که با آن مواجه می‌شوید، تقریباً همیشه به دلیل محدودیت‌های بسیار سختگیرانه گوگل برای پروژه‌هایی است که در پلن رایگان هستند و **هنوز صورت‌حساب (Billing) برای آن‌ها فعال نشده است.**
          </p>
          <p className="leading-relaxed mt-2">
            حتی اگر کلید API شما معتبر باشد، گوگل به پروژه‌هایی که هویت مالی آن‌ها تأیید نشده، اجازه استفاده بسیار محدودی می‌دهد.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-teal-400 mb-2">راه حل قطعی: فعال‌سازی صورت‌حساب</h2>
          <p className="leading-relaxed">
            فعال کردن صورت‌حساب به معنای پرداخت هزینه نیست. شما همچنان از سطح استفاده رایگان (Free Tier) بهره‌مند خواهید شد، اما گوگل محدودیت‌های پروژه شما را به شکل چشمگیری افزایش می‌دهد. این کار مانند یک تأیید هویت برای گوگل عمل می‌کند.
          </p>
        </div>
        
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">مراحل قدم به قدم:</h3>
            
            <div className="bg-gray-700 p-4 rounded-md">
                <p className="font-bold">۱. ورود به کنسول Google Cloud:</p>
                <p className="mt-1">
                    به <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">کنسول Google Cloud</a> بروید و با همان حساب گوگلی که کلید API را ساخته‌اید وارد شوید.
                </p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-md">
                <p className="font-bold">۲. انتخاب پروژه صحیح:</p>
                <p className="mt-1">
                    در بالای صفحه، مطمئن شوید پروژه‌ای که کلید API شما به آن تعلق دارد، انتخاب شده باشد.
                </p>
            </div>

            <div className="bg-gray-700 p-4 rounded-md">
                <p className="font-bold">۳. رفتن به بخش صورت‌حساب (Billing):</p>
                <p className="mt-1">
                    از منوی همبرگری (سه خط) در بالا سمت چپ، گزینه <span className="font-mono text-teal-300">Billing</span> را پیدا و انتخاب کنید.
                </p>
            </div>
            
             <div className="bg-gray-700 p-4 rounded-md">
                <p className="font-bold">۴. اتصال حساب صورت‌حساب به پروژه:</p>
                <p className="mt-1">
                    در این صفحه، اعلانی مبنی بر "This project has no billing account" (این پروژه حساب صورت‌حساب ندارد) مشاهده خواهید کرد. روی دکمه <span className="font-mono text-teal-300">Link a billing account</span> کلیک کنید.
                </p>
                 <p className="mt-2 text-sm text-gray-400">
                    اگر از قبل حساب صورت‌حساب دارید، آن را انتخاب کنید. در غیر این صورت، روی <span className="font-mono text-teal-300">Create billing account</span> کلیک کرده و مراحل را دنبال کنید. (این مرحله ممکن است نیاز به اطلاعات کارت اعتباری داشته باشد، اما تا زمانی که از سطح رایگان فراتر نروید، هزینه‌ای از شما کسر نخواهد شد.)
                </p>
            </div>
            
             <div className="bg-green-900/50 p-4 rounded-md text-green-300">
                <p className="font-bold">۵. تمام شد!</p>
                <p className="mt-1">
                    پس از اتصال موفقیت‌آمیز، چند دقیقه صبر کنید. سپس به برنامه AffiliateFlow برگردید و دوباره برای ساخت پست تلاش کنید. مشکل شما باید به طور کامل حل شده باشد.
                </p>
            </div>

        </div>

      </div>
    </div>
  );
};

export default GuidePage;
