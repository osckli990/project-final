import { useEffect, useRef } from "react";

/** like useEffect, but skips the first render */
export const useUpdateEffect = (effect, deps) => {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
