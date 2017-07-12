# vue-app-router
> Router for vue based mobile SPA.

## Introduction
Like vue-router but vue-app-router puts all route views into a stack, like native, past route views would be kept.

## Installation
``` bash
npm install vue-router
```
## Usage
### HTML
``` html
<div id="app">
  <router-views></router-views>
</div>
```

### JavaScript
``` javascript
import Vue from 'vue';
import appRouter from 'vue-app-router';

const Foo = { template: '<div>foo</div>' };
const Bar = { template: '<div>bar</div>' };
const routes = {
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
};

Vue.use(appRouter, {
  routes,
  transition: 'slide'
});

new Vue({
  el: '#app',
  store
}).$mount('#app');
```

## [Live Demo](https://broltes.github.io/vue-sdk/)
