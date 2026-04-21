import "./index.css";
// Import the axios interceptors
import './interceptors';
// Import auth debugging helpers
import './authDebug';

import React from "react";
import ReactDOM from "react-dom/client";
import {Toaster} from 'react-hot-toast';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import store from "./Redux/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-center"
          reverseOrder={false}
          containerStyle={{
            top: 20,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              maxWidth: '500px',
              fontSize: '14px',
              borderRadius: '8px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
            loading: {
              style: {
                background: '#6B7280',
                color: '#fff',
              },
            },
          }}
          limit={1}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
