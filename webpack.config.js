import path from 'path';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './teffy.js', // path to your main file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'teffy.js',
    library: 'MyLibrary',
    libraryTarget: 'var',
  },
  target: 'web', // target environment is Node.js
  mode: 'development', // 'development' for development mode
  plugins: [
    new NodePolyfillPlugin()
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 9000,
  },
}