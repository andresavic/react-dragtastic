import * as React from 'react'
import PropTypes from 'prop-types'
import store, { getId, noop } from './store'

class Droppable extends React.Component {
  static defaultProps = {
    id: getId(),
    accepts: null,
    onDragEnter: noop,
    onDragLeave: noop,
    onDrop: noop,
    subscribeTo: null
  }

  state = { ...store.getState(), isOver: false }

  setOver = () => {
    if (store.getState().isDragging) {
      store.update({
        currentlyHoveredDroppableId: this.props.id,
        currentlyHoveredDroppableAccepts: this.props.accepts
      })
      this.props.onDragEnter()
    }
  }

  setOut = () => {
    if (store.getState().isDragging) {
      store.update({
        currentlyHoveredDroppableId: null,
        currentlyHoveredDroppableAccepts: null
      })
      this.props.onDragLeave()
    }
  }

  touchEnd = event => {
    const { data, x, y } = store.getState()
    console.log('onEnd', data, x, y)

    let element = document.getElementById(this.props.id)
    console.log('getBoundingClientRect', element.getBoundingClientRect())
    console.log('onEnd', event)

    let boundingBox = element.getBoundingClientRect()

    const x1 = boundingBox.x
    const x2 = boundingBox.x + boundingBox.width

    const y1 = boundingBox.y
    const y2 = boundingBox.y + boundingBox.height

    console.log(x1, x2, y1, y2)

    if (x >= x1 && x2 <= x2 && y1 >= y && y2 <= y) {
      if (isDragging) {
        if (Array.isArray(this.props.accepts)) {
          if (this.props.accepts.includes(type)) {
            this.props.onDrop(data)
          }
        } else {
          if (type === this.props.accepts) {
            this.props.onDrop(data)
          }
        }
      }
    } else {
      console.log('no drop')
    }
  }

  onDrop = () => {
    const { data, type, isDragging } = store.getState()
    console.log('DROP', data, type)
    if (isDragging) {
      if (Array.isArray(this.props.accepts)) {
        if (this.props.accepts.includes(type)) {
          this.props.onDrop(data)
        }
      } else {
        if (type === this.props.accepts) {
          this.props.onDrop(data)
        }
      }
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps !== this.props) {
      return true
    } else {
      if (nextProps.subscribeTo) {
        let shouldUpdate = false
        let i = 0
        while (i < nextProps.subscribeTo.length - 1) {
          if (
            this.state[nextProps.subscribeTo[i]] !==
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
        if (nextState !== this.state) {
          return true
        } else {
          return false
        }
      }
    }
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      const state = store.getState()
      this.setState({
        ...state,
        isOver: state.currentlyHoveredDroppableId === this.props.id,
        willAccept: Array.isArray(this.props.accepts)
          ? this.props.accepts.includes(state.type)
          : this.props.accepts === state.type
      })
    })

    document.addEventListener('touchend', this.touchEnd)
  }

  componentWillUnmount() {
    this.unsubscribe()
    document.removeEventListener('touchend', this.touchEnd)
  }

  render() {
    const state = this.state
    return this.props.children({
      ...state,
      events: {
        onMouseEnter: this.setOver,
        onMouseLeave: this.setOut,
        onMouseUp: this.onDrop
      }
    })
  }
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

export default Droppable
