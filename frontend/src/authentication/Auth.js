// import UserContextHook from "../../contexts/UserContextProvider";
import { UserContextHook } from "../contexts/UserContexts";

const CheckAuthentication = () => {
  const { currentUser } = UserContextHook();
  
  // Determine isLoggedIn based on currentUser.token existence
  const isLoggedIn = !!currentUser && !!currentUser.token;

  return isLoggedIn;
};

export default CheckAuthentication;
