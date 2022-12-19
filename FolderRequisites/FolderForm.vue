<template>
  <form
    class="form"
    @submit.prevent=""
  >
    <div class="form-block">
      <h2
        class="form-block__title"
      >
        Данные реквизитов
      </h2>

      <div class="form__row">
        <InputText
          name="name"
          label="Наименование"
          :value="folder.name"
          :required="true"
          @update="updateInput"
          @error="errorInput"
        />
      </div>
      <div class="form__row">
        <InputText
          name="date"
          label="Год"
          :value="folder.date"
          :required="true"
          @update="updateInput"
          @error="errorInput"
        />
        <InputText
          name="bookNumber"
          label="Книга №"
          :value="folder.bookNumber"
          :required="true"
          @update="updateInput"
          @error="errorInput"
        />
        <InputText
          name="tomeNumber"
          label="Том №"
          :value="folder.tomeNumber"
          :required="true"
          @update="updateInput"
          @error="errorInput"
        />
      </div>

      <div class="form__row">
        <InputSelectCheckbox
          label="Статус"
          name="currentStatus"
          :value="folder.currentStatus.status"
          :roles="statusesRefs"
          :required="true"
          :single-select="true"
          :for-form="true"
          @filter="updateInput"
          @error="errorInput"
        />

        <InputText
          label="Дата изменения статуса"
          icon="IconPromtInfo"
          icon-title="История изменений"
          :value="formatDate(folder.currentStatus.date)"
          :disabled="true"
          @onIconClick="isStatusLogOpen = true"
        />
      </div>
    </div>
  </form>

  <FolderStatusLog
    :status-log="[folder.currentStatus, ...folder.statusChangeLog]"
    :is-popup-info-open="isStatusLogOpen"
    @closeStatusLog="isStatusLogOpen = false"
  />
</template>

<script>
import InputText from '@/components/Inputs/InputText.vue';
import InputSelectCheckbox from '@/components/Inputs/InputSelectCheckbox.vue';
import FolderStatusLog from '@/components/TubeDocumentPack/Folder/FolderRequisites/FolderStatusLog.vue';
import formatDate from '@/utils/formatDate';

export default {
  name: 'FolderRequisitesForm',

  components: {
    InputText,
    InputSelectCheckbox,
    FolderStatusLog,
  },

  props: {
    folder: { type: Object, default: () => ({}) },
  },

  emits: ['updateInput', 'errorInput'],

  data() {
    return {
      formatDate,
      isStatusLogOpen: false,
    };
  },

  computed: {
    statusesRefs() {
      return this.$store.getters['refs/getDocPackRefs']('statuses');
    },
  },

  methods: {
    updateInput(data) {
      this.$emit('updateInput', data);
    },

    errorInput(data) {
      this.$emit('errorInput', data);
    },
  },
};
</script>

<style lang="scss" scoped>
@include form;
</style>
