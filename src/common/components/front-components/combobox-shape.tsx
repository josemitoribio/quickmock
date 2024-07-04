import { ShapeConfig } from "konva/lib/Shape";
import { forwardRef } from "react";
import { Path, Group, Text } from "react-konva";

// Important: we extend from Shapeconfig so we can get additional shape params
// TODO: we will need to add more props like for instance text content
// but we have to check how to pass it to the shape (there will be different types of shapes)
interface ComboBoxShapeProps extends ShapeConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ComboBoxShape = forwardRef<any, ComboBoxShapeProps>(
  ({ x, y, width, height, ...shapeProps }, ref) => {
    return (
      <Group
        x={x}
        y={y}
        ref={ref}
        width={width}
        height={height}
        {...shapeProps}
      >
        {/* Rectangle */}
        <Path
          data={`M1,1 H${width - 2} V${height - 2} H1 Z`}
          stroke="black"
          strokeWidth={2}
        />
        {/* Polygon (Arrow), combo triangle dropdown */}
        <Path
          data={`M${width - 30},${(height + 10) / 2 - 15} L${width - 10},${
            (height + 10) / 2 - 15
          } L${width - 20},${(height + 10) / 2}`}
          fill="black"
        />

        {/* Combo arrow vertical line separator */}
        <Path
          data={`M${width - 40},1 L${width - 40},${height - 1}`}
          stroke="black"
          strokeWidth={2}
        />

        {/* Text */}
        <Text
          x={10}
          y={(height - 25) / 2 + 5}
          text="Select an option"
          fontSize={20}
          fontFamily="Arial"
          fill="black"
        />
      </Group>
    );
  }
);
