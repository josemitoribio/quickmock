import { createRef, useMemo, useEffect, useState } from 'react';
import Konva from 'konva';
import { useCanvasContext } from '@/core/providers';
import { Layer, Line, Stage, Transformer } from 'react-konva';
import { useTransform } from './use-transform.hook';
import { renderShapeComponent } from './shape-renderer';
import { useDropShape } from './use-drop-shape.hook';
import { useMonitorShape } from './use-monitor-shape.hook';
import classes from './canvas.pod.module.css';
import { EditableComponent } from '@/common/components/inline-edit';
import { useSnapIn } from './use-snapin.hook';
import { ShapeType } from '@/core/model';
import { useDropImageFromDesktop } from './use-drop-image-from-desktop';

export const CanvasPod = () => {
  const [isTransfomerBeingDragged, setIsTransfomerBeingDragged] =
    useState(false);

  const {
    shapes,
    scale,
    selectionInfo,
    addNewShape,
    updateShapeSizeAndPosition,
    updateShapePosition,
    stageRef,
  } = useCanvasContext();

  const {
    shapeRefs,
    transformerRef,
    handleSelected,
    handleClearSelection,
    selectedShapeRef,
    updateTextOnSelected,
    updateOtherPropsOnSelected,
  } = selectionInfo;

  const addNewShapeAndSetSelected = (type: ShapeType, x: number, y: number) => {
    const shapeId = addNewShape(type, x, y);
    // TODO add issue enhance this
    setTimeout(() => {
      handleSelected(shapeId, type);
    });
  };

  const { isDraggedOver, dropRef } = useDropShape();
  useMonitorShape(dropRef, addNewShapeAndSetSelected);

  const getSelectedShapeKonvaId = (): string => {
    let result = '';

    if (selectedShapeRef.current) {
      result = String(selectedShapeRef.current._id);
    }

    return result;
  };

  const selectedShapeKonvaId = useMemo(
    () => getSelectedShapeKonvaId(),
    [selectedShapeRef.current]
  );

  const {
    handleTransformerDragMove,
    showSnapInHorizontalLine,
    showSnapInVerticalLine,
    yCoordHorizontalLine,
    xCoordVerticalLine,
  } = useSnapIn(transformerRef, selectedShapeKonvaId);

  const { handleTransform, handleTransformerBoundBoxFunc } = useTransform(
    updateShapeSizeAndPosition
  );

  // Note here: Limitation, Pragmatic Drag and Drop has any on the DropRef
  // but we need to cast it to HTMLDivElement
  const { handleDragOver, handleDropImage } = useDropImageFromDesktop(
    dropRef as unknown as React.MutableRefObject<HTMLDivElement>
  );

  const handleDragEnd =
    (id: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();
      updateShapePosition(id, { x, y });
    };

  {
    /* TODO: add other animation for isDraggerOver */
  }
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDropImage}
      className={classes.canvas}
      ref={dropRef}
      style={{ opacity: isDraggedOver ? 0.5 : 1 }}
    >
      {/*TODO: move size to canvas provider?*/}
      <Stage
        width={3000}
        height={3000}
        onMouseDown={handleClearSelection}
        onTouchStart={handleClearSelection}
        ref={stageRef}
        scale={{ x: scale, y: scale }}
      >
        <Layer>
          {
            /* TODO compentize and simplify this */
            shapes.map(shape => {
              if (!shapeRefs.current[shape.id]) {
                shapeRefs.current[shape.id] = createRef();
              }

              return (
                <EditableComponent
                  key={shape.id}
                  coords={{ x: shape.x, y: shape.y }}
                  size={{ width: shape.width, height: shape.height }}
                  isEditable={shape.allowsInlineEdition}
                  text={shape.text ?? ''}
                  onTextSubmit={updateTextOnSelected}
                  onImageSrcSubmit={srcData =>
                    updateOtherPropsOnSelected('imageSrc', srcData)
                  }
                  scale={scale}
                  editType={shape.editType ?? 'input'}
                >
                  {renderShapeComponent(shape, {
                    handleSelected,
                    shapeRefs,
                    handleDragEnd,
                    handleTransform,
                  })}
                </EditableComponent>
              );
            })
          }
          <Transformer
            ref={transformerRef}
            flipEnabled={false}
            boundBoxFunc={handleTransformerBoundBoxFunc}
            onDragStart={() => setIsTransfomerBeingDragged(true)}
            onDragMove={handleTransformerDragMove}
            onDragEnd={() => setIsTransfomerBeingDragged(false)}
          />
          {isTransfomerBeingDragged && showSnapInHorizontalLine && (
            <Line
              points={[
                0,
                yCoordHorizontalLine,
                stageRef.current?.width() ?? 0,
                yCoordHorizontalLine,
              ]}
              stroke="rgb(0,161,255"
              dash={[4, 6]}
              strokeWidth={1}
            />
          )}
          {isTransfomerBeingDragged && showSnapInVerticalLine && (
            <Line
              points={[
                xCoordVerticalLine,
                0,
                xCoordVerticalLine,
                stageRef.current?.height() ?? 0,
              ]}
              stroke="rgb(0,161,255"
              dash={[4, 6]}
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
