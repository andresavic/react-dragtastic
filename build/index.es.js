import { Component } from 'react'
import PropTypes from 'prop-types'

var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }

    return target
  }

var inherits = function(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    )
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass)
}

var possibleConstructorReturn = function(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    )
  }

  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self
}

var initialState = {
  x: 0,
  y: 0,
  isDragging: false,
  startingX: 0,
  startingY: 0,
  currentlyDraggingId: null,
  currentlyHoveredDroppableId: null,
  currentlyHoveredDroppableAccepts: null,
  data: null,
  type: null
}

var Store = (function() {
  function Store() {
    classCallCheck(this, Store)
    this._state = initialState
    this._callbacks = []
  }

  Store.prototype.update = function update(payload) {
    this._state = _extends({}, this._state, payload)
    this._callbacks.forEach(function(callback) {
      return callback()
    })
  }

  Store.prototype.reset = function reset() {
    this.update(initialState)
  }

  Store.prototype.subscribe = function subscribe(callback) {
    var _this = this

    this._callbacks = [].concat(this._callbacks, [callback])
    return function() {
      _this._callbacks = _this._callbacks.filter(function(f) {
        return f !== callback
      })
    }
  }

  Store.prototype.getState = function getState() {
    return this._state
  }

  return Store
})()

var dndStore = new Store()

var getId = function getId() {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

var noop = function noop() {}

var DragComponent = (function(_React$Component) {
  inherits(DragComponent, _React$Component)

  function DragComponent() {
    var _temp, _this, _ret

    classCallCheck(this, DragComponent)

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    return (
      (_ret = ((_temp = ((_this = possibleConstructorReturn(
        this,
        _React$Component.call.apply(_React$Component, [this].concat(args))
      )),
      _this)),
      (_this.state = dndStore.getState()),
      (_this.shouldComponentUpdate = function(nextProps, nextState) {
        if (nextProps !== _this.props) {
          return true
        } else {
          if (nextProps.subscribeTo) {
            var shouldUpdate = false
            var i = 0
            while (i < nextProps.subscribeTo.length - 1) {
              if (
                _this.state[nextProps.subscribeTo[i]] !==
                nextState[nextProps.subscribeTo[i]]
              ) {
                shouldUpdate = true
                i = nextProps.length
              } else {
                i++
              }
            }
            return shouldUpdate
          } else {
            if (nextState !== _this.state) {
              return true
            } else {
              return false
            }
          }
        }
      }),
      _temp)),
      possibleConstructorReturn(_this, _ret)
    )
  }

  DragComponent.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this

    this.unsubscribe = dndStore.subscribe(function() {
      _this2.setState(dndStore.getState())
    })
  }

  DragComponent.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe()
  }

  DragComponent.prototype.render = function render() {
    var state = this.state
    var accepts = state.currentlyHoveredDroppableAccepts
    var isOverDroppable = typeof state.currentlyHoveredDroppableId === 'string'

    return (
      (this.props.alwaysRender ||
        (state.isDragging && state.currentlyDraggingId === this.props.for)) &&
      this.props.children(
        _extends({}, state, {
          isOverAccepted: isOverDroppable
            ? accepts !== null
              ? Array.isArray(accepts)
                ? accepts.includes(state.type)
                : state.type === accepts
              : true
            : false
        })
      )
    )
  }

  return DragComponent
})(Component)

DragComponent.defaultProps = {
  for: '',
  alwaysRender: false,
  subscribeTo: null
}

DragComponent.propTypes = {
  children: PropTypes.func.isRequired,
  for: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  alwaysRender: PropTypes.bool,
  subscribeTo: PropTypes.array
}

var Draggable = (function(_React$Component) {
  inherits(Draggable, _React$Component)

  function Draggable() {
    var _temp, _this, _ret

    classCallCheck(this, Draggable)

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    return (
      (_ret = ((_temp = ((_this = possibleConstructorReturn(
        this,
        _React$Component.call.apply(_React$Component, [this].concat(args))
      )),
      _this)),
      (_this.state = {
        startCoordinate: null,
        storeState: _extends({}, dndStore.getState(), { isActive: false })
      }),
      (_this.startDragDelay = function(e) {
        var x = void 0
        var y = void 0
        if ('ontouchstart' in window && e.touches) {
          x = e.touches[0].clientX
          y = e.touches[0].clientY
        } else {
          e.preventDefault()
          x = e.clientX
          y = e.clientY
        }
        dndStore.update({
          startingX: x,
          startingY: y
        })
        _this.setState({ startCoordinate: { x: x, y: y } })
        document.addEventListener('mouseup', _this.endDragDelay)
        document.addEventListener('mousemove', _this.checkDragDelay)
        document.addEventListener('touchend', _this.endDragDelay)
        document.addEventListener('touchmove', _this.checkDragDelay)
      }),
      (_this.checkDragDelay = function(e) {
        var x = void 0
        var y = void 0
        if ('ontouchstart' in window && e.touches) {
          x = e.touches[0].clientX
          y = e.touches[0].clientY
        } else {
          e.preventDefault()
          x = e.clientX
          y = e.clientY
        }
        var a = Math.abs(_this.state.startCoordinate.x - x)
        var b = Math.abs(_this.state.startCoordinate.y - y)
        var distance = Math.round(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)))
        var dragDistance = _this.props.delay
        if (distance >= dragDistance) {
          _this.endDragDelay()
          if ('ontouchstart' in window && e.touches) {
            _this.startMobileDrag(e)
          } else {
            _this.startDrag(e)
          }
        }
      }),
      (_this.endDragDelay = function() {
        document.removeEventListener('mouseup', _this.endDragDelay)
        document.removeEventListener('mousemove', _this.checkDragDelay)
        document.removeEventListener('touchend', _this.endDragDelay)
        document.removeEventListener('touchmove', _this.checkDragDelay)
        _this.setState({ startCoordinate: null })
      }),
      (_this.startDrag = function(e) {
        dndStore.update({
          isDragging: true,
          startingX: e.clientX,
          startingY: e.clientY,
          x: e.clientX,
          y: e.clientY,
          currentlyDraggingId: _this.props.id,
          data: _this.props.data,
          type: _this.props.type
        })
        _this.props.onDragStart(dndStore.getState().data, dndStore.getState())
        window.addEventListener('mouseup', _this.stopDrag)
        window.addEventListener('mousemove', _this.updateCoordinates)
      }),
      (_this.startMobileDrag = function(e) {
        _this.props.onDragStart(dndStore.getState().data, dndStore.getState())
        var touch = e.touches[0]
        dndStore.update({
          isDragging: true,
          startingX: touch.clientX,
          startingY: touch.clientY,
          x: touch.clientX,
          y: touch.clientY,
          currentlyDraggingId: _this.props.id,
          data: _this.props.data,
          type: _this.props.type
        })
        window.addEventListener('touchend', _this.stopDrag)
        window.addEventListener('touchmove', _this.updateMobileCoordinates)
      }),
      (_this.stopDrag = function(e) {
        _this.props.onDragEnd(dndStore.getState().data, dndStore.getState())
        dndStore.reset()
        window.removeEventListener('mouseup', _this.stopDrag)
        window.removeEventListener('mousemove', _this.updateCoordinates)
        window.removeEventListener('touchend', _this.stopDrag)
        window.removeEventListener('touchmove', _this.updateMobileCoordinates)
      }),
      (_this.updateCoordinates = function(e) {
        dndStore.update({
          x: e.clientX,
          y: e.clientY
        })
        _this.props.onDrag(null, dndStore.getState())
      }),
      (_this.updateMobileCoordinates = function(e) {
        var touch = e.touches[0]
        dndStore.update({
          x: touch.clientX,
          y: touch.clientY
        })
        _this.props.onDrag(null, dndStore.getState())
      }),
      (_this.shouldComponentUpdate = function(nextProps, nextState) {
        if (nextProps !== _this.props) {
          return true
        } else {
          if (nextProps.subscribeTo) {
            var shouldUpdate = false
            var i = 0
            while (i < nextProps.subscribeTo.length - 1) {
              if (
                _this.state[nextProps.subscribeTo[i]] !==
                nextState[nextProps.subscribeTo[i]]
              ) {
                shouldUpdate = true
                i = nextProps.length
              } else {
                i++
              }
            }
            return shouldUpdate
          } else {
            if (nextState !== _this.state) {
              return true
            } else {
              return false
            }
          }
        }
      }),
      _temp)),
      possibleConstructorReturn(_this, _ret)
    )
  }

  Draggable.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this

    this.unsubscribe = dndStore.subscribe(function() {
      var state = dndStore.getState()
      _this2.setState({
        storeState: _extends({}, state, {
          isActive: state.currentlyDraggingId === _this2.props.id
        })
      })
    })
  }

  Draggable.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe()
  }

  Draggable.prototype.render = function render() {
    var state = this.state.storeState
    return this.props.children(
      _extends({}, state, {
        events: {
          onMouseDown: this.startDragDelay,
          onTouchStart: this.startDragDelay
        }
      })
    )
  }

  return Draggable
})(Component)

Draggable.defaultProps = {
  id: getId(),
  data: null,
  type: null,
  delay: 8,
  onDragStart: noop,
  onDrag: noop,
  onDragEnd: noop,
  subscribeTo: null
}

Draggable.propTypes = {
  children: PropTypes.func.isRequired,
  delay: PropTypes.number,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  type: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onDragStart: PropTypes.func,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  subscribeTo: PropTypes.array
}

var Droppable = (function(_React$Component) {
  inherits(Droppable, _React$Component)

  function Droppable() {
    var _temp, _this, _ret

    classCallCheck(this, Droppable)

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    return (
      (_ret = ((_temp = ((_this = possibleConstructorReturn(
        this,
        _React$Component.call.apply(_React$Component, [this].concat(args))
      )),
      _this)),
      (_this.state = _extends({}, dndStore.getState(), { isOver: false })),
      (_this.setOver = function() {
        if (dndStore.getState().isDragging) {
          dndStore.update({
            currentlyHoveredDroppableId: _this.props.id,
            currentlyHoveredDroppableAccepts: _this.props.accepts
          })
          _this.props.onDragEnter()
        }
      }),
      (_this.setOut = function() {
        if (dndStore.getState().isDragging) {
          dndStore.update({
            currentlyHoveredDroppableId: null,
            currentlyHoveredDroppableAccepts: null
          })
          _this.props.onDragLeave()
        }
      }),
      (_this.touchEnd = function(event) {
        var _store$getState = dndStore.getState(),
          data = _store$getState.data,
          type = _store$getState.type,
          x = _store$getState.x,
          y = _store$getState.y,
          isDragging = _store$getState.isDragging

        console.log('onEnd', data, x, y)

        var element = document.getElementById(_this.props.id)
        console.log('getBoundingClientRect', element.getBoundingClientRect())
        console.log('onEnd', event)

        var boundingBox = element.getBoundingClientRect()

        var x1 = boundingBox.x
        var x2 = boundingBox.x + boundingBox.width

        var y1 = boundingBox.y
        var y2 = boundingBox.y + boundingBox.height

        console.log(x1, x2, y1, y2)

        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
          if (isDragging) {
            if (Array.isArray(_this.props.accepts)) {
              if (_this.props.accepts.includes(type)) {
                _this.props.onDrop(data)
              }
            } else {
              if (type === _this.props.accepts) {
                _this.props.onDrop(data)
              }
            }
          }
        } else {
          console.log('no drop')
        }
      }),
      (_this.onDrop = function() {
        var _store$getState2 = dndStore.getState(),
          data = _store$getState2.data,
          type = _store$getState2.type,
          isDragging = _store$getState2.isDragging

        console.log('DROP', data, type)
        if (isDragging) {
          if (Array.isArray(_this.props.accepts)) {
            if (_this.props.accepts.includes(type)) {
              _this.props.onDrop(data)
            }
          } else {
            if (type === _this.props.accepts) {
              _this.props.onDrop(data)
            }
          }
        }
      }),
      (_this.shouldComponentUpdate = function(nextProps, nextState) {
        if (nextProps !== _this.props) {
          return true
        } else {
          if (nextProps.subscribeTo) {
            var shouldUpdate = false
            var i = 0
            while (i < nextProps.subscribeTo.length - 1) {
              if (
                _this.state[nextProps.subscribeTo[i]] !==
                nextState[nextProps.subscribeTo[i]]
              ) {
                shouldUpdate = true
                i = nextProps.length
              } else {
                i++
              }
            }
            return shouldUpdate
          } else {
            if (nextState !== _this.state) {
              return true
            } else {
              return false
            }
          }
        }
      }),
      _temp)),
      possibleConstructorReturn(_this, _ret)
    )
  }

  Droppable.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this

    this.unsubscribe = dndStore.subscribe(function() {
      var state = dndStore.getState()
      _this2.setState(
        _extends({}, state, {
          isOver: state.currentlyHoveredDroppableId === _this2.props.id,
          willAccept: Array.isArray(_this2.props.accepts)
            ? _this2.props.accepts.includes(state.type)
            : _this2.props.accepts === state.type
        })
      )
    })

    document.addEventListener('touchend', this.touchEnd)
  }

  Droppable.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe()
    document.removeEventListener('touchend', this.touchEnd)
  }

  Droppable.prototype.render = function render() {
    var state = this.state
    return this.props.children(
      _extends({}, state, {
        events: {
          onMouseEnter: this.setOver,
          onMouseLeave: this.setOut,
          onMouseUp: this.onDrop
        }
      })
    )
  }

  return Droppable
})(Component)

Droppable.defaultProps = {
  id: getId(),
  accepts: null,
  onDragEnter: noop,
  onDragLeave: noop,
  onDrop: noop,
  subscribeTo: null
}

Droppable.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  children: PropTypes.func.isRequired,
  accepts: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onDrop: PropTypes.func,
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func,
  subscribeTo: PropTypes.array
}

var DragState = (function(_React$Component) {
  inherits(DragState, _React$Component)

  function DragState() {
    var _temp, _this, _ret

    classCallCheck(this, DragState)

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    return (
      (_ret = ((_temp = ((_this = possibleConstructorReturn(
        this,
        _React$Component.call.apply(_React$Component, [this].concat(args))
      )),
      _this)),
      (_this.state = dndStore.getState()),
      (_this.shouldComponentUpdate = function(nextProps, nextState) {
        if (nextProps !== _this.props) {
          return true
        } else {
          if (nextProps.subscribeTo) {
            var shouldUpdate = false
            var i = 0
            while (i < nextProps.subscribeTo.length - 1) {
              if (
                _this.state[nextProps.subscribeTo[i]] !==
                nextState[nextProps.subscribeTo[i]]
              ) {
                shouldUpdate = true
                i = nextProps.length
              } else {
                i++
              }
            }
            return shouldUpdate
          } else {
            if (nextState !== _this.state) {
              return true
            } else {
              return false
            }
          }
        }
      }),
      _temp)),
      possibleConstructorReturn(_this, _ret)
    )
  }

  DragState.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this

    this.unsubscribe = dndStore.subscribe(function() {
      _this2.setState(dndStore.getState())
    })
  }

  DragState.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe()
  }

  DragState.prototype.render = function render() {
    var children = this.props.children

    return children(_extends({}, this.state))
  }

  return DragState
})(Component)

DragState.defaultProps = {
  subscribeTo: null
}

DragState.propTypes = {
  children: PropTypes.func.isRequired,
  subscribeTo: PropTypes.array
}

export { DragComponent, Draggable, Droppable, DragState }
