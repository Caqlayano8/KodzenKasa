import { getSiteSettings } from "@/app/actions/site-settings";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsClient settings={settings} />;
}
