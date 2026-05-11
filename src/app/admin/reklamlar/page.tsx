import { getAdvertisements } from "@/app/actions/site-settings";
import { AdsClient } from "./AdsClient";

export default async function AdsPage() {
  const ads = await getAdvertisements();
  return <AdsClient initialAds={ads} />;
}
