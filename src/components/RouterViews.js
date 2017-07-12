export default {
  functional: true,

  render(_, { parent }) {
    const h = parent.$createElement;
    const { stack } = parent.$route;

    return h('div', {
      'class': 'router-views'
    }, stack.map((route, i) => {
      const data = {
        attrs: {
          'data-stack-id': stack.length - i
        }
      };
      // Set route params to child component props
      if (route.props) data.props = route.params;

      return h(route.component, data);
    }));
  }
}
