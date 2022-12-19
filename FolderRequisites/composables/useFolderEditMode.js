import { computed, ref } from 'vue';

const useFolderEditMode = ({ addMultipleDoc }) => {
  const addedItemsEditMode = ref('');

  const changeEditMode = (mode) => {
    addedItemsEditMode.value = mode;
  };

  const optionMenu = [
    {
      value: 'Порядок',
      icon: 'IconChangeOrder',
      onClick: () => changeEditMode('order'),
    },
    {
      value: 'Отображение',
      icon: 'IconList',
      onClick: () => changeEditMode('display'),
    },
    {
      value: 'Состав  ',
      icon: 'IconListCheckMark',
      onClick: () => changeEditMode('composition'),
    },
    {
      value: 'Добавить документ',
      icon: 'IconAddItem',
      color: 'blue',
      onClick: addMultipleDoc,
    },
  ];

  const optionMenuItems = computed(() => (
    addedItemsEditMode.value === '' ? optionMenu : []));

  return { addedItemsEditMode, changeEditMode, optionMenuItems };
};

export default useFolderEditMode;
