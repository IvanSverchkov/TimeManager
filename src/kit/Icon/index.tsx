export type IconName =
  | "calendar"
  | "check"
  | "clock"
  | "copy"
  | "eye"
  | "eye-off"
  | "pause"
  | "play"
  | "plus"
  | "target"
  | "trash"
  | "trend";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 24, className }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: (
      <>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect x="4" y="5" width="16" height="16" rx="3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    "eye-off": (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.2 0 9.5 7 9.5 7a17.4 17.4 0 0 1-3.2 4" />
        <path d="M15 14.7A3 3 0 0 1 9.3 9" />
        <path d="M6.7 6.8A17.6 17.6 0 0 0 2.5 12s3.3 7 9.5 7a10 10 0 0 0 4.1-.9" />
      </>
    ),
    pause: (
      <>
        <path d="M9 7v10" />
        <path d="M15 7v10" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5Z" />,
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6.5 7 .8 13h9.4l.8-13" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    trend: <path d="m4 16 5-5 4 3 7-8M16 6h4v4" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {paths[name]}
      </g>
    </svg>
  );
}
