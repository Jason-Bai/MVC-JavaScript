/**
 * MVC for JavaScript
 * @date 2014-12-14
 * @author jason
 */
 (function (w) {
 	/******************************** Model Start ***********************************/
 	if(typeof Object.create !== 'function') {
 		Object.creat = function  (o) {
 			function F() {}
 			F.prototype = o;
 			return new F();
 		}
 	}

 	Math.guid = function() {
 		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function  () {
 			var r = Math.random() * 16 | 0, v = c = 'x' ? r : (r&0x3|0x8);
 			return v.toString(16);
 		})
 	}

 	var Model = {
 		inherited: function  () { // 扩展当前的类
 			
 		},
 		created: function  () { // 创建类之后的处理
 			// 数据池
 			this.records = [];
 			// 序列化属性
 			this.attribues = [];
 		},
 		prototype: {
 			init: function  (attrs) { // 新实例创建后执行的代码
 				if(attrs) {
 					this.load(attrs[0] || {});
 				}
 			},
 			load: function (attributes) {
 				for(var name in attributes) {
 					this[name] = attributes[name];
 				}

 			}
 		},
 		create: function () { // 创建该类的子类
 			var object = Object.create(this);
 			object.parent = this;
 			object.prototype = object.fn = Object.create(this.prototype);
 			object.created();
 			this.inherited(object);
 			return object;
 		},
 		init: function () { // 实例化一个当前的类的实例，并且执行prototype中的init方法
 			var instance = Object.create(this.prototype);
 			instance.parent = this;
 			instance.init.call(instance, arguments);
 			return instance;
 		},
 		extend: function (o) {
 			var extended = o.extended;
 			jQuery.extend(this, o);
 			if(extended) {
 				extended(this);
 			}
 		},
 		include: function  (o) {
 			var included = o.included;
 			jQuery.extend(this.prototype, o);
 			if(included) {
 				included(this);
 			}
 		}
 	};

 	Model.include({
 		newRecord: true,
 		create: function () {
 			if(!this.id) this.id = Math.guid();
 			this.newRecord = false;
 			this.parent.records[this.id] = this;
 			this.parent.records.length++;
 		},
 		update: function () {
 			this.parent.records[this.id] = this.dup();
 		},
 		save: function () {
 			this.newRecord ? this.create() : this.update();
 		},
 		destory: function () {
 			delete this.parent.records[this.id];
 			this.parent.records.length--;
 		},
 		dup: function () {
 			return jQuery.extend(true, {}, this);
 		},
 		attributes: function  () {
 			// 返回的指定的attributes
 			var result = {};
 			for(var i in this.parent.attributes) {
 				var attr = this.parent.attributes[i];
 				result[attr] = this[attr];
 			}
 			result.id = this.id;
 			return result;
 		},
 		// 添加该条记录到数据库中
 		createRemote: function  (url, callback) {
 			$.post(url, this.attributes(), callback);
 		},
 		// 更新该条记录到数据库中
 		updateRemote: function  (url, callback) {
 			var that = this;
 			$.ajax({
 				url: url,
 				data: this.attributes(),
 				success: function (r) {
 					callback(r);
 				},
 				type: 'PUT'
 			});
 		}
 	});

 	Model.extend({
 		find: function  (id) {
 			var record = this.records[id];
 			if(!record) new Error('Unknown record');
 			return record.dup();
 		},
 		toJSON: function () {
 			var r = [],
 				obj = null;
 			for(var i in this.records) {
 				obj = this.records[i].attributes();
 				r.push(JSON.stringify(obj));
 			}
 			return r;
 		},
 		parse: function (arr) {
 			var r = [],
 				json = null;
 			for(var i  = 0, max = arr.length; i < max; i++) {
 				r.push(JSON.parse(arr[i]));
 			}
 			return r;
 		},
 		saveLocal: function  (name) {
 			// 使用;作为分割将数据存储在localStorage
			localStorage[name] = this.toJSON().join(';');
		},
		loadLocal: function (name) {
			// 将存储在localStorage中的数据load到数据池中
			var data = localStorage[name];
			this.populate(this.parse(data.split(';')));
		},
		batchCreateRemote: function (url, callback, fn) {
			for(var i in this.records) {
				this.records[i].createRemote(url, callback);
			}
			fn && fn();
		},
		batchUpdateRemote: function  (url, callback, fn) {
			for(var i in this.records) {
				this.records[i].updateRemote(url, callback);
			}
			fn && fn();
		}
 	});

 	w.Model = Model;
 	/******************************** Model End ***********************************/
 }(window))