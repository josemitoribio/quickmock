import { ShapeRefs } from '@/core/model';
import { useCanvasContext } from '@/core/providers';
import { renderShapeComponent } from '@/pods/canvas/shape-renderer';
import { calculateCanvasBounds } from '@/pods/toolbar/components/export-button/export-button.utils';
import { KonvaEventObject } from 'konva/lib/Node';
import { createRef, useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { ThumbPageContextMenu } from './context-menu';
import { useContextMenu } from '../use-context-menu-thumb.hook';
import { CaretDown } from '@/common/components/icons';
import classes from './thumb-page.module.css';

interface Props {
  pageIndex: number;
  onSetActivePage: (pageId: string) => void;
  setPageTitleBeingEdited: (index: number) => void;
}

export const ThumbPage: React.FunctionComponent<Props> = props => {
  const { pageIndex, onSetActivePage, setPageTitleBeingEdited } = props;
  const { fullDocument } = useCanvasContext();
  const page = fullDocument.pages[pageIndex];
  const shapes = page.shapes;
  const fakeShapeRefs = useRef<ShapeRefs>({});

  const bounds = calculateCanvasBounds(shapes);
  const canvasSize = {
    width: bounds.x + bounds.width,
    height: bounds.y + bounds.height,
  };
  const scaleFactorX = 200 / canvasSize.width;
  const scaleFactorY = 180 / canvasSize.height;
  const finalScale = Math.min(scaleFactorX, scaleFactorY);

  const {
    showContextMenu,
    contextMenuRef,
    setShowContextMenu,
    handleShowContextMenu,
  } = useContextMenu();

  return (
    <>
      <div
        className={classes.container}
        onClick={() => onSetActivePage(page.id)}
        onContextMenu={handleShowContextMenu}
      >
        <Stage width={200} height={180} scaleX={finalScale} scaleY={finalScale}>
          <Layer>
            {shapes.map(shape => {
              if (!fakeShapeRefs.current[shape.id]) {
                fakeShapeRefs.current[shape.id] = createRef();
              }
              return renderShapeComponent(shape, {
                handleSelected: () => {},
                shapeRefs: fakeShapeRefs,
                handleDragEnd:
                  (_: string) => (_: KonvaEventObject<DragEvent>) => {},
                handleTransform: () => {},
              });
            })}
          </Layer>
        </Stage>
        <span
          onClick={handleShowContextMenu}
          className={classes['icon-container']}
        >
          <CaretDown />
        </span>
        {showContextMenu && (
          <ThumbPageContextMenu
            contextMenuRef={contextMenuRef}
            setShowContextMenu={setShowContextMenu}
            pageIndex={pageIndex}
            setPageTitleBeingEdited={setPageTitleBeingEdited}
          />
        )}
      </div>
    </>
  );
};
