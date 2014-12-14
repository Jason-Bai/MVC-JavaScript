/**
 * MVC for JavaScript
 * @date 2014-12-14
 * @author jason
 */
 (function (w) {

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
 			this.records = [];
 		},
 		prototype: {
 			init: function  (attrs) { // 新实例创建后执行的代码
 				if(attrs) {
 					this.load(attrs);
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
 		}
 	});

 	Model.extend({
 		find: function  (id) {
 			var record = this.records[id];
 			if(!record) new Error('Unknown record');
 			return record.dup();
 		}
 	});

 	w.Model = Model;
 }(window))