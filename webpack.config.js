//引入nodeJs内置的path模块
import path from 'path';
import { fileURLToPath } from 'url'

const __filenameNew = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filenameNew)

export default {
  // 模式
  mode: 'development', // 也可以使用 production，产品模式会对代码进行压缩
  // 入口
  entry: './src/index.js', 
  // 出口
  output: {
    // 打包文件夹
    path: path.resolve(__dirname, 'dist'),
    // 打包文件
    filename: 'airpayee.js', 
    // 向外暴露的对象的名称
    library: 'airpayee',
    // 打包生成库可以通过esm/commonjs/reqirejs的语法引入
    libraryTarget: 'umd', 
  },
  module: { //要打包的第三方模块
    rules: [
      { test: /\.js|jsx$/, use: 'babel-loader', 
      exclude: /node_modules/ }
    ]
  }
}