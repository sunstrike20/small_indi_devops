import React from 'react';
import styles from './order-stats.module.scss';

interface OrderStatsProps {
	doneOrders: string[];
	pendingOrders: string[];
	totalCompleted: number;
	todayCompleted: number;
}

export const OrderStats: React.FC<OrderStatsProps> = ({
	doneOrders,
	pendingOrders,
	totalCompleted,
	todayCompleted
}) => {
	const formatNumber = (num: number): string => {
		return num.toLocaleString('ru-RU');
	};

	return (
		<div className={styles.stats}>
			<div className={styles.ordersBoard}>
				<div className={styles.doneOrders}>
					<h3 className={styles.doneTitle}>Готовы:</h3>
					<div className={styles.doneOrdersList}>
						{doneOrders.slice(0, 5).map((orderId, index) => (
							<div 
								key={orderId} 
								className={styles.doneOrderNumber}
								style={{ order: index }}
							>
								{orderId}
							</div>
						))}
					</div>
				</div>

				<div className={styles.inWorkOrders}>
					<h3 className={styles.inWorkTitle}>В работе:</h3>
					<div className={styles.inWorkOrdersList}>
						{pendingOrders.slice(0, 5).map((orderId, index) => (
							<div 
								key={orderId} 
								className={styles.inWorkOrderNumber}
								style={{ order: index }}
							>
								{orderId}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className={styles.completedAllTime}>
				<h3 className={styles.allTimeTitle}>Выполнено за все время:</h3>
				<div className={styles.allTimeNumber}>
					{formatNumber(totalCompleted)}
				</div>
			</div>

			<div className={styles.completedToday}>
				<h3 className={styles.todayTitle}>Выполнено за сегодня:</h3>
				<div className={styles.todayNumber}>
					{formatNumber(todayCompleted)}
				</div>
			</div>
		</div>
	);
}; 