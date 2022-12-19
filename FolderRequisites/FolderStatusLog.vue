<template>
  <PopupInfo
    title="История изменений"
    :is-open="isPopupInfoOpen"
    @close="$emit('closeStatusLog')"
  >
    <div class="status-log">
      <p
        v-for="(logItem ,index) in statusLog"
        :key="index"
        class="status-log__item"
      >
        <span class="status-log__status">
          {{ `${getStatusName(logItem.status)}: ` }}
        </span>
        <span class="status-log__date">
          {{ formatDate(logItem.date) }}
        </span>
      </p>
    </div>
  </PopupInfo>
</template>

<script>
import PopupInfo from '@/components/PopupInfo/PopupInfo.vue';
import formatDate from '@/utils/formatDate';

export default {
  name: 'FolderStatusLog',

  components: {
    PopupInfo,
  },

  props: {
    isPopupInfoOpen: { type: Boolean, default: false },
    statusLog: { type: Array, default: () => [] },
  },

  emits: ['closeStatusLog'],

  data() {
    return {
      formatDate,
    };
  },

  computed: {
    statusesRefs() {
      return this.$store.getters['refs/getDocPackRefs']('statuses');
    },
  },

  methods: {
    getStatusName(id) {
      return this.statusesRefs.find((ref) => ref.id === id).label.rus;
    },
  },
};
</script>

<style lang="scss" scoped>
.status-log {
  width: 350px;
}

.status-log__item {
  display: flex;
  justify-content: space-between;

  width: 100%;
  margin-bottom: 5px;
}

.status-log__status {
  color: $blue-sec-100;

  font-size: 14px;
  font-weight: 600;
  line-height: 115%;
}

.status-log__date {
  color: $blue-sec-60;

  font-size: 14px;
  font-weight: 500;
  line-height: 115%;
}
</style>
