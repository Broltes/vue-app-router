export default {
  props: {
    to: String,
    tag: {
      type: String,
      default: 'a'
    }
  },
  render(h) {
    return h(this.tag, {
      attrs: {
        href: this.$router.resolve(this.to)
      }
    }, this.$slots.default);
  }
}
