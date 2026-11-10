'use client';

import { useState } from 'react';
import { CareerCompare } from '@/components/career/CareerCompare';
import { Button } from '@/components/ui/button';
import { readCareerComparePage, type CompareRead } from '@/lib/career/compare';
import { DESIGN_COMPARE_PILOT } from '@/lib/career/designComparePilot';
import type { Locale } from '@/lib/i18n/locales';

const [industrial, graphic] = DESIGN_COMPARE_PILOT;
type Preset = [{ slug: typeof industrial; read: CompareRead }, { slug: typeof graphic; read: CompareRead }];

export function EmbeddedDesignCareerCompare({ locale }: { locale: Locale }) {
  const zh = locale === 'zh';
  const [preset, setPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(false);

  async function openComparison() {
    if (loading || preset) return;
    setLoading(true);
    const [first, second] = await Promise.all([
      readCareerComparePage(locale, industrial),
      readCareerComparePage(locale, graphic),
    ]);
    setPreset([{ slug: industrial, read: first }, { slug: graphic, read: second }]);
    setLoading(false);
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" id="intj-design-comparison">
      <h4 className="m-0 text-lg font-semibold text-slate-900">
        {zh ? '比较工业设计与平面设计' : 'Compare industrial and graphic design'}
      </h4>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        {zh
          ? '用同一只水杯，比较修改产品结构和修改视觉说明的区别。对照真实任务后，任选一项做 15 分钟。'
          : 'Use the same cup to compare changing a product with changing its visual instructions. Review the real tasks, then try one for 15 minutes.'}
      </p>
      {preset
        ? <div className="mt-4"><CareerCompare locale={locale} initialSlots={preset} embedded /></div>
        : <Button type="button" className="mt-3 h-auto min-h-11 max-w-full whitespace-normal py-2" disabled={loading} onClick={() => void openComparison()}>
            {loading ? (zh ? '正在读取职业档案…' : 'Loading career profiles…') : (zh ? '打开对比与 15 分钟试做' : 'Open comparison and 15-minute exercise')}
          </Button>}
    </div>
  );
}
