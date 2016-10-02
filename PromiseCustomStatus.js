/// <reference path="../2.0/jsExtend.js" />
"use strict";
//可自定义状态的Promise类
var PromiseCustomStatus = function (Statuss) {

    //后添加的功能1：让Promise的实例，保存OK时的返回值
    //后添加的功能2：是否允许 无限次 执行回调。
        
    var StatusList = Object.toArray(Statuss, function (key, item) { return key; });

    var monitorProxy = function ()//
    {
        if (this._state === null) return;
        var self = this;
        this._userMonitors.forEach(function (callbacks)
        {
            if (self._data instanceof Promise) {
                self._data.then.apply(self._data, Object.toArray(callbacks, function (key, cbk) { return cbk; }));
                self._results.push('no');//后添加的功能1
            } else {
                var result = callbacks[self._state](self._data);
                self._results.push(result);//后添加的功能1
            }
        });
        if (!this._repeated)
            this._userMonitors.splice(0, this._userMonitors.length);//关键：避免重复执行
    };//用户监听 的监听委托
    
    var _monitor = function () {
        var func = function (status,data) {
            if (this._repeated) this._results.clear();//后添加的功能1+2
            if (!this._repeated && this._state !== null) return;
            this._state = status;
            this._data = data;
            monitorProxy.call(this);
        };
        return function (status) {
            return function (data) {
                func.call(this, status, data);
            };
        };
    }();
	
    var resultMonitor = Object.select(Statuss, function (result, key, item) {
        result[key] = _monitor(key);
    }); //监听“结果”的函数

    var _wrapMonitor = function () {
        var func = function (index, userMonitors, resultMonitors, data) {
            try {
                var result;
                var userMonitor = userMonitors.length > index ? userMonitors[index] : null;
                if (userMonitor) {
                    result = userMonitor(data);
                    resultMonitors[index](result);
                } else {
                    resultMonitors[index](data);
                }
                return result; //后添加的功能1
            } catch (ex) {
                return resultMonitors[StatusList.length - 1](ex);//最后一个就当是 错误监听函数
            }
        };
        return function (index, userMonitors, resultMonitors) {
            return function (data) {
                return func.call(null, index,userMonitors, resultMonitors, data);
            };
        };
    }();
    
	var i = 0;//测试用
	var Promise = function (fn, repeated)//repeated允许重复调用 回调
	{
        if (!(this instanceof Promise)) throw new TypeError("Constructor Promise requires 'new'");
        if (typeof (fn) !== 'function') throw new TypeError('Not enough arguments to Promise.');
        this._i = i++;//测试用
        this._fn = fn;//测试用        
        this._results = [];//后添加的功能1
        this._repeated = repeated;//后添加的功能2
        this._state = null;//初始状态
        this._data = null;
        this._userMonitors = [];//保存用户监听[{status1:func,status2:func,……}]

        var self = this;

        fn.apply(null, Object.toArray(resultMonitor, function (key, func)
        {
            return func.bind(self);
        }));//fn<-p1<-u1<-p2
    };
    Promise.prototype = {
        then: function (userFullMonitor, userFailMonitor)
        {
            var userMonitors = arguments;//userFullMonitor, userFailMonitor
            var self = this;
            self.ufn = userFullMonitor;
            return new Promise(function (resultFullMonitor, resultFailMonitor) {
                var resultMonitors = arguments; //resultFullMonitor, resultFailMonitor
                var j = 0;
                var wrapResultMonitors = Object.select(Statuss, function (json, key, item)
                {
                    json[key] = _wrapMonitor(j, userMonitors, resultMonitors);
                    j++;
                });
                self._userMonitors.push(wrapResultMonitors);
                monitorProxy.call(self);
            });
        },
        finality: function (func) {
            this.then.apply(this, Object.toArray(Statuss, function (key, item) {
                return func;
            }));
        }
    };

    var _singleMonitor = function () {
        var func = function (index,userMonitor)
        {
            var emptyMonitors = Object.toArray(Statuss, function (key, item) { return null; });
            emptyMonitors[index] = userMonitor;
            return this.then.apply(this, emptyMonitors);
        };
        return function (index) {
            return function (userMonitor) {
                func.call(this, index, userMonitor);
            };
        };
    }();//监听单个状态的函数

    StatusList.each(function (key, j)
    {
        Promise.prototype[key] = _singleMonitor(j);
    });//单个添加 所有状态的prototype函数

    Promise.all = function (status) {
        var promiseList = arguments;
        var sIndex = StatusList.indexOf(status);
        return new Promise(function (onFulfilled, onFailure)
        {
            var fulfilled = [];
            var resultMonitor = arguments;
            var monitors = Array.select(StatusList, function (item, j)
            {
                resultMonitor[j](data);
            });
            monitors[sIndex] = function (data)
            {
                fulfilled.push(data);
                if (fulfilled.length === promiseList.length - 1) //成功了，状态都为status
                {
                    resultMonitor[sIndex](fulfilled);
                }
            };
            
            for (var j = 1; j < promiseList.length;j++)
            {                
                promiseList[j].then.apply(promiseList[j], monitors);
            }
        });
    };//如果所有Promise实例的执行结束状态都为status，则表示 成功，触发外面的Promise的status回调；否则 表示失败。
    Promise.race = function () {
        var promiseList = arguments;
        return new Promise(function (onFulfilled, onFailure) {
            var resultMonitors = arguments;
            var monitors = Array.select(StatusList, function (item, j)
            {
                resultMonitor[j](data);
            });

            for (var j = 0; j < promiseList.length; j++)
            {
                promiseList[j].then.apply(promiseList[j], monitors);
            }
        });
    };//一起监听
    return Promise;
    //T(被监听的结果)->Promise(监听代理)<-userMonitor(监听方法)
};//status={status1,status2,status3,……}//自定义状态 //Statuss最后一个默认 是错误监听函数
//粗略测试使用了一下

//使用示例：
var Promise = PromiseCustomStatus({OK:1,CANCEL:1});//只有两个状态的常用 Promise对象
var Promise = PromiseCustomStatus({OK:1,CANCEL:1,WAIT:1});//有3个状态的Promise对象
var promise=new Promise(function(ok,cancel,wait){
	///////////////
});
 promise.then(function(data){},function(data){},function(data){});
 promise.OK(function(data){}).WAIT(function(data){}).CANCEL(function(data){}).finality(function(data){});
