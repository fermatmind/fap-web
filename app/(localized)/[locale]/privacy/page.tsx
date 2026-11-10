import { Container } from "@/components/layout/Container";
import { resolveLocale } from "@/lib/i18n/getDict";
import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "privacy";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const zh = resolveLocale((await params).locale) === "zh";

  return (
    <>
      {await renderContentPage({ params, slug: SLUG })}
      <Container className="max-w-4xl pb-12">
        <section aria-labelledby="advertising-privacy" className="space-y-3">
          <h2 id="advertising-privacy" className="text-xl font-semibold">
            {zh ? "展示广告与隐私选项" : "Display ads and privacy choices"}
          </h2>
          <p>
            {zh
              ? "部分公开娱乐测试的介绍页和答题过程中使用 Google AdSense。Google 及其广告合作伙伴可能通过 Cookie、网页信标、IP 地址或其他标识符投放和衡量广告。根据你的隐私选择，他们可能利用你访问本站和其他网站的记录提供个性化广告。个人结果和账户页面不展示此广告单元。"
              : "Some public entertainment quiz introductions and question screens use Google AdSense. Google and its advertising partners may use cookies, web beacons, IP addresses, or other identifiers to serve and measure ads. Depending on your privacy choices, they may personalize ads based on visits to this site and other sites. Personal results and account pages do not display this ad unit."}
          </p>
          <p>
            {zh
              ? "如广告页显示隐私设置，可在那里更改或撤回选择。"
              : "If the advertising page displays privacy settings, you can use them to change or withdraw your choices."}{" "}
            <a className="underline" href="https://policies.google.com/technologies/partner-sites">
              {zh ? "Google 如何使用合作伙伴网站的数据" : "How Google uses data from partner sites"}
            </a>{" · "}
            <a className="underline" href="https://myadcenter.google.com/">
              {zh ? "Google 广告个性化设置" : "Google ad personalization settings"}
            </a>
          </p>
        </section>
      </Container>
    </>
  );
}
