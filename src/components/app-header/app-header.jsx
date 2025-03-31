import { BurgerIcon, ListIcon, ProfileIcon, Logo } from '@ya.praktikum/react-developer-burger-ui-components'
import styles from './app-header.module.scss';

export const AppHeader = () => {
    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.navGroup}>
                    <a href="/" className={`${styles.link} ${styles.active} text text_type_main-default`}>
                        <BurgerIcon type="primary" />
                        Конструктор
                    </a>
                    <a href="/orders" className={`${styles.link} text text_type_main-default`}>
                        <ListIcon type="secondary" />
                        Лента заказов
                    </a>
                </div>
                
                <div className={styles.logo}>
                    <Logo />
                </div>
                
                <a href="/profile" className={`${styles.link} text text_type_main-default`}>
                    <ProfileIcon type="secondary" />
                    Личный кабинет
                </a>
            </nav>
        </header>
    )
}