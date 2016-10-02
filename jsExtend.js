"use strict";
(function () {
    (function () {
        Array.prototype.each = Array.prototype.each || function (func) {
            for (var i = 0; i < this.length; i++)
                func(this[i], i);
            return this;
        };
        Array.each = Array.each || function (array, func) {
            if (!array) return;
            return Array.prototype.each.call(array,func);
        };

        Array.prototype.add = Array.prototype.add || function (item) {
            this.push(item);
            return this;
        }

        Array.prototype.addRange = Array.prototype.addRange || function (items) {
            var length = items.length;

            if (length != 0) {
                for (var index = 0; index < length; index++) {
                    this.push(items[index]);
                }
            }
            return this;
        };

        Array.prototype.clear = Array.prototype.clear || function () {
            if (this.length > 0) {
                this.splice(0, this.length);
            }
            return this;
        }

        Array.prototype.isEmpty = Array.prototype.isEmpty || function () {
            if (this.length == 0)
                return true;
            else
                return false;
        }

        Array.prototype.clone = Array.prototype.clone || function () {
            var clonedArray = [];
            var length = this.length;

            for (var index = 0; index < length; index++) {
                clonedArray[index] = this[index];
            }

            return clonedArray;
        }
        Array.clone = Array.clone || function (array) {
            var clonedArray = [];
            var length = array.length;

            for (var index = 0; index < length; index++) {
                clonedArray[index] = array[index];
            }

            return clonedArray;
        };

        Array.prototype.contains = Array.prototype.contains || function (item) {
            var index = this.indexOf(item);
            return (index >= 0);
        }

        Array.prototype.select = Array.prototype.select || function (func) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                result.push(func(this[i]),i);
            }
            return result;
        };

        Array.select = Array.select || function (items,func) {
            return Array.prototype.select.call(items, func);
        };

        Array.prototype.dequeue = function () {
            return this.shift();
        }

        Array.prototype.indexOf = function (item) {
            var length = this.length;

            if (length != 0) {
                for (var index = 0; index < length; index++) {
                    if (this[index] == item) {
                        return index;
                    }
                }
            }

            return -1;
        }
        Array.has = Array.has || function (array, func) {
            for(var i=0;i<array.length;i++)
            {
                if (func(array[i]))
                    return true;
            }
            return false;
        };

        Array.prototype.insert = Array.prototype.insert || function (index, item) {
            this.splice(index, 0, item);
            return this;
        }

        Array.prototype.joinstr = function (str) {
            var new_arr = new Array(this.length);
            for (var i = 0; i < this.length; i++) {
                new_arr[i] = this[i] + str
            }
            return new_arr;
        }

        Array.prototype.queue = function (item) {
            this.push(item);
            return this;
        }

        Array.prototype.remove = function (item) {
            var index = this.indexOf(item);

            if (index >= 0) {
                this.splice(index, 1);
            }
            return this;
        }

        Array.prototype.removeAt = function (index) {
            this.splice(index, 1);
            return this;
        }
        Array.prototype.removeBy = function (func) {
            for (var i = 0; i < this.length; i++) {
                if (func(this[i])) {
                    this.splice(i, 1);
                    i--;
                }
            }
            return this;
        }
       
        Array.prototype.copyTo = function (list) {
            this.each(function (item) {
                list.push(item);
            });
            return this;
        };

        Array.prototype.map = function (func) {
            var result = [];
            Array.each(this, function (item, i) {
                result.push(func.call(item, item, i));
            });
            return result;
        };
        Array.map = Array.map || function (array, func) {
            return Array.prototype.map.call(array, func);
        };

        Array.prototype.first = function (func) {
            for(var i=0;i<this.length;i++)
            {
                if (func(this[i])) return this[i];
            }
            return undefined;
        };

        Array.prototype.where = function (func) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                if (func(this[i]))
                    result.push(this[i]);
            }
            return result;
        };
        Array.where = Array.where || function (array, func) {
            return Array.prototype.where.call(array, func);
        }

        Array.distinct = Array.distinct || function (array, func) {
            var group = {};
            var news = [];
            for(var i=0;i<array.length;i++)
            {
                var key = func(array[i]);
                if (!group[key]) {
                    group[key] = 1;
                    news.push(array[i]);
                }
            }
            if (array.length === news.length) return array;
            return news;
        };

    })();//Array

    (function () {

        Object.keys = Object.keys || function (o)
        {
            if (o !== Object(o))
                throw new TypeError('Object.keys called on a non-object');
            var k = [], p;
            for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
            return k;
        };//keys

        Object.each = Object.each || function (obj, func) {
            for (var key in obj) {
                func(key, obj[key]);
            }
        };

        Object.select = Object.select || function (obj,func) {
            var result = null;
            for (var key in obj) {
                result || (result = {});
                func(result, key, obj[key]);
            }
            return result;
        };//select

        Object.last = Object.last || function (obj, func) {
            var lastResult;
            for (var key in obj) {
                if (func(key,obj[key]))
                    lastResult = obj[key];
            }
            return lastResult;
        };//遍历，返回最后成功比较的那个值。

        Object.first = Object.first || function (obj, func) {
            for (var key in obj) {
                if (func(key, obj[key])) {
                    return {key:key,value:obj[key]};
                }
            }
            return null;
        };

        Object.has = Object.has || function (obj, func) {
            for (var key in obj) {
                if (func(key, obj[key])) {
                    return true;
                }
            }
            return false;
        };

        Object.where = Object.where || function (obj, func) {
            var result = {};
            for (var key in obj) {
                if(func(key,obj[key]))
                {
                    result[key]=obj[key];
                }
            }
            return result;
        };

        Object.toArray = Object.toArray || function (obj, func) {
            var result = [];
            for (var key in obj) {
                result.push(func(key,obj[key]));
            }
            return result;
        };

    })();//Object
})();
