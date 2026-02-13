import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Order status",
  robots: NOINDEX_ROBOTS,
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  return <OrdersClient orderNo={orderNo} />;
}
