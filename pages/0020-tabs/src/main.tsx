import { render } from 'solid-js/web';
import App from './App';
import './styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

render(() => <App />, rootElement);
