const Reducer = (state, payload) => {
  let userObj =  window.lodash.isEmpty(window.user) ? {} : window.user;
  switch (payload.type) {
    case "SET_STATE":
      return {
        ...state, 
        user: typeof payload.user == "undefined" ? userObj : payload.user,
      };

    default:
      return state;
  }
};
export default Reducer;
