import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import classNames from "classnames";
import type { ReactNode } from "react";

import styles from "./SortableList.module.scss";

type SortableItem = {
  id: number;
};

type SortableListProps<Item extends SortableItem> = {
  children: (item: Item) => ReactNode;
  getHandleText: (item: Item) => string;
  isItemVisible?: (item: Item) => boolean;
  items: Array<Item>;
  onReorder: (orderedIds: Array<number>) => void;
};

export function SortableList<Item extends SortableItem>({
  children,
  getHandleText,
  isItemVisible = alwaysVisible,
  items,
  onReorder,
}: SortableListProps<Item>) {
  const visibleItems = items.filter(isItemVisible);
  const visibleIndexById = new Map(
    visibleItems.map((item, index) => [item.id, index]),
  );
  const canDrag = visibleItems.length > 1;

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source } = event.operation;
    if (!isSortable(source)) return;

    const { index, initialIndex } = source;
    if (index === initialIndex) return;

    const reorderedVisibleItems = [...visibleItems];
    const [movedItem] = reorderedVisibleItems.splice(initialIndex, 1);
    if (!movedItem) return;

    reorderedVisibleItems.splice(index, 0, movedItem);
    let visibleIndex = 0;

    onReorder(
      items.map((item) =>
        isItemVisible(item) ? reorderedVisibleItems[visibleIndex++].id : item.id,
      ),
    );
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      {items.map((item, itemIndex) => {
        const visibleIndex = visibleIndexById.get(item.id);
        const isHidden = visibleIndex === undefined;

        return (
          <SortableListItem
            canDrag={canDrag}
            hidden={isHidden}
            id={item.id}
            index={visibleIndex ?? itemIndex}
            key={item.id}
            handleText={getHandleText(item)}
          >
            {children(item)}
          </SortableListItem>
        );
      })}
    </DragDropProvider>
  );
}

type SortableListItemProps = {
  canDrag: boolean;
  children: ReactNode;
  handleText: string;
  hidden: boolean;
  id: number;
  index: number;
};

function SortableListItem({
  canDrag,
  children,
  handleText,
  hidden,
  id,
  index,
}: SortableListItemProps) {
  const { handleRef, isDragSource, isDropTarget, ref } = useSortable({
    disabled: hidden || !canDrag,
    group: hidden ? "hidden" : "visible",
    id,
    index,
  });

  return (
    <div
      className={classNames(styles.item, {
        [styles.dragging]: isDragSource,
        [styles.dropTarget]: isDropTarget,
      })}
      hidden={hidden}
      ref={ref}
    >
      <div className={styles.content}>{children}</div>
      <button
        className={styles.handle}
        disabled={!canDrag}
        ref={handleRef}
        type="button"
      >
        <span className={styles.visuallyHidden}>{handleText}</span>
        <svg
          aria-hidden="true"
          className={styles.grip}
          viewBox="0 0 16 28"
        >
          <path d="M3 7.5 8 2l5 5.5M8 2v10M3 20.5 8 26l5-5.5M8 26V16" />
        </svg>
      </button>
    </div>
  );
}

function alwaysVisible() {
  return true;
}
