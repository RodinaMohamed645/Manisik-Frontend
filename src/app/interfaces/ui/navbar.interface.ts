export interface NavLink {
  key: string;
  path: string;
  icon?: string;
}

export interface NavIcon {
  name: string;
  ariaLabel: string;
  action?: () => void;
  showBadge?: boolean;
}
