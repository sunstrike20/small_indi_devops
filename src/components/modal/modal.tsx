import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { ModalOverlay } from '../modal-overlay/modal-overlay';
import styles from './modal.module.scss';
import { ModalProps } from '@utils/types';

const modalRoot = document.getElementById('modals');

export const Modal: React.FC<ModalProps> = ({ children, title, onClose }) => {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEsc);

		return () => {
			document.removeEventListener('keydown', handleEsc);
		};
	}, [onClose]);

	return ReactDOM.createPortal(
		<>
			<ModalOverlay onClick={onClose} />
			<div className={styles.modal} data-testid="modal">
				<div className={styles.header}>
					<h2 className={`${styles.title} text text_type_main-large`}>
						{title}
					</h2>
					<button className={styles.closeButton} onClick={onClose} data-testid="modal-close">
						<CloseIcon type='primary' />
					</button>
				</div>
				<div className={styles.content}>{children}</div>
			</div>
		</>,
		modalRoot as HTMLElement
	);
};
