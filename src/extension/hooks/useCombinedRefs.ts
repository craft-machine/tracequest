import React from 'react';

export default function useCombinedRefs<T>(...refs: React.MutableRefObject<T>[]) {
  const targetRef = React.useRef<T>();

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      ref.current = targetRef.current;
    })
  }, refs);

  return targetRef;
}