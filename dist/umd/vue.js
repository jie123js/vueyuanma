(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
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

  //观测数据可能有观测数组啊观测对象啊还有一些其他的方法,所以写个类比较好
  var Obsereve = /*#__PURE__*/function () {
    function Obsereve(value) {
      _classCallCheck(this, Obsereve);

      //使用defineProperty 重新定义属性
      if (Array.isArray(value)) ; else {
        this.walk(value);
      }
    }

    _createClass(Obsereve, [{
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
      return;
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
