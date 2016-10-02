"use strict";
//只有两种状态的Promise类
var Promise = function () {
    //后添加的功能1：让Promise的实例，保存OK时的返回值
    //后添加的功能2：是否允许 无限次 执行回调。
    var monitorProxy = function (self) { //self=Promise
        if (self._state === 0) return;        
        self._userMonitors.forEach(function (callback) {
            if (self._data instanceof _Promise) {
                self._data.then(callback.full, callback.fail);
                self._results.push('no');//后添加的功能1
            } else {
                var result;
                if (self._state === 1) {
                    result = callback.full(self._data);
                    //self._results.push(result);//后添加的功能1
                } else {
                    result = callback.fail(self._data);
                }
                self._results.push(result);//后添加的功能1
            }
        });
        if (!self._repeated)
            self._userMonitors.splice(0, self._userMonitors.length);//关键：避免重复执行
    };
	
	//var resultMonitor = {
    //        full: function (self,data) {
    //            if (!self._repeated && self._state !== 0) return;
    //            self._state = 1;
    //            self._data = data;
    //            monitorProxy(self);
    //        },
    //        fail: function (self,data) {
    //            if (self._state !== 0) return;
    //            self._state = -1;
    //            self._data = data;
    //            monitorProxy(self);
    //        }
    //    };
    var resultMonitor = {
        full: function (data) {
            if (this._repeated) this._results.clear();//后添加的功能1+2
            if (!this._repeated && this._state !== 0) return;
            this._state = 1;
            this._data = data;
            monitorProxy(this);
        },
        fail: function (data) {
            if (this._repeated) this._results.clear();//后添加的功能1+2
            if (!this._repeated && this._state !== 0) return;
            //if (this._state !== 0) return;
            this._state = -1;
            this._data = data;
            monitorProxy(this);
        }
    };

	var i = 0;
	var _Promise = function (fn, repeated) {
        if (!(this instanceof _Promise)) throw new TypeError("Constructor Promise requires 'new'");
        if (typeof (fn) !== 'function') throw new TypeError('Not enough arguments to Promise.');
        this._i = i++;
        this._fn = fn;
        var self = this;
        this._results = [];//后添加的功能1
        this._repeated = repeated;//后添加的功能2
        this._state = 0;
        this._data = null;
        this._userMonitors = [];//[{full:func,fail:func}]

        fn(resultMonitor.full.bind(this), resultMonitor.fail.bind(this)); //fn<-p1<-u1<-p2
    };
    _Promise.prototype = {
        then: function (userFullMonitor, userFailMonitor) {
            var self = this;
            return new _Promise(function (resultFullMonitor, resultFailMonitor) {
                var _resultFullMonitor = function (data) {
                    try {
                        var result;
                        if (userFullMonitor) {
                            result = userFullMonitor(data);
                            resultFullMonitor(result);
                        } else {
                            resultFullMonitor(data);
                        }
                        return result; //后添加的功能1
                        //resultFullMonitor(userFullMonitor ? userFullMonitor(data) : data); //原来的
                    } catch (ex) {
                        return resultFailMonitor(ex);
                    }
                };
                var _resultFailMonitor = function (data) {
                    try {
                        var result;
                        if (userFailMonitor) {
                            result = userFailMonitor(data);
                            resultFailMonitor(result);
                        } else {
                            resultFailMonitor(data);
                        }
                        return result; //后添加的功能1
                        // resultFailMonitor(userFailMonitor ? userFailMonitor(data) : data); //原来的
                    } catch (ex) {
                        resultFailMonitor(ex);
                    }
                };
                self._userMonitors.push({ full: _resultFullMonitor, fail: _resultFailMonitor });
                monitorProxy(self);
            });
        },
        fail: function (userFailMonitor) {
            return this.then(null, userFailMonitor);
        },
        finality: function (func) {
            this.then(func, func);
        }
    };
    _Promise.all = function () {
        var args = arguments;
        return new _Promise(function (onFulfilled, onFailure)
        {
            var fulfilled = [];
            for (var j = 0; j < args.length; j++)
            {
                args[j].then(function (data) {
                    fulfilled.push(data);
                    if (fulfilled.length === args.length) {
                        onFulfilled(fulfilled);
                    }
                }, function (data) {
                    onFailure(data);
                });
            }
        });
    };
    _Promise.race = function () {
        var args = arguments;
        return new _Promise(function (onFulfilled, onFailure) {
            var end = false;
            for (var j = 0; j < args.length; j++)
            {
                args[j].then(function (data) {
                    onFulfilled(data);
                }, function (data) {
                    onFailure(data);
                });
            }
        });
    };
    return _Promise;
    //T(被监听的结果)->Promise(监听代理)<-userMonitor(监听方法)
}();