import Sample from "@/app/(localized)/[locale]/reports/samples/[test]/page";
export { metadata } from "@/app/(localized)/[locale]/reports/samples/[test]/page";
export default async function TraditionalSample({params}:{params:Promise<{test:string}>}) {return Sample({params:params.then(({test})=>({locale:"zh-TW",test}))});}
