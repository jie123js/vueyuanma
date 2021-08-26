//第一步初始化option,但是方法很多,所以要把方法写在原型上(主要是组件可能会用到)

import {initMixin} from './init.js'

function Vue(option){
    this._init(option)// 入口方法,初始化操作
}

//写成一个个的插件进行对原型的扩展
initMixin(Vue)


export default Vue