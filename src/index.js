import regexp from 'path-to-regexp'
import RouterViews from './components/RouterViews';
import RouterView from './components/RouterView';
import RouterLink from './components/RouterLink';
import './scss/_.scss';

function createMatch(routes) {
  let recordList = [];
  routes.forEach(({ path, component }) => {
    recordList.push({
      path,
      component,
      regex: regexp(path.replace(/\/$/, ''))
    });
  });

  function matchRecord(regex, path, params) {
    const m = path.match(regex);

    if (!m) return false;
    else if (!regex.keys) return true;

    for (let i = 1, len = m.length; i < len; ++i) {
      const key = regex.keys[i - 1];
      const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
      if (key) {
        params[key.name] = val;
      }
    }

    return true;
  }

  return function(path) {
    for (let i = 0; i < recordList.length; i++) {
      const record = recordList[i];
      let params = {};
      if (matchRecord(record.regex, path, params)) {
        return {
          path,
          params,
          component: record.component
        };
      }
    }
  }
}
function getPath() {
  return window.location.hash.replace(/^#/, '');
}

function install(Vue, options) {
  let { routes, transition = 'fade' } = options;
  let match = createMatch(routes);
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
  };

  function listener() {
    let currentState = window.history.state || {};
    let { timestamp } = currentState;

    if (!timestamp) {
      window.history.replaceState(Object.assign(currentState, {
        timestamp: (timestamp = +new Date())
      }), '', location.hash);
    }
    if (timestamp === route.timestamp) return;

    route.direction = timestamp > route.timestamp ? 1 : -1;
    route.timestamp = timestamp;

    let record = match(getPath());
    if (!record) return;

    record.timestamp = timestamp;

    if (route.direction > 0) {
      // push for foward open
      route.stack.push(record);
    } else if (route.direction < 0) {
      if (route.stack.length === 1) {
        // unshift for back open
        route.stack.unshift(record);
      }
      // delay after direction updated
      setTimeout(() => {
        route.stack = route.stack.filter(record => {
          return record.timestamp <= timestamp;
        });
      }, 100);
    }
  }
  let router = {
    go(n) {
      window.history.go(n);
    },
    back() {
      this.go(-1);
    },
    forward() {
      this.go(1);
    },
    resolve(path) {
      return '#' + path;
    },
    replace(path) {
      window.history.replaceState({
        timestamp: +new Date()
      }, '', this.resolve(path));
      listener();
    },
    push(path) {
      window.history.pushState({
        timestamp: +new Date()
      }, '', this.resolve(path));
      listener();
    }
  };

  listener();
  window.addEventListener('hashchange', listener);

  Object.defineProperty(Vue.prototype, '$router', {
    get() { return router; }
  });
  Object.defineProperty(Vue.prototype, '$route', {
    get() { return this.$root._route; }
  });

  Vue.mixin({
    beforeCreate() {
      Vue.util.defineReactive(this, '_route', route);
    }
  });

  Vue.component('router-views', RouterViews);
  Vue.component('router-view', RouterView);
  Vue.component('router-link', RouterLink);
}

export default {
  install
}
