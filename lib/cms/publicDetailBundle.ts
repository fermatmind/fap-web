export type PublicDetailBundle<Detail, Seo> = {
  detail: Detail | null;
  seo: Seo | null;
};

export async function loadPublicDetailBundle<Detail, Seo>({
  readDetail,
  readSeo,
}: {
  readDetail: () => Promise<Detail | null>;
  readSeo: () => Promise<Seo | null>;
}): Promise<PublicDetailBundle<Detail, Seo>> {
  const detail = await readDetail();

  if (!detail) {
    return { detail: null, seo: null };
  }

  return {
    detail,
    seo: await readSeo(),
  };
}
