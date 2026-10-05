import { useEffect, useState } from 'react';

// Include touch tablets and short phone-landscape windows without treating a
// normal laptop as a phone. The framed preview still explicitly opts in.
export const COMPACT_LAYOUT_QUERY = '(max-width: 768px), (max-width: 1024px) and (pointer: coarse), (max-width: 900px) and (max-height: 500px)';

export function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_LAYOUT_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(COMPACT_LAYOUT_QUERY);
    const update = () => setCompact(query.matches);
    update();
    if (query.addEventListener) query.addEventListener('change', update);
    else query.addListener(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener('change', update);
      else query.removeListener(update);
    };
  }, []);
  return compact;
}
