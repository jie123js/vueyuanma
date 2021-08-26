import { observe } from "./observer/index";

export function initState(vm){
    const opts = vm.$options;
    //这几个初始化是有顺序的,因为要判断xx和xx重名了怎么办的情况
    if(opts.props){
        initProps(vm)
    }
    if(opts.methods){
        initMethods(vm)
    }
    if(opts.data){
        initData(vm)
    }
    if(opts.computed){
        initComputed(vm)
    }
    if(opts.watch){
        initWatch(vm)
    }
    
}

function initProps(){}
function initMethods(){}
function initData(vm){
    //数据初始化
    let data = vm.$options.data;
    //data有可能是对象也有可能是函数要特殊处理
    //但是vm不能得到data所以加一个vm._data
    vm._data = data = typeof data =='function'?data.call(vm):data;
    //数据劫持方案 对象Object.defineProperty
    //数组 是单独处理的
    //但是要注意这个data是不可能是数组,数组只有在对象里面嵌套数组,所以这里不需要判断是对象还是数组
    observe(data);
    
    
}
function initComputed(){}
function initWatch(){}