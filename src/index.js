// TODO: better support for tracking touch position during swiping

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import raf from 'raf'
import Swipeable from 'react-swipeable'

import FluidGallery from './fluid-gallery'

const noop = () => undefined

class ReactFluidGallery extends Component {
  static propTypes = {
    slides: PropTypes.arrayOf(PropTypes.string).isRequired,
    startAt: PropTypes.number,
    onChange: PropTypes.func,
    style: PropTypes.object
  }

  static defaultProps = {
    onChange: noop,
    style: { }
  }

  _current = (typeof this.props.startAt !== 'undefined'
    ? this.props.startAt
    : (Math.random() * this.props.slides.length | 0)
  )

  componentDidMount() {
    window.addEventListener('resize', this._onResize)
    this._reset(this.props)
    this._tick()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize)
    if (this._tickRaf) {
      raf.cancel(this._tickRaf)
      this._tickRaf = null
    }
  }

  render() {
    const {
      slides,
      startAt,
      onChange,
      style,
      ...rest
    } = this.props

    return (
      <Swipeable
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style
        }}
        {...rest}
        stopPropagation={true}
        preventDefaultTouchmoveEvent={true}
        onSwiped={this._onSwiped}
        innerRef={this._containerRef}
      >
        <canvas
          ref={this._canvasRef}
          onWheel={this._onWheel}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </Swipeable>
    )
  }

  goto = (index) => {
    if (this._gallery && index <= this.props.slides.length) {
      this._gallery.newPosition(index)
    }
  }

  next = () => {
    if (this._gallery && this.props.slides) {
      this._gallery.next()
    }
  }

  prev = () => {
    if (this._gallery && this.props.slides) {
      this._gallery.prev()
    }
  }

  _containerRef = (ref) => {
    this._container = ref
  }

  _canvasRef = (ref) => {
    this._canvas = ref
  }

  _onWheel = (event) => {
    event.preventDefault()
    this._gallery.onScroll(event)
  }

  _onSwiped = (event, deltaX, deltaY, isFlick) => {
    if (isFlick) {
      deltaY *= 5
    }

    this._gallery.onScroll({
      ...event,
      deltaY
    })
  }

  _onResize = () => {
    this._canvas.width = this._container.clientWidth
    this._canvas.height = this._container.clientHeight

    if (this._gallery) {
      this._gallery.resize()
    }
  }

  _tick = () => {
    const {
      onChange
    } = this.props

    this._gallery.update()
    this._gallery.render()

    if (this._current !== this._gallery.actualSlideIndex) {
      this._current = this._gallery.actualSlideIndex
      onChange(this._current)
    }

    this._tickRaf = raf(this._tick)
  }

  _reset(props) {
    const {
      slides
    } = props

    this._onResize()

    this._gallery = new FluidGallery({
      canvas: this._canvas,
      slides,
      current: this._current
    })
  }
}

export default ReactFluidGallery
