<template>
  <section class="folder-requisites">
    <FolderForm
      :folder="folder"
      @updateInput="updateInput"
      @errorInput="errorInput"
    />

    <ListAddedItems
      class="folder-requisites__list"
      header="Список документов"
      btn-text="Cохранить"
      empty-text="Данные отсутствуют"
      items-type="PrintDocItems"
      icon="IconCheckMark"
      type="tubeDocumentPack"
      extra-btn="Проверить на ошибки"
      :added-items="addedItems"
      :option-menu-items="optionMenuItems"
      :edit-mode="addedItemsEditMode"
      :errors="folder.messages"
      @addItem="saveFolder"
      @updateDocuments="updateDocuments"
      @onItemClick="showDocument"
      @downloadFile="downloadFile"
      @onExtraBtnClick="checkFolder"
      @onErrorClick="onErrorClick"
      @previewDoc="previewDoc"
    />

    <SingleDocView
      v-if="isSingleDocViewOpen"
      :tube-pack-doc="displayedSingleDoc"
      @close="isSingleDocViewOpen = false"
      @updateDocument="updateAndSaveFolder"
      @saveDocument="({ uid }) => saveSingleDoc({
        uid, uname: displayedSingleDoc.uname,
      })"
    />

    <PopupBase
      ref="selectDocumentType"
      :btn-save="false"
      :search="{
        id: 'documentsList',
        placeholder: 'Найти...',
        name: 'documentsList',
      }"
      @filter="filterDocumentsList"
    >
      <template #title>
        Выбрать тип документа
      </template>

      <template #body>
        <DocumentsList
          :list="filteredDocumentTypeList"
          @show="openTableSelect"
        />
      </template>
    </PopupBase>

    <Popup ref="selectDocTable">
      <template #body>
        <Component
          :is="selectDocTable.component"
          :document-type="selectDocTable.uname"
          :value="selectDocTable.value"
          @closeTableSelection="$refs.selectDocTable.isOpen = false"
          @saveSelected="(items) => addSelectedDocuments({
            items, uname: selectDocTable.uname,
          })"
        />
      </template>
    </Popup>

    <PopupPage
      ref="showTargetErrorDoc"
    >
      <template #title>
        {{ targetErrorDoc.title }}
      </template>

      <template #body>
        <Component
          :is="targetErrorDoc.component"
          :uname="targetErrorDoc.uname"
          :uid="targetErrorDoc.uid"
        />
      </template>
    </PopupPage>

    <Component
      :is="targetErrorDoc.component"
      v-if="isTargetErrorDocOpen"
      :uname="targetErrorDoc.uname"
      :uid="targetErrorDoc.uid"
      @hiddenModal="isTargetErrorDocOpen = false"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import FolderForm from '@/components/TubeDocumentPack/Folder/FolderRequisites/FolderForm.vue';
import ListAddedItems from '@/components/ListAddedItems/ListAddedItems.vue';
import SingleDocView from '@/components/TubeDocumentPack/Documents/SingleDocs/SingleDocView.vue';
import DocumentsList from '@/components/Documents/DocumentsList.vue';
import PopupBase from '@/components/PopupBase/PopupBase.vue';
import Popup from '@/components/Popup/Popup.vue';
import SelectDocuments from '@/components/TubeDocumentPack/Folder/SelectDocuments.vue';
import SelectConclusions from '@/components/TubeDocumentPack/Folder/SelectConclusions.vue';
import SelectIncomingControl from '@/components/TubeDocumentPack/Folder/SelectIncomingControl.vue';
import { getErrorTemplate } from '@/utils/requestError';
import unrealizedDocs from '@/constants/unrealizedDocs';
import PopupPage from '@/components/PopupPage/PopupPage.vue';
import SelectWorkConclusion from '@/components/Laboratory/SelectWorkConclusion.vue';
import errorTargetUnameDict from '@/components/TubeDocumentPack/Folder/errorTargetUnameDict';
import FolderStatusLog from '@/components/TubeDocumentPack/Folder/FolderRequisites/FolderStatusLog.vue';
import useFolderData from '@/components/TubeDocumentPack/Folder/FolderRequisites/composables/useFolderData';
import useFolderFiles from '@/components/TubeDocumentPack/Folder/FolderRequisites/composables/useFolderFiles';
import useFolderEditMode from '@/components/TubeDocumentPack/Folder/FolderRequisites/composables/useFolderEditMode';
import jointConclusionUnames from '@/constants/jointConclusionUnames';
import asyncComponents from '@/components/asyncComponents/viewCopmonents';

export default {
  name: 'FolderRequisites',

  components: {
    FolderForm,
    ListAddedItems,
    SingleDocView,
    DocumentsList,
    PopupBase,
    Popup,
    SelectDocuments,
    SelectConclusions,
    SelectIncomingControl,
    PopupPage,
    SelectWorkConclusion,
    FolderStatusLog,
    ...asyncComponents,
  },

  props: {
    data: { type: Object, default: () => {} },
  },

  emits: ['updateFolder', 'error', 'saveFolder', 'updateDocument', 'promt'],

  setup(_, ctx) {
    const store = useStore();

    const documentsListFilter = ref('');
    const selectDocumentType = ref(null);

    const docPackRefs = computed(() => store.getters['refs/getDocPackRefs']('full'));

    const addMultipleDoc = () => {
      documentsListFilter.value = '';
      selectDocumentType.value.isOpen = true;
    };

    const isSingleDocument = (uname) => {
      try {
        return docPackRefs.value.find((docRef) => docRef.uname === uname).isSingleDocument;
      } catch {
        console.error(`Unknown document uname: "${uname}"`);
        return false;
      }
    };

    const changePromt = (data) => {
      ctx.emit('promt', data);
    };

    const showError = (error) => {
      changePromt(getErrorTemplate(error));
    };

    const {
      addedItemsEditMode, changeEditMode, optionMenuItems,
    } = useFolderEditMode({ addMultipleDoc });

    const {
      folder,
      updateInput,
      updateDocuments,
      errorInput,
      setFolder,
      updateAndSaveFolder,
      saveFolder,
      addDocuments,
      saveSingleDoc,
    } = useFolderData(ctx, { changeEditMode });

    const {
      getFile, getScans, getPrintDocument, getPreviewFile, checkFolder, downloadFile, previewDoc,
    } = useFolderFiles({
      folder,
      updateInput,
      saveFolder,
      updateAndSaveFolder,
      isSingleDocument,
      showError,
      changePromt,
    });

    return {
      folder,
      docPackRefs,
      addedItemsEditMode,
      changeEditMode,
      optionMenuItems,
      updateInput,
      updateDocuments,
      documentsListFilter,
      selectDocumentType,
      addMultipleDoc,
      errorInput,
      setFolder,
      updateAndSaveFolder,
      saveFolder,
      addDocuments,
      saveSingleDoc,
      isSingleDocument,
      changePromt,
      showError,
      getFile,
      getScans,
      getPrintDocument,
      getPreviewFile,
      checkFolder,
      downloadFile,
      previewDoc,
    };
  },

  data() {
    return {
      displayedSingleDoc: {},
      isSingleDocViewOpen: false,
      isTargetErrorDocOpen: false,
      targetErrorDoc: {
        title: '',
        uname: '',
        uid: '',
        component: null,
      },
      selectDocTable: {
        component: null,
        uname: '',
        params: {},
        value: [],
      },
    };
  },

  computed: {
    approvedDocuments() {
      return this.$store.getters['project/getApprovedDocuments'];
    },

    addedItems() {
      if (this.folder.printForms?.length > 0) {
        try {
          return this.folder.documents
            .map((doc) => ({
              ...doc,
              printFormId: this.folder.printForms
                .find((form) => form.uname === doc.uname).printFormId,
            }));
        } catch (e) {
          console.error(e);
          this.showError('Incorrect tubeDocumentPack data');
          return [];
        }
      }
      return this.folder.documents;
    },

    allDocumentRefs() {
      const common = this.$store.getters['refs/getDocPackRefs']('common');
      const tubeDocumentPackExtra = this.$store.getters['refs/getDocPackRefs']('tubeDocumentPackExtra');
      return [...common, ...tubeDocumentPackExtra]
        .filter((type) => !type.isSingleDocument
          && this.folder.printForms
            .some((printForm) => printForm.uname === type.uname));
    },

    documentRefs() {
      return this.allDocumentRefs.filter((docRef) => !unrealizedDocs.has(docRef.uname));
    },

    documentTypeList() {
      return this.documentRefs.map((type) => ({
        ...type,
        name: type.label,
      }));
    },

    сurrentFolder() {
      return this.$store.getters['folder/getCurrentFolder'];
    },

    filteredDocumentTypeList() {
      return this.documentTypeList
        .filter((docType) => docType.name.toLowerCase()
          .includes(this.documentsListFilter));
    },
  },

  watch: {
    сurrentFolder(val) {
      this.setFolder(val);
      this.changeEditMode('');
    },
  },

  created() {
    if (this.data && Object.keys(this.data).length !== 0) {
      this.setFolder(this.data);
    }
  },

  methods: {
    showDocument(doc) {
      const { uname } = doc;
      if (this.isSingleDocument(uname) && uname !== 'incomingControlJournal') {
        this.displayedSingleDoc = doc;
        this.isSingleDocViewOpen = true;
      }
    },

    openTableSelect(documentType) {
      this.selectDocumentType.isOpen = false;
      const { uname } = documentType;
      const docUname = jointConclusionUnames.includes(uname)
        ? 'jointConclusion'
        : documentType.uname;

      const docComponent = {
        jointConclusion: 'SelectConclusions',
        incomingControl: 'SelectIncomingControl',
        workConclusion: 'SelectWorkConclusion',
      };
      this.selectDocTable.component = docComponent[docUname] ?? 'SelectDocuments';
      this.selectDocTable.uname = uname;
      this.selectDocTable.value = this.folder.documents
        .filter((doc) => doc.uname === uname);

      this.$refs.selectDocTable.isOpen = true;
    },

    addSelectedDocuments({ items, uname }) {
      const documents = items.map((doc) => ({ uid: doc.uid, uname }));
      this.addDocuments(documents);
      this.$refs.selectDocTable.isOpen = false;
    },

    filterDocumentsList({ value }) {
      this.documentsListFilter = value.toLowerCase();
    },

    onErrorClick({ item, error }) {
      this.changePromt(null);
      const { uname: targetUname, uid: targetUid } = error.target;
      const withoutWrapperComponents = [
        'specificationRevision',
        'drawingRevision',
        'welderSkill',
      ];

      this.targetErrorDoc = {
        uname: targetUname,
        uid: targetUid,
      };
      if (errorTargetUnameDict[targetUname]) {
        if (!targetUid) {
          this.showError('Документ отсутствует или был удален');
          return;
        }
        const { title, componentName } = errorTargetUnameDict[targetUname];
        this.targetErrorDoc = {
          ...this.targetErrorDoc,
          title,
          component: componentName,
        };

        if (withoutWrapperComponents.includes(targetUname)) {
          this.isTargetErrorDocOpen = true;
        } else {
          this.$refs.showTargetErrorDoc.isOpen = true;
        }
      } else if (targetUname && this.isSingleDocument(targetUname)) {
        this.showDocument(item);
      }
    },
  },
};
</script>

<style scoped>
  .folder-requisites__list {
    margin-top: 24px;
  }
</style>
