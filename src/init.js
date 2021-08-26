import { initState } from "./state";

//!只要是插件就一定是一个函数
export function initMixin(Vue){
    Vue.prototype._init = function(options){
      
        //vue会把拿到的option都放到实例的$option上
        const vm = this;
        vm.$options = options

        //初始化状态(将数据做一个初始化的劫持 当我改变数据时应该更新视图)
        //vue组件中有很多状态 data props watch computed
        initState(vm)




        //vue里面核心特性.响应式数据原理
        //Vue是一个参考MVVM的框架
       /*  数据变化视图会更新,视图变化数据会受影响 (MVVM) 不能跳过数据直接去更新视图
        但是vue可以通过$ref所以说vue只是参考MVVM */
    }
}