import regexp from 'path-to-regexp'
import RouterViews from './components/RouterViews'
import RouterView from './components/RouterView'
import RouterLink from './components/RouterLink'
import './scss/index.scss'

/**
 * Create route matcher from routes
 * @param {Array} routes
 * @param {Object} routes[]
 * @param {String} routes[].path
 * @param {VueComponent} routes[].component
 * @param {Boolean} routes[].props Passing params to component.props
 * @return {Function}
 */
function createMatch(routes) {
  let recordList = []
  routes.forEach(route => {
    const keys = []
    const regex = regexp(route.path.replace(/\/$/, ''), keys)
    regex.keys = keys

    recordList.push(Object.assign({
      regex,
      props: true
    }, route))
  })

  function matchRecord(regex, path, params) {
    const m = path.match(regex)

    if (!m) return false

    for (let i = 1, len = m.length; i < len; ++i) {
      const key = regex.keys[i - 1]
      const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
      if (key) {
        params[key.name] = val
      }
    }

    return true
  }

  return function(path) {
    for (let i = 0; i < recordList.length; i++) {
      const record = recordList[i]
      let params = {}
      if (matchRecord(record.regex, path, params)) {
        return Object.assign({
          params
        }, record)
      }
    }
  }
}
function getPath() {
  return window.location.hash.replace(/^#/, '')
}

function install(Vue, options) {
  let { routes, transition = 'fade', openPrevious } = options
  let match = createMatch(routes)
  let route = {
    // Default transition for view exchange,
    // can be overwrite by router-view
    transition,
    // router-view stack
    stack: [],
    // -1: back, 1: forward
    direction: 0,
    // cache the timestamp before hash change
    timestamp: 0
  }

  function listener(payload) {
    let currentState = window.history.state || {}
    let { timestamp } = currentState

    if (!timestamp) {
      window.history.replaceState(Object.assign(currentState, {
        timestamp: (timestamp = +new Date())
      }), '', location.hash)
    }
    if (timestamp === route.timestamp) return

    route.direction = timestamp > route.timestamp ? 1 : -1
    route.timestamp = timestamp

    let record = match(getPath())
    if (!record) return

    Object.assign(record, {
      timestamp,
      payload
    })

    if (route.direction > 0) {
      let previousRecord = route.stack.slice(-2)[0]

      if (!openPrevious &&
        previousRecord && previousRecord.path === record.path
      ) {
        // Go back to previous route,
        // when the opening path equals to the previous path.
        route.direction = -1
        // delay after direction updated
        setTimeout(() => {
          route.stack.pop()
          router.go(-2)
        }, 100)
        return
      }

      // push for forward open
      route.stack.push(record)
    } else if (route.direction < 0) {
      if (route.stack.length === 1) {
        // unshift for back open
        route.stack.unshift(record)
      }
      // delay after direction updated
      setTimeout(() => {
        route.stack = route.stack.filter(record => {
          // drop all forward views
          return record.timestamp <= timestamp
        })
      }, 100)
    }
  }

  let router = {
    go(n) {
      window.history.go(n)
    },
    back() {
      this.go(-1)
    },
    forward() {
      this.go(1)
    },

    resolve(path) {
      return '#' + path
    },

    /**
     * @param {String} path
     * @param {Object} payload Will be applied to component.props
     */
    replace(path, payload) {
      window.history.replaceState({
        timestamp: +new Date()
      }, '', this.resolve(path))
      listener(payload)
    },
    /**
     * @param {String} path
     * @param {Object} payload Will be applied to component.props
     */
    push(path, payload) {
      window.history.pushState({
        timestamp: +new Date()
      }, '', this.resolve(path))
      listener(payload)
    },

    /**
     * Get current route
     */
    getRoute() {
      return route.stack.slice(-1)[0]
    },
    /**
     * Get current path
     */
    getPath
  }

  listener()
  window.addEventListener('hashchange', listener)

  Object.defineProperty(Vue.prototype, '$router', {
    get() { return router }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get() { return this.$root._route }
  })

  Vue.mixin({
    beforeCreate() {
      Vue.util.defineReactive(this, '_route', route)
    }
  })

  Vue.component('router-views', RouterViews)
  Vue.component('router-view', RouterView)
  Vue.component('router-link', RouterLink)

  return router
}

export default {
  install
}
