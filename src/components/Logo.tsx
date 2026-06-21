const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cocktail coupe silhouette — curved, organic, never cross-like */}
      <path
        d="M8 14C8 14 12 6 20 6C28 6 32 14 32 14C32 14 30 18 20 18C10 18 8 14 8 14Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18 18V30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M14 32H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Garnish dot — the "signature" detail */}
      <circle cx="26" cy="10" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
};

export default Logo;
