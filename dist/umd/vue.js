(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('.')) :
  typeof define === 'function' && define.amd ? define(['.'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var oldArrayProtoMethods = Array.prototype; //继承一下
  //!这样假如调用的话就会先找本身的,没有的再找回数组的方法

  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', 'sort', 'unshift', 'reserve', 'splice', 'shift'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      // 虽然重写但是方法还是需要调用原来的,只是添加了数据后要对数据进行响应式处理
      console.log('数组方法被调用了');

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProtoMethods[method].apply(this, args);
      var inserted; //!这里如果数组增加的数据是对象的话,也需要进行observe

      switch (method) {
        case 'push':
        case 'unshift':
          //这2方法都是追加 追加应该都被劫持才对
          inserted = args;
          break;

        case 'splice':
          //如果是添加 参数都是放在第三位置的 所以是slice(2)开始截取到最后
          inserted = args.slice[2];
      }

      if (inserted) {
        //虽然观察了,但是我要怎么拿到observeArray?
        //当前的this对应的就是array.js文件里面的Observe里的value 谁调用this就是谁
        //!那我们把要用的方法挂载到value上就可以了,可以用object.defineProperty自定义一个ob属性,且还可以用来观察一个对象是否被观测过
        this.__ob__.observeArray(inserted);
      }

      return result; //这个return是为了和原来方法一样,原来也是有return值的
    };
  });

  var Obsereve = /*#__PURE__*/function () {
    function Obsereve(value) {
      _classCallCheck(this, Obsereve);

      //使用defineProperty 重新定义属性
      //判断一个对象是否被观测过看他是否有_ob_属性
      //但是如果直接value.__ob__ = this 这样就出错了,因为会进入下面的循环会死循环
      //所以使用define特性设置不可枚举
      Object.defineProperty(value, '__ob__', {
        enumerable: false,
        //不能被枚举,就是不能被循环出来
        configurable: false,
        //不能被删除
        value: this
      });

      if (Array.isArray(value)) {
        //我们希望调用push pop shift unshift splice sort reserve重写
        //简称函数劫持、切片编程
        //!这里把value的__proto__改了,但是其实因为继承了数组的方法,不会有影响的,只是重写了一些方法
        value.__proto__ = arrayMethods; //如果数组里面有对象还需要进行observe

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    } //对数组的每一项进行观测


    _createClass(Obsereve, [{
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Obsereve;
  }();

  function defineReactive(data, key, value) {
    /* 这里为什么不直接data[key]= newvalue?如果这样会死循环的
    因为key的值一变就触发set,set里面又改key的值,所以需要借住第三方变量 */

    /*  如果观测`的value还是一个对象,那就观测不到了,
     所以如果是对象我们需要再执行一次observe */
    //!默认弄个数据会递归去用defineProperty进行拦截,性能不太好,所以vue3使用了proxy
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log('读入');
        return value;
      },
      set: function set(newValue) {
        console.log('修改');

        if (newValue == value) {
          return;
        } //?用户有可能把新的值也设为了对象,如果是对象我们也要observe


        observe(newValue);
        value = newValue;
      }
    });
  }

  function observe(data) {
    //有可能误传,要判断只有对象才继续执行
    if (_typeof(data) !== 'object' || data == null) {
      return data;
    } //已经被观察过了 不必进入判断,增加点性能


    if (data.__ob__) {
      return data;
    }

    return new Obsereve(data);
  }

  function initState(vm) {
    var opts = vm.$options; //这几个初始化是有顺序的,因为要判断xx和xx重名了怎么办的情况

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    //数据初始化
    var data = vm.$options.data; //data有可能是对象也有可能是函数要特殊处理
    //但是vm不能得到data所以加一个vm._data

    vm._data = data = typeof data == 'function' ? data.call(vm) : data; //数据劫持方案 对象Object.defineProperty
    //数组 是单独处理的
    //但是要注意这个data是不可能是数组,数组只有在对象里面嵌套数组,所以这里不需要判断是对象还是数组

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      //vue会把拿到的option都放到实例的$option上
      var vm = this;
      vm.$options = options; //初始化状态(将数据做一个初始化的劫持 当我改变数据时应该更新视图)
      //vue组件中有很多状态 data props watch computed

      initState(vm); //vue里面核心特性.响应式数据原理
      //Vue是一个参考MVVM的框架

      /*  数据变化视图会更新,视图变化数据会受影响 (MVVM) 不能跳过数据直接去更新视图
       但是vue可以通过$ref所以说vue只是参考MVVM */
    };
  }

  //第一步初始化option,但是方法很多,所以要把方法写在原型上(主要是组件可能会用到)

  function Vue(option) {
    this._init(option); // 入口方法,初始化操作

  } //写成一个个的插件进行对原型的扩展


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
