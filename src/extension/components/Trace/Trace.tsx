import React, { FC, useRef } from "react";
import TracequestEvent from "../../../tracing/TracequestEvent";
import ResizableCanvas from "./ResizableCanvas";

type PropTypes = {
  events: TracequestEvent[];
};

const Trace: FC<PropTypes> = ({ events }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  }, []);

  return (
    <div className="canvas-container">
      <ResizableCanvas ref={canvasRef} />
    </div>
  );
};

export default Trace;
