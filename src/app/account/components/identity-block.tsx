// src/app/account/components/identity-block.tsx
// Avatar (initial) + name + email + member-since. Modernized typography.
type Props = {
  name: string;
  email: string;
  memberSince: string;
};

export function IdentityBlock({ name, email, memberSince }: Props) {
  const initial = (name || email).slice(0, 1).toUpperCase();
  return (
    <div className="flex items-start gap-ma-3">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-ai text-kinu flex items-center justify-center font-editorial text-base"
        aria-hidden
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1 pt-px">
        <p className="font-editorial text-[18px] leading-snug text-sumi truncate">
          {name || 'Your account'}
        </p>
        <p className="mt-0.5 text-[11px] text-stone truncate">{email}</p>
        {memberSince && (
          <p className="mt-1 text-[10px] tabular-nums text-ash">
            Member since {memberSince}
          </p>
        )}
      </div>
    </div>
  );
}
