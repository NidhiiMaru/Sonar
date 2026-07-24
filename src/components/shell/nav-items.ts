export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Console" },
  { href: "/map", label: "Map" },
  { href: "/species", label: "Species" },
  { href: "/forecast", label: "Forecast" },
  { href: "/alerts", label: "Alerts" },
  { href: "/about", label: "About" },
];
