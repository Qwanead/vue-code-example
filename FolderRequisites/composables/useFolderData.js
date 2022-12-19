import { reactive } from 'vue';

const useFolderData = ({ emit }, { changeEditMode }) => {
  const folder = reactive({
    uid: '',
    name: '',
    date: '',
    bookNumber: '',
    tomeNumber: '',
    documents: [],
    printForms: [],
    messages: [],
    currentStatus: {
      status: 1,
    },
  });

  const updateInput = ({ name, value }) => {
    if (name === 'currentStatus') {
      folder[name].status = value;
    } else {
      folder[name] = value;
    }
    emit('updateFolder', folder);
  };

  const updateDocuments = (documents) => {
    updateInput({ name: 'documents', value: documents });
  };

  const errorInput = ({ name, value }) => {
    if (name === 'currentStatus') {
      folder[name].status = value;
    } else {
      folder[name] = value;
    }
    emit('error', folder);
    emit('updateFolder', folder);
  };

  const setFolder = (data) => {
    const copyData = JSON.parse(JSON.stringify(data));
    Object.keys(copyData).forEach((key) => {
      folder[key] = copyData[key];
    });
  };

  const updateAndSaveFolder = () => {
    emit('updateFolder', folder);
    emit('saveFolder');
  };

  const saveFolder = () => {
    changeEditMode('');
    updateAndSaveFolder();
  };

  const addDocuments = (documents) => {
    const newDocs = documents.map(({ uid, uname }) => ({
      uid,
      uname,
      print: true,
    }))
      .filter((newDoc) => folder.documents.every((doc) => doc.uid !== newDoc.uid));
    const newValue = [...folder.documents, ...newDocs];

    updateDocuments(newValue);
    updateAndSaveFolder();
  };

  const saveSingleDoc = ({ uid, uname }) => {
    const targetSingleDoc = folder.documents
      .find((item) => item.uname === uname);
    targetSingleDoc.uid = uid;

    updateAndSaveFolder();
  };

  return {
    folder,
    updateDocuments,
    updateInput,
    errorInput,
    setFolder,
    updateAndSaveFolder,
    saveFolder,
    addDocuments,
    saveSingleDoc,
  };
};

export default useFolderData;
