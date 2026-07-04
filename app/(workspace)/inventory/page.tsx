import type { Metadata } from "next";

import {
  InventoryPageShell,
  type InventorySearchParams
} from "@/components/inventory/inventory-page-shell";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse JETS demo inventory used by Solution Builder projects. No live marketplace scraping."
};

type InventoryPageProps = {
  searchParams?: Promise<InventorySearchParams>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  return <InventoryPageShell searchParams={searchParams} />;
}
