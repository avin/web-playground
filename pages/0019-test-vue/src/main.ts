import { createApp } from 'vue';
import App from './App.vue';
import './styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createApp(App).mount(rootElement);
