<template>
  <transition :name="`${transitionName}-${directionName}`">
    <div :class="`router-view ${transitionName}`">
      <slot></slot>
    </div>
  </transition>

</template>

<script>
export default {
  computed: {
    transitionName() {
      return `router-view-${this.$route.transition}`;
    },
    directionName() {
      return {
        '1': 'forward',
        '-1': 'back'
      }[this.$route.direction];
    }
  }
}
</script>
