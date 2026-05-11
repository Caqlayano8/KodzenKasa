import { getCustomPages } from "@/app/actions/site-settings";
import { PagesClient } from "./PagesClient";

export default async function PagesPage() {
  const pages = await getCustomPages();
  return <PagesClient initialPages={pages} />;
}
