import { computed } from 'vue';
import { useStore } from 'vuex';
import docsWithScan from '@/constants/docsWithScan';

const useFolderFiles = ({
  folder, updateInput, saveFolder, updateAndSaveFolder, isSingleDocument, showError, changePromt,
}) => {
  const store = useStore();

  const docPackRefs = computed(() => store.getters['refs/getDocPackRefs']('full'));
  const сurrentFolder = computed(() => store.getters['folder/getCurrentFolder']);

  const getFile = ({ fileName, originName, isPreview = false }) => store
    .dispatch('files/downloadFile', { fileName, originName, isPreview });

  const getScans = (uid) => {
    const params = { fileUname: 'default' };
    return store.dispatch('files/getFileList', { uid, params });
  };

  const getPreviewFile = async (payload) => {
    try {
      const response = await store.dispatch('files/getPreviewFile', payload);
      const newMessages = response.data?.messages;
      if (newMessages) {
        const { uid, uname } = payload;
        let filtredMessages = folder.messages
          .filter((mes) => mes.section !== uname);
        if (!isSingleDocument(uname)) {
          filtredMessages = filtredMessages
            .filter((mes) => mes.source.uid !== uid);
        }
        const newValue = [...filtredMessages, ...newMessages];
        updateInput({ name: 'messages', value: newValue });
        saveFolder();
      }
    } catch (err) {
      showError(err);
    }
  };

  const getPrintDocument = async (payload) => {
    const {
      originName, uname, printFormId, uid, isPreview = false,
    } = payload;
    if (isPreview) {
      getPreviewFile(payload);
      return;
    }

    try {
      const response = await store.dispatch('print/getDocumentPrint', payload);
      if (response.data) {
        const fileName = response.data.result;
        getFile({ fileName, originName });
      } else {
        showError(`Error download file "${uname}/${printFormId}/${uid}". Response is empty`);
      }
    } catch (err) {
      showError(err);
    }
  };

  const getDocName = (uname) => {
    try {
      return docPackRefs.value.find((ref) => ref.uname === uname).label;
    } catch {
      console.error(`Unknown document uname: "${uname}"`);
      return '';
    }
  };

  const checkFolder = async () => {
    store.commit('setLoaderOverlayStatus', true);
    try {
      const response = await store.dispatch('folder/checkFolder', folder.uid);
      updateInput({ name: 'messages', value: response.data.messages });
      updateAndSaveFolder();
    } catch (err) {
      showError(err);
    } finally {
      store.commit('setLoaderOverlayStatus', false);
    }
  };

  const downloadFile = async ({
    uname, uid, name: docName, isPreview = false,
  }) => {
    const SCAN_PRINT_FORM_ID = 23;
    changePromt(null);
    const originName = `${getDocName(uname)}.zip`;
    const { printFormId } = сurrentFolder.value.printForms
      .find((form) => form.uname === uname);
    const payload = {
      uid,
      uname,
      printFormId,
      originName,
      isPreview,
      params: {
        documentPackUid: сurrentFolder.value.uid,
      },
    };

    if (docsWithScan.includes(uname)) {
      try {
        const response = await getScans(uid);
        const fileList = response.data.result;
        if (fileList.length > 0) {
          const { fileName, originName: scanName } = fileList[0];
          getFile({ fileName, originName: scanName, isPreview });
        } else if (printFormId === SCAN_PRINT_FORM_ID) {
          showError(`Не добавлен скан документа "${docName ?? getDocName(uname)}"`);
        } else {
          getPrintDocument(payload);
        }
      } catch (err) {
        showError(err);
      }
    } else {
      getPrintDocument(payload);
    }
  };

  const previewDoc = (item) => {
    downloadFile({ ...item, isPreview: true });
  };

  return {
    getFile, getScans, getPrintDocument, getPreviewFile, checkFolder, downloadFile, previewDoc,
  };
};

export default useFolderFiles;
