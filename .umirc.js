// ref: https://umijs.org/config/
export default {
  history: 'hash',
  treeShaking: true,
  publicPath: './',
  outputPath: './dist/renderer',
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: true,
        title: 'Upcount',
        dll: {
          exclude: ['bootstrap'],
        },
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
      },
    ],
  ],
  lessLoaderOptions: {
    modifyVars: {
      '@table-row-hover-bg': 'transparent',
    },
  },
  define: {
    API_URL: process.env.API_URL,
  },
};
