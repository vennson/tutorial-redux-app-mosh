import { createSlice } from '@reduxjs/toolkit';
import {  apiCallBegan } from './api';

let lastId = 0

const slice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    userAdded: (state, action) => {
      state.push({
        id: ++lastId,
        name: action.payload.name,
      });
    }
  }
})

export const { userAdded } = slice.actions
export default slice.reducer;


// Action creators
const url = '/users';
export const addUser = user => apiCallBegan({
  url,
  method: 'post',
  data: user,
  onSuccess: userAdded.type,
})
