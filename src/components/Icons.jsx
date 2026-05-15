const IconBase = ({ children, className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const MenuIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </IconBase>
);

export const PanelIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </IconBase>
);

export const GlobeIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18" />
    <path d="M12 3a15 15 0 0 0 0 18" />
  </IconBase>
);

export const BellIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </IconBase>
);

export const LogoutIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

export const DashboardIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="11" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="18" width="7" height="3" rx="1.5" />
  </IconBase>
);

export const ProfileIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </IconBase>
);

export const RequestIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 7h8" />
    <path d="M8 12h8" />
    <path d="M8 17h5" />
  </IconBase>
);

export const AgreementIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-3 2-3-2-4 2V6a2 2 0 0 1 2-2Z" />
    <path d="M9 8h6" />
  </IconBase>
);

export const ReviewIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z" />
  </IconBase>
);

export const PaletteIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 0-4H12a3 3 0 1 1 0-14Z" />
    <circle cx="7.5" cy="10" r="1" />
    <circle cx="9.5" cy="6.5" r="1" />
    <circle cx="14.5" cy="6.5" r="1" />
    <circle cx="16.5" cy="10" r="1" />
  </IconBase>
);

export const CloseIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </IconBase>
);

export const RefreshIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </IconBase>
);

export const UploadIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 20h16" />
  </IconBase>
);

export const ChevronIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="m9 6 6 6-6 6" />
  </IconBase>
);

export const CheckIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="m5 12 4 4L19 6" />
  </IconBase>
);

export const ClockIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconBase>
);
