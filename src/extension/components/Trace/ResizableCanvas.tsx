import React, {
  FC,
  CanvasHTMLAttributes,
  ForwardRefRenderFunction,
  MutableRefObject,
} from "react";
import useCombinedRefs from "../../hooks/useCombinedRefs";

const CanvasStyle = {
  width: "100%",
  height: "100%",
};

const ResizableCanvas: ForwardRefRenderFunction<
  HTMLCanvasElement,
  CanvasHTMLAttributes<HTMLCanvasElement>
> = (props, ref) => {
  const innerRef = React.useRef<HTMLCanvasElement>(null);
  const combinedRef = useCombinedRefs(
    ref as MutableRefObject<HTMLCanvasElement>,
    innerRef
  );

  const handleResize = React.useCallback(() => {
    const canvas = combinedRef.current;

    if (canvas) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  }, [combinedRef.current]);

  React.useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);

  return <canvas style={CanvasStyle} ref={combinedRef} {...props} />;
};

export default React.forwardRef(ResizableCanvas);
