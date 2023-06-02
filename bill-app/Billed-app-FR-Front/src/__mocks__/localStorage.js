export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return JSON.stringify(store[key])
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
     // store = {}
     store = mockedBills;
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()