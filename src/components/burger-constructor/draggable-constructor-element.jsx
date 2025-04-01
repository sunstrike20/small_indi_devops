import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ConstructorElement, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import PropTypes from 'prop-types';
import styles from './burger-constructor.module.scss';
import { IngredientType } from '@utils/types';

const DraggableConstructorElement = ({ item, index, handleDelete, moveIngredient }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'constructor-element',
    item: () => ({ id: item.uuid, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [{ handlerId }, drop] = useDrop({
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

DraggableConstructorElement.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDelete: PropTypes.func.isRequired,
  moveIngredient: PropTypes.func.isRequired
};

export default DraggableConstructorElement;