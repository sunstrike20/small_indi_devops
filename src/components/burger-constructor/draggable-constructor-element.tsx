import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ConstructorElement, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import { DraggableConstructorElementProps, DragItem } from '@utils/types';

const DraggableConstructorElement: React.FC<DraggableConstructorElementProps> = ({ 
  item, 
  index, 
  handleDelete, 
  moveIngredient 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'constructor-element',
    item: () => ({ id: item.uuid, index, type: 'constructor-element' }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [{ handlerId }, drop] = useDrop<DragItem, unknown, { handlerId: string | symbol | null }>({
    accept: 'constructor-element',
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId()
    }),
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      moveIngredient(dragIndex, hoverIndex);
      
      draggedItem.index = hoverIndex;
    }
  });

  drag(drop(ref));
  
  const opacity = isDragging ? 0.5 : 1;
  
  return (
    <div 
      ref={ref} 
      className={styles.ingredient} 
      style={{ opacity }} 
      data-handler-id={handlerId}
      data-test-id={`constructor-element-${index}`}
    >
      <div className={styles.dragIcon}>
        <DragIcon type="primary" />
      </div>
      <ConstructorElement
        text={item.name}
        price={item.price}
        thumbnail={item.image}
        handleClose={() => handleDelete(item.uuid)}
      />
    </div>
  );
};

export default DraggableConstructorElement; 