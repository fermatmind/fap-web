import { native, legacy } from "./activityTitles.json";
import { entertainmentActivityDefinitions } from "./activityDefinitions";

const titles = new Map([...legacy, ...native].map(item => [item.slug, item.title]));
titles.set("friendship-quiz", { en: "Friendship Quiz", zh: "朋友默契" });
export const entertainmentActivityCatalog = entertainmentActivityDefinitions.map(item => ({ ...item, title: titles.get(item.slug)! }));
