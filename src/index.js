import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import Firebase, { FirebaseContext } from './components/Firebase';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from "./serviceWorker";

const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

