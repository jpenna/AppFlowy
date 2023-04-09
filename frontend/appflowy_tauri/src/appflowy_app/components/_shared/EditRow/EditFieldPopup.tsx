import { useEffect, useRef, useState } from 'react';
import { TrashSvg } from '$app/components/_shared/svg/TrashSvg';
import { FieldTypeIcon } from '$app/components/_shared/EditRow/FieldTypeIcon';
import { FieldTypeName } from '$app/components/_shared/EditRow/FieldTypeName';
import { useTranslation } from 'react-i18next';
import { TypeOptionController } from '$app/stores/effects/database/field/type_option/type_option_controller';
import { Some } from 'ts-results';
import { FieldInfo } from '$app/stores/effects/database/field/field_controller';
import { MoreSvg } from '$app/components/_shared/svg/MoreSvg';
import { useAppSelector } from '$app/stores/store';
import { CellIdentifier } from '$app/stores/effects/database/cell/cell_bd_svc';
import { PopupWindow } from '$app/components/_shared/PopupWindow';

export const EditFieldPopup = ({
  top,
  left,
  cellIdentifier,
  viewId,
  onOutsideClick,
  fieldInfo,
  changeFieldTypeClick,
}: {
  top: number;
  left: number;
  cellIdentifier: CellIdentifier;
  viewId: string;
  onOutsideClick: () => void;
  fieldInfo: FieldInfo | undefined;
  changeFieldTypeClick: (buttonTop: number, buttonRight: number) => void;
}) => {
  const databaseStore = useAppSelector((state) => state.database);
  const { t } = useTranslation('');
  const changeTypeButtonRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    setName(databaseStore.fields[cellIdentifier.fieldId].title);
  }, [databaseStore, cellIdentifier]);

  const save = async () => {
    if (!fieldInfo) return;
    const controller = new TypeOptionController(viewId, Some(fieldInfo));
    await controller.initialize();
    await controller.setFieldName(name);
  };

  const onChangeFieldTypeClick = () => {
    if (!changeTypeButtonRef.current) return;
    const { top: buttonTop, right: buttonRight } = changeTypeButtonRef.current.getBoundingClientRect();
    changeFieldTypeClick(buttonTop, buttonRight);
  };

  // this is causing an error right now
  const onDeleteFieldClick = async () => {
    if (!fieldInfo) return;
    const controller = new TypeOptionController(viewId, Some(fieldInfo));
    await controller.initialize();
    await controller.deleteField();
    onOutsideClick();
  };

  return (
    <PopupWindow
      className={'px-2 py-2 text-xs'}
      onOutsideClick={async () => {
        await save();
        onOutsideClick();
      }}
      left={left}
      top={top}
    >
      <div className={'flex flex-col gap-2 p-2'}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => save()}
          className={'border-shades-3 flex-1 rounded border bg-main-selector px-2 py-2'}
        />

        <button
          onClick={() => onDeleteFieldClick()}
          className={
            'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-main-alert hover:bg-main-secondary'
          }
        >
          <i className={'h-5 w-5'}>
            <TrashSvg></TrashSvg>
          </i>
          <span>{t('grid.field.delete')}</span>
        </button>

        <div
          ref={changeTypeButtonRef}
          onClick={() => onChangeFieldTypeClick()}
          className={
            'relative flex cursor-pointer items-center justify-between rounded-lg text-black hover:bg-main-secondary'
          }
        >
          <button className={'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2'}>
            <i className={'h-5 w-5'}>
              <FieldTypeIcon fieldType={cellIdentifier.fieldType}></FieldTypeIcon>
            </i>
            <span>
              <FieldTypeName fieldType={cellIdentifier.fieldType}></FieldTypeName>
            </span>
          </button>
          <i className={'h-5 w-5'}>
            <MoreSvg></MoreSvg>
          </i>
        </div>
      </div>
    </PopupWindow>
  );
};
