Component({
  properties: {
    type: {
      type: String,
      value: 'add'
    },
    size: {
      type: Number,
      value: 24
    },
    color: {
      type: String,
      value: '#000000'
    }
  },
  data: {
    icons: {
      add: '/assets/icons/WeuiAddFilled.svg',
      delete: '/assets/icons/WeuiDeleteFilled.svg',
      link: '/assets/icons/WeuiLinkFilled.svg',
      me: '/assets/icons/WeuiMeFilled.svg',
      more: '/assets/icons/WeuiMore2Filled.svg'
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent('click');
    }
  }
}) 