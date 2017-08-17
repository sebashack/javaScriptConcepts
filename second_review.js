/*Queue and dequeue with bare objects (early bound mixing with
  policies)*/

const queue  = {
  _array: [],
  _head: 0,
  _tail: -1,
  push: function(value) {
    this._array[++this._tail] = value;
  },
  shift: function() {
    if (this._tail >= this._head) {
      const value = this._array[this._head];
      this._array[this._head] = void 0;
      ++this._head;
      return value;
    }

  },
  size: function() {
    return this._tail - this._head + 1;
  },
  isEmpty: function() {
    return this._tail < this._head;
  }
}

function createQueue() {
  let copy = Object.assign(Object.create(null), queue);
  return copy;
}


const dequeue = {
  pop: function() {
    let value;
    if (!this.isEmpty()) {
      value = this._array[this._tail];
      this._array[this._tail] = void 0;
      this._tail -= 1;
      return value;
    }
  },
  unshift: function(value) {
    if (this._head === 0) {
      for (let i = this._tail; i >= this._head; --i) {
	this._array[i + this.INCREMENT] = this._array[i];
      }

      this._tail += this.INCREMENT;
      this._head += this.INCREMENT;
    }

    this._array[this._head -= 1] = value;
  },

  INCREMENT: 4

}

function createDequeue() {
  let copy = Object.assign(Object.create(null), queue, dequeue);
  return copy;
}

/*
  This approach has the follwing pitfalls:
  - Creation of heavy objects in memory: Every instance of an object
  would carry all the behaviors (methods) that define its type.

  - Exposing publicly important variables which cannot be manipulated,
  namely, _head, _tail, _array, _INCREMENT.
*/



//**Queue with private state (early bound mixing)**//

const QueueWithClosure = function() {
  //private variables
  const _array = [];
  let _head = 0, _tail = -1;

  return {
    push: function (value) {
      _array[++_tail] = value
    },

    pop: function () {
      if (_tail >= _head) {
	const value = _array[_head];
	_array[_head] = void 0;
	++_head;
	return value;
      }
    },

    isEmpty: function() {
      return _tail < _head
    }
  }
}

/*
  The pitfall of this approach is again that we are creating heavy
  objects which carry all the behaviors that define their type.
  However we are encapsulating important variables withing a closure.
*/

//** Queues via constructors (early bound mixing) **//
//Here we are going to use the convential JS constructors with
//Object.assign()

const QueueWithDelegation = function() {
  Object.assign(this, {
    _array: [],
    _head: 0,
    _tail: -1
  });
}

Object.assign(QueueWithDelegation.prototype, {
  push: function (value) {
    this._array[++this._tail] = value
  },

  shift: function () {
    if (this._tail >= this._head) {
      const value = this._array[this._head];

      this._array[this._head] = void 0;
      ++this._head;
      return value;
    }
  },

  isEmpty: function() {
    return this._tail < this._head
  }

});


/*
  Here we are solving the problem of having heavy objects.
  All behavior is located in a prototype object, and all instances
  share that behavior from that prototype.
  Every instance of an object will have its own states or properties.
  However we are again exposing variables which should not be
  manipulated by anyone. */


//**Delegation: a way to implement inheritance from a super class**//

const Queue = function() {
  Object.assign(this, {
    _array: [],
    _head: 0,
    _tail: -1
  });
}

Object.assign(Queue.prototype, {
  push: function (value) {
    this._array[++this._tail] = value
  },

  shift: function () {
    if (this._tail >= this._head) {
      const value = this._array[this._head];

      this._array[this._head] = void 0;
      ++this._head;
      return value;
    }
  },

  isEmpty: function() {
    return this._tail < this._head
  }

});

//Now let's inherit all properties from Queue:

const Dequeue = function() {
  Queue.call(this);
  this.INCREMENT = 4;
}

const queueProxy = new Queue();

Dequeue.prototype = queueProxy;
Dequeue.prototype.constructor = Dequeue;

Object.assign(Dequeue.prototype, {
  pop: function() {
    let value;

    if (!this.isEmpty()) {
      value = this._array[this._tail];
      this._array[this._tail] = void 0;
      this._tail -= 1;
      return value;
    }
  },

  size: function() {
    return this._tail - this._head + 1
  },

  unshift: function(value) {
    if (this._head === 0) {
      for (let i = this._tail; i >= this._head; --i) {
	this._array[i + this.constructor.INCREMENT] = this._array[i];
      }

      this._tail += this.constructor.INCREMENT;
      this._head += this.constructor.INCREMENT;
    }

    this._array[this._head -= 1] = value;
  }
});


/*
  With this method our receiver object will inherit all behavior from the
  metaobject. See that all behavior is kept within the metaobject without
  implementing it within the receiver. That is possible with apply(),
  which let us force application of the metaobject's methods within the
  context of the receiver.
  This is why here we have a case of late bounding: 'this' will make
  reference to the object which invokes the function.
*/

function delegate(receiver, metaobject) {
  var methods = Object.keys(metaobject)
    .filter( (key) => typeof(metaobject[key]) === 'function' );

  methods.forEach( (methodName) => {
    receiver[methodName] = function(...args) {
      return metaobject[methodName].apply(receiver, args);
    }
  });

  return receiver;
}


/*Forwarding*/

/*
  Here we are just keeping all state and behavior within the metaobject.
  We are forcing our receiver to call the methods within the context of
  the metaobject.
*/
function forward(receiver, metaobject) {
  var methods = Object.keys(metaobject)
    .filter( (key) => typeof(metaobject[key]) === 'function' )

  methods.forEach( (methodName) => {
    receiver[methodName] = function() {
      var result = metaobject[methodName].apply(metaobject, arguments);
      return result === metaobject ? this : result;
    }
  });

  return receiver;
}
