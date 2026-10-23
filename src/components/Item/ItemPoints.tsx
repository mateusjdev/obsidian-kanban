import { Menu } from 'obsidian';
import { useContext } from 'preact/compat';
import { StateManager } from 'src/StateManager';
import { useNestedEntityPath } from 'src/dnd/components/Droppable';
import { Path } from 'src/dnd/types';
import { BoardModifiers } from 'src/helpers/boardModifiers';
import { t } from 'src/lang/helpers';
import {
  PLANNING_POKER_VALUES,
  TSHIRT_VALUES,
  formatPointDisplay,
  setPointsInTitleRaw,
} from 'src/parsers/helpers/points';

import { Icon } from '../Icon/Icon';
import { KanbanContext } from '../context';
import { c } from '../helpers';
import { Item } from '../types';
import { CustomPointsModal } from './CustomPointsModal';

export interface ShowPointsMenuParams {
  e: MouseEvent;
  stateManager: StateManager;
  boardModifiers: BoardModifiers;
  item: Item;
  path: Path;
}

export function showPointsMenu({
  e,
  stateManager,
  boardModifiers,
  item,
  path,
}: ShowPointsMenuParams) {
  const currentPoints = item.data.metadata.points;
  const coordinates = { x: e.clientX, y: e.clientY };
  const menu = new Menu();

  // Planning Poker values
  PLANNING_POKER_VALUES.forEach((val) => {
    menu.addItem((i) => {
      i.setTitle(`${val} ${val === '?' ? '' : t('pts')}`.trim())
        .setChecked(currentPoints === val)
        .onClick(() => {
          const newTitleRaw = setPointsInTitleRaw(item.data.titleRaw, val);
          boardModifiers.updateItem(path, stateManager.updateItemContent(item, newTitleRaw));
        });
    });
  });

  menu.addSeparator();

  // T-Shirt sizes submenu
  menu.addItem((itemEl) => {
    const submenu = (itemEl as any)
      .setTitle(t('T-shirt sizes'))
      .setIcon('lucide-tag')
      .setSubmenu();

    TSHIRT_VALUES.forEach((val) => {
      submenu.addItem((i: any) => {
        i.setTitle(val)
          .setChecked(currentPoints === val)
          .onClick(() => {
            const newTitleRaw = setPointsInTitleRaw(item.data.titleRaw, val);
            boardModifiers.updateItem(path, stateManager.updateItemContent(item, newTitleRaw));
          });
      });
    });
  });

  // Custom value modal
  menu.addItem((i) => {
    i.setIcon('lucide-edit')
      .setTitle(t('Custom points...'))
      .onClick(() => {
        new CustomPointsModal(stateManager.app, currentPoints ?? '', (customVal) => {
          if (customVal) {
            const newTitleRaw = setPointsInTitleRaw(item.data.titleRaw, customVal);
            boardModifiers.updateItem(path, stateManager.updateItemContent(item, newTitleRaw));
          }
        }).open();
      });
  });

  // Clear / remove points
  if (currentPoints !== undefined && currentPoints !== '') {
    menu.addSeparator();
    menu.addItem((i) => {
      i.setIcon('lucide-x')
        .setTitle(t('Remove points'))
        .onClick(() => {
          const newTitleRaw = setPointsInTitleRaw(item.data.titleRaw, undefined);
          boardModifiers.updateItem(path, stateManager.updateItemContent(item, newTitleRaw));
        });
    });
  }

  menu.showAtPosition(coordinates);
}

export function ItemPoints({ item }: { item: Item }) {
  const { stateManager, boardModifiers } = useContext(KanbanContext);
  const path = useNestedEntityPath();
  const shouldMovePoints = stateManager.useSetting('move-points') ?? true;
  const points = item.data.metadata.points;

  if (!points || !shouldMovePoints) return null;

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showPointsMenu({
      e,
      stateManager,
      boardModifiers,
      item,
      path,
    });
  };

  return (
    <span
      className={c('item-points-badge')}
      onClick={onClick}
      title={t('Edit points')}
      aria-label={t('Edit points')}
    >
      <span className={c('item-points-badge-icon')}>
        <Icon name="lucide-circle-dot" />
      </span>
      <span className={c('item-points-badge-value')}>{formatPointDisplay(points)}</span>
    </span>
  );
}
