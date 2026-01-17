import { createMemo, For, JSX } from 'solid-js';
import styles from './Tabs.module.scss';

export type TabOption = {
  id: string;
  label: JSX.Element;
  content: JSX.Element;
};

type Props = {
  tabs: TabOption[];
  activeTab: string;
  onSelect: (id: string) => void;
};

export function Tabs(props: Props) {
  const activeTab = createMemo(() =>
    props.tabs.find((i) => i.id === props.activeTab),
  );
  return (
    <div class={styles.container}>
      <div class={styles.tabsRow}>
        <For each={props.tabs}>
          {(tab) => (
            <button
              type="button"
              class={styles.tab}
              classList={{ [styles.active]: tab.id === props.activeTab }}
              onClick={() => props.onSelect(tab.id)}
              disabled={tab.id === props.activeTab}
            >
              <div class={styles.tabView}>
                <div class={styles.tabInner}>{tab.label}</div>
              </div>
            </button>
          )}
        </For>
      </div>
      <div class={styles.tabsContent}>{activeTab()?.content}</div>
    </div>
  );
}
