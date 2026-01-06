import { useCallback, useRef, useState } from "react";

const useLongPress = (onLongPress, onClick, { delay = 500 } = {}) => {
  const [isPressing, setIsPressing] = useState(false);
  const timeout = useRef();
  const isLongPressActive = useRef(false);

  const start = useCallback((event) => {
    isLongPressActive.current = false;
    setIsPressing(true); // Start the visual animation

    if (window.navigator.vibrate) {
      window.navigator.vibrate(10); 
    }
    
    timeout.current = setTimeout(() => {
      onLongPress(event);
      isLongPressActive.current = true;
      setIsPressing(false); // End animation after trigger
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((event, shouldTriggerClick = true) => {
    if (timeout.current) clearTimeout(timeout.current);
    
    if (shouldTriggerClick && onClick && !isLongPressActive.current) {
      onClick(event);
    }

    setIsPressing(false); // Reset visual state
    isLongPressActive.current = false;
  }, [onClick]);

  return {
    isPressing, // Export this to control CSS
    handlers: {
      onMouseDown: start,
      onTouchStart: start,
      onMouseUp: clear,
      onMouseLeave: (e) => clear(e, false),
      onTouchEnd: clear,
    }
  };
};

export default useLongPress;