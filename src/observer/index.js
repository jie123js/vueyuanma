
//观测数据可能有观测数组啊观测对象啊还有一些其他的方法,所以写个类比较好
class Obsereve{
    constructor(value){
        //使用defineProperty 重新定义属性

       this.walk(value)
        
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
        return
    }
    return new Obsereve(data)
    
    
}