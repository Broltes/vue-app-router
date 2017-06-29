export default {
  functional: true,

  render(_, { parent }) {
    const h = parent.$createElement;
    const { stack } = parent.$route;

    return h('div', {
      'class': 'router-views'
    }, stack.map((route, i) => {
      return h(route.component, {
        attrs: {
          'data-stackid': stack.length - i
        }
      });
    }));
  }
}
