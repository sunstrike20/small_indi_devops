module.exports = {
	mode: 'production',
	devtool: false,
	output: {
		publicPath: '/' // Важно для React Router - все пути относительно корня
	}
};
