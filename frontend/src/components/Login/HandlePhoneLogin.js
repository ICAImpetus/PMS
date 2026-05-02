import { login } from '../../Phone/PhoneUtils/LoginMethod'
import toast from 'react-hot-toast';

export const handlePhoneLogin = async (phoneUsername, phonePassword) => {

  try {
    const data = await login(phoneUsername, phonePassword);

    if (data.message === 'wrong login info') {
      toast.error('Incorrect username or password');
      return { success: false, message: 'Incorrect username or password' };
    }

    localStorage.setItem('token', JSON.stringify(data));
    toast.success('Login successful');
    console.log('phone login data',data);
    return { success: true, data };
  } catch (err) {
    toast.error('Login failed. Please try again.');
    return { success: false, error: err.message };
  }

};
