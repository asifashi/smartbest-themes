import { memo, useEffect, useState } from 'react';

/**
 * DealCountdown
 * -----------------------------------------------------------------------
 * Live "ends in" timer for a discounted section.
 *
 * Driven by real product data: the grid passes the EARLIEST `discount_ends`
 * among its products, so the timer reflects the first offer to expire rather
 * than a decorative fake deadline. Renders nothing when no product in the
 * section is time-limited, which keeps it honest on non-sale rows.
 *
 * Ticks once a second, cleans up on unmount, and disappears when it hits zero.
 */

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function split(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export interface DealCountdownProps {
  /** ISO date string - the moment the offer ends */
  endsAt: string;
  labels?: { days?: string; hours?: string; minutes?: string; seconds?: string };
}

export const DealCountdown = memo(function DealCountdown({
  endsAt,
  labels,
}: DealCountdownProps) {
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    // Only tick while the deadline is still ahead - no timer left running
    // on an expired offer.
    if (target - Date.now() <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target)) return null;
  const left = target - now;
  if (left <= 0) return null;

  const t = split(left);
  const l = {
    days: labels?.days ?? 'ي',
    hours: labels?.hours ?? 'س',
    minutes: labels?.minutes ?? 'د',
    seconds: labels?.seconds ?? 'ث',
  };

  const cells: Array<[string, string]> = [];
  if (t.days > 0) cells.push([pad(t.days), l.days]);
  cells.push([pad(t.hours), l.hours]);
  cells.push([pad(t.minutes), l.minutes]);
  cells.push([pad(t.seconds), l.seconds]);

  return (
    <div className="deal-countdown" role="timer" aria-live="off">
      {cells.map(([value, label], i) => (
        <span key={i} className="deal-countdown__cell">
          <span className="deal-countdown__num">{value}</span>
          <span className="deal-countdown__unit">{label}</span>
        </span>
      ))}
    </div>
  );
});

export default DealCountdown;
