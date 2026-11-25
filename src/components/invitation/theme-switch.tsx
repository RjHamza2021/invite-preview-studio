import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { getThemePreference, saveThemePreference, type ThemePreference } from "@/services/api";
import { useLanguage } from "@/i18n/provider";

const ThemeContext = createContext<{ preference: ThemePreference; choose: (value: ThemePreference) => void }>({ preference: "system", choose: () => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  useEffect(() => {
    const saved = getThemePreference();
    setPreference(saved);
    document.documentElement.dataset['theme'] = saved;
  }, []);
  function choose(value: ThemePreference) {
    setPreference(value);
    document.documentElement.dataset['theme'] = value;
    saveThemePreference(value);
  }
  return <ThemeContext.Provider value={{ preference, choose }}>{children}</ThemeContext.Provider>;
}
export function ThemeSwitch() {
  const { preference, choose } = useContext(ThemeContext);
  const { t } = useLanguage();
  const Icon = preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="theme-switch" aria-label={t("appearance")} title={t("appearance")}><Icon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={preference} onValueChange={(value) => { if (value === "system" || value === "light" || value === "dark") choose(value); }}>
          <DropdownMenuRadioItem value="light"><Sun />{t("themeLight")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon />{t("themeDark")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor />{t("themeDevice")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}