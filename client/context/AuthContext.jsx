import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //check if user is authenticated and if so, set the user data and connect to socket
    const checkAuth = async () => {
        try{
            const { data } = await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //login function to authenticate user and socket connection
    const login = async (state,credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setToken(data.token);
                localStorage.setItem('token', data.token);
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.token; // Set the token in axios headers
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    //logout function to clear user data and disconnect socket
    const logout = async () => {
        localStorage.removeItem('token');
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token'] = null; // Clear the token in axios headers
        toast.success("Logged out successfully");
        socket.disconnect();
    };

    //Update user function to update userProfile update and emit socket event
    const updateProfile = async (userData) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', userData);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            } 
        } catch (error) {
            toast.error(error.message);
        }
    };

    //connect socket function to handle connection and online users updates
    const connectSocket = (userData) => {
        if(!userData || socket?.conncted) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect(()=>{
        if(token){
            // Set the token in axios headers
            axios.defaults.headers.common['token'] = token;
        }
        checkAuth();
    },[])

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
