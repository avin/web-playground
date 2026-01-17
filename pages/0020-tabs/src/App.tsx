import { TabOption, Tabs } from './components/Tabs/Tabs.tsx';
import { createSignal } from 'solid-js';

export default function App() {
  const [activeTab, setActiveTab] = createSignal('second');

  const tabOptions: TabOption[] = [
    {
      id: 'first',
      label: 'First',
      content: 'First content',
    },
    {
      id: 'second',
      label: 'Second',
      content: 'Second content',
    },
    {
      id: 'third',
      label: 'Third',
      content: 'Third content',
    },
    {
      id: 'fourth',
      label: 'Fourth',
      content: 'Fourth content',
    },
    {
      id: 'fifth',
      label: 'Fifth',
      content: 'Fifth content',
    },
    {
      id: 'sixth',
      label: 'Sixth',
      content: 'Sixth content',
    },
  ] as const;

  return (
    <div class="p-4">
      <h1 class="font-bold mb-4">Chrome like tabs</h1>

      <Tabs
        tabs={tabOptions}
        activeTab={activeTab()}
        onSelect={(id: string) => setActiveTab(id)}
      />
    </div>
  );
}
