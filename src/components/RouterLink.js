export default {
  props: {
    to: String,
    tag: {
      type: String,
      default: 'a'
    },
    replace: Boolean
  },
  render(h) {
    let router = this.$router;
    let path = this.to;
    let data = {
      on: {
        click: e => {
          if (this.replace) router.replace(path);
          else router.push(path);
        }
      }
    }

    return h(this.tag, data, this.$slots.default);
  }
}
