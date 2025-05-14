const path = require('path'); //для того чтобы превратить отнсительный путь в абсолютный мы будем использовать пакет path
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'eval-source-map',
	devServer: {
		historyApiFallback: true, // Критически важно для React Router
		static: {
			directory: path.resolve(__dirname, '../dist'),
			publicPath: '/'
		},
		port: 8080,
		open: true,
		hot: true,
		proxy: {
			'/api': {
				target: 'https://norma.nomoreparties.space',
				changeOrigin: true,
				secure: false,
				headers: {
					Connection: 'keep-alive'
				}
			}
		}
	},
	output: {
		publicPath: '/' // Важно для React Router - все пути относительно корня
	},
	plugins: [new ReactRefreshWebpackPlugin()],
};
