import { useDispatch, useSelector } from 'react-redux';
import { setAgentId, setUserData, clearUser } from '../slices/userSlice';

export const useUserRedux = () => {
  const dispatch = useDispatch();
  const { agentId, userData, loading, error } = useSelector((state) => state.user);

  // Helper function to set agentId with localStorage persistence
  const setAgentIdWithPersistence = (id) => {
    localStorage.setItem('agentId', id);
    dispatch(setAgentId(id));
  };

  // Helper function to set user data with localStorage persistence
  const setUserDataWithPersistence = (user) => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('agentId', user.id || '');
    }
    dispatch(setUserData(user));
  };

  // Helper function to clear user data from localStorage
  const clearUserWithPersistence = () => {
    localStorage.removeItem('agentId');
    localStorage.removeItem('userData');
    dispatch(clearUser());
  };

  // Get agentId directly from localStorage (useful for initial app load)
  const getStoredAgentId = () => {
    return localStorage.getItem('agentId') || null;
  };

  // Get user data directly from localStorage (useful for initial app load)
  const getStoredUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  };

  return {
    // State
    agentId,
    userData,
    loading,
    error,

    // Actions
    setAgentId: setAgentIdWithPersistence,
    setUserData: setUserDataWithPersistence,
    clearUser: clearUserWithPersistence,

    // Getters
    getStoredAgentId,
    getStoredUserData,
  };
};

export default useUserRedux;
