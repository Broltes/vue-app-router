export default {
  functional: true,

  render(_, { parent }) {
    const h = parent.$createElement
    const { stack } = parent.$route

    return h('div', {
      'class': 'router-views'
    }, stack.map((record, i) => {
      const data = {
        attrs: {
          'data-stack-id': stack.length - i
        }
      }
      // Set route params to child component props
      if (record.props) {
        data.props = Object.assign({}, record.params, record.payload)
      }

      return h(record.component, data)
    }))
  }
}
