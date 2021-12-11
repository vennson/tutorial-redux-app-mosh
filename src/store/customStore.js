import reducer from './reducer'

function createStore(reducer) {
  let state
  let listeners = []

  function dispatch(action) {
    state = reducer(state, action)
  }

  function subscribe(listener) {
    listeners.push(listener)

    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  function getState() {
    return state
  }

  return {
    dispatch,
    subscribe,
    getState
  }
}

export default createStore(reducer)