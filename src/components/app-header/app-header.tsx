import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
	BurgerIcon,
	ListIcon,
	ProfileIcon,
	Logo,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './app-header.module.scss';

export const AppHeader: React.FC = () => {
	const location = useLocation();
	const isActive = (path: string): boolean => location.pathname === path;

	return (
		<header className={styles.header}>
			<nav className={styles.nav}>
				<div className={styles.navGroup}>
					<Link
						to='/'
						className={`${styles.link} ${
							isActive('/') ? styles.active : ''
						} text text_type_main-default`}>
						<BurgerIcon type={isActive('/') ? 'primary' : 'secondary'} />
						Конструктор
					</Link>
					<Link
						to='/feed'
						className={`${styles.link} ${
							isActive('/feed') ? styles.active : ''
						} text text_type_main-default`}>
						<ListIcon type={isActive('/feed') ? 'primary' : 'secondary'} />
						Лента заказов
					</Link>
				</div>

				<div className={styles.logo}>
					<Link to='/'>
						<Logo />
					</Link>
				</div>

				<Link
					to='/profile'
					className={`${styles.link} ${
						isActive('/profile') ? styles.active : ''
					} text text_type_main-default`}>
					<ProfileIcon type={isActive('/profile') ? 'primary' : 'secondary'} />
					Личный кабинет
				</Link>
			</nav>
		</header>
	);
};
