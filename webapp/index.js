import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './components/App'
import appi from './reducers/reducers'




let store = createStore(appi);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
