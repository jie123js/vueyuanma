import { arrayMethods } from "./array";

//观测数据可能有观测数组啊观测对象啊还有一些其他的方法,所以写个类比较好
class Obsereve{
    constructor(value){
        //使用defineProperty 重新定义属性


        //判断一个对象是否被观测过看他是否有_ob_属性
        //但是如果直接value.__ob__ = this 这样就出错了,因为会进入下面的循环会死循环
        //所以使用define特性设置不可枚举
        Object.defineProperty(value,'__ob__',{
            enumerable:false,//不能被枚举,就是不能被循环出来
            configurable:false,//不能被删除
            value:this
        })
        if(Array.isArray(value)){
            //我们希望调用push pop shift unshift splice sort reserve重写
            //简称函数劫持、切片编程
            //!这里把value的__proto__改了,但是其实因为继承了数组的方法,不会有影响的,只是重写了一些方法
           value.__proto__ =  arrayMethods
           //如果数组里面有对象还需要进行observe
           this.observeArray(value)
        }else{
            this.walk(value)
        }
       
        
    }
    //对数组的每一项进行观测
    observeArray(value){
        value.forEach((item)=>{
            observe(item)
        })
    }
    walk(data){
        let keys = Object.keys(data);
        keys.forEach((key)=>{
            defineReactive(data,key,data[key])
        })
    }
}

function defineReactive(data,key,value){
    /* 这里为什么不直接data[key]= newvalue?如果这样会死循环的
    因为key的值一变就触发set,set里面又改key的值,所以需要借住第三方变量 */
   /*  如果观测`的value还是一个对象,那就观测不到了,
    所以如果是对象我们需要再执行一次observe */
    //!默认弄个数据会递归去用defineProperty进行拦截,性能不太好,所以vue3使用了proxy
    observe(value)
    Object.defineProperty(data,key,{
        get(){
            console.log('读入');
            
            return value
        },
        set(newValue){
            console.log('修改');
            
            if(newValue == value){
                return
            }
            //?用户有可能把新的值也设为了对象,如果是对象我们也要observe
            observe(newValue)
            value = newValue
        }
    })
}
export function observe(data){


    //有可能误传,要判断只有对象才继续执行
    if(typeof data !=='object' || data ==null){
        return data
    }
    //已经被观察过了 不必进入判断,增加点性能
    if(data.__ob__){
        return data
    }
    return new Obsereve(data)
    
    
}