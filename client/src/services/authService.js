import  axios from 'axios';

//Defining the base URL of the backend 
const API_URL = 'http://localhost:5000/api/users/';

//---Registration Service-----
const register = async(userData) => {
    const response = await axios.post(API_URL + 'register' , userData);

  // Note: We don't save the token here, as the user still needs to log in
  // or we'd need to modify the backend register endpoint to return a token.
  // For simplicity, we'll assume a separate login after registration.

  if(response.data){
    return response.data;
  }
};



//------Login Service----------
const login = async(userData) =>{
    const response = await axios.post(API_URL + 'login', userData);

    //Axios places the response data in the '.data' property
    if(response.data) {
        // save the token and user data to be used by the AuthContext
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
    }

    //Return the user data and token
    return response.data;
};

//-----Logout Service------------
const logout = () => {
    //Clearing ocalStorage is  handled by the AuthContext reducer, 
    //but we export the function for component use.

    localStorage.removeItem('user');
    localStorage.removeItem('token');
};


//Export all services as one object
const authService = {
    register,
    logout,
    login,
};

export default authService;