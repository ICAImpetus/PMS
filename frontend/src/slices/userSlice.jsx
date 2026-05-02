import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  try {
    const storedUser = localStorage.getItem('userState');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Failed to load user state from localStorage', error);
  }
  return {
    agentId: null,
    userId: null,
    userData: null,
    loading: false,
    error: null
  };
};

const initialState = loadInitialState();

const saveToLocalStorage = (state) => {
  try {
    const { loading, error, ...stateToPersist } = state;
    localStorage.setItem('userState', JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Error saving user state to localStorage', error);
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState, // Added missing initialState
  reducers: {
    setAgentId: (state, action) => {
      state.agentId = action.payload;
      saveToLocalStorage(state);
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
      saveToLocalStorage(state);
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.agentId = action.payload?.id || action.payload?.agentId || null;
      state.userId = action.payload?.id || null;
      saveToLocalStorage({
        ...state,
        agentId: action.payload?.id || action.payload?.agentId || null,
        userId: action.payload?.id || null
      });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.agentId = null;
      state.userId = null;
      state.userData = null;
      state.error = null;
      localStorage.removeItem('userState');
    }
  }
}); // Added missing closing bracket

export const {
  setAgentId,
  setUserId,
  setUserData,
  setLoading,
  setError,
  clearUser
} = userSlice.actions;

export default userSlice.reducer;