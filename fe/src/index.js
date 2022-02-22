import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
