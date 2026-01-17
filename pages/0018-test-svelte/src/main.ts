import { mount } from 'svelte';
import App from './App.svelte';
import './styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

mount(App, { target: rootElement });
