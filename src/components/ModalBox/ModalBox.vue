<template src='./template.html'></template>

<script>
import Deposit from '@/components/Deposit/Deposit.vue';
import Withdrawl from '@/components/Withdrawl/Withdrawl.vue';
import BalanceTransfer from '@/components/BalanceTransfer/BalanceTransfer.vue';

export default {
  name: 'modal-box',
  components: {
    Deposit,
    Withdrawl,
    BalanceTransfer,
  },
  props: {
    internalComponent: {
      required: true,
    },
    show: {
      default: false,
    },
  },
  methods: {
    closeModal() {
      this.$emit('modal-closed');
    },
    updateShow(show) {
      if (this.show && !show) {
        this.closeModal();
      }
    },
    handleKeyUp(keyboardEvent) {
      if (keyboardEvent.keyCode === 27) {
        this.closeModal();
      }
    },
  },
};
</script>
