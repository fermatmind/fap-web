import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

// Read live CMS variants at request time, including missing/withdrawn content.
export const dynamic = "force-dynamic";
export const generateMetadata = () => generateTraditionalContentPageMetadata("privacy");
export default async function TraditionalContentPage() {
  return <>
    {await renderTraditionalContentPage("privacy")}
    <section aria-labelledby="advertising-privacy" className="mt-10 space-y-3">
      <h2 id="advertising-privacy" className="text-xl font-semibold">展示廣告與隱私選項</h2>
      <p>部分公開娛樂測驗的介紹頁和作答過程使用 Google AdSense。Google 及其廣告合作夥伴可能透過 Cookie、網路信標、IP 位址或其他識別碼投放及衡量廣告。依你的隱私選擇，他們可能利用你瀏覽本站及其他網站的記錄提供個人化廣告。個人結果及帳戶頁面不展示此廣告單元。</p>
      <p>如果廣告頁面顯示隱私設定，可在該處變更或撤回選擇。 <a className="underline" href="https://policies.google.com/technologies/partner-sites?hl=zh-TW">Google 如何使用合作夥伴網站的資料</a> · <a className="underline" href="https://myadcenter.google.com/">Google 廣告個人化設定</a></p>
    </section>
  </>;
}
