import { observe } from "."

//拿到数组原型上的方法(原来的方法)
let oldArrayProtoMethods = Array.prototype

//继承一下
//!这样假如调用的话就会先找本身的,没有的再找回数组的方法
export let arrayMethods = Object.create(oldArrayProtoMethods)

let methods = ['push','pop','sort','unshift','reserve','splice','shift']


methods.forEach((method)=>{
    arrayMethods[method]=function(...args){
        // 虽然重写但是方法还是需要调用原来的,只是添加了数据后要对数据进行响应式处理
        console.log('数组方法被调用了');
       const result =  oldArrayProtoMethods[method].apply(this,args)
       let inserted;
       //!这里如果数组增加的数据是对象的话,也需要进行observe
       switch(method){
           case 'push':
           case 'unshift'://这2方法都是追加 追加应该都被劫持才对
            inserted = args
           break;
            case 'splice':
                //如果是添加 参数都是放在第三位置的 所以是slice(2)开始截取到最后
                inserted = args.slice[2]
           default:
               break
       }
       if(inserted){
           //虽然观察了,但是我要怎么拿到observeArray?
           //当前的this对应的就是array.js文件里面的Observe里的value 谁调用this就是谁
           //!那我们把要用的方法挂载到value上就可以了,可以用object.defineProperty自定义一个ob属性,且还可以用来观察一个对象是否被观测过
           this.__ob__.observeArray(inserted)
       }
       return result;  //这个return是为了和原来方法一样,原来也是有return值的
    }
})

