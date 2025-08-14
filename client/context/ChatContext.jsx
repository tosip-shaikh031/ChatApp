import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from 'react-hot-toast';


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);//list of users for left slidebar
    const [selectedUser, setSelectedUser] = useState(null);//used yo store id of user to whom we want to chat
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    //Function to get all user for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Function to get messages for selected user
    const getMessages = async (id = selectedUser._id) => {
        try {
            const endpoint = selectedUser?.isGroup ? `/api/group/messages/${id}` : `/api/messages/${id}`;
            const { data } = await axios.get(endpoint);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    //Function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const endpoint = selectedUser?.isGroup
                ? `/api/group/send/${selectedUser._id}`
                : `/api/messages/send/${selectedUser._id}`;

            const { data } = await axios.post(endpoint, messageData);
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    //Function to subscribe to messages for selected user (getting real time messages) 
    const subscribeToMessages = () => {
        if (!socket) return;
        socket.on("newMessage", handleDirectMessage);
        socket.on("newGroupMessage", handleGroupMessage);
    };

    // Reusable handler for both direct and group messages
    const handleDirectMessage = (newMessage) => {
        if (!selectedUser) return;

        const isCurrentChat =
            selectedUser._id === newMessage.senderId || selectedUser._id === newMessage.receiverId;

        if (isCurrentChat && !selectedUser?.isGroup) {
            newMessage.seen = true;
            setMessages((prev) => [...prev, newMessage]);

            // Mark as seen in DB
            if (newMessage._id) {
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
        } else {
            // Update unseen message count
            const key = newMessage.senderId;
            setUnseenMessages((prev) => ({
                ...prev,
                [key]: prev[key] ? prev[key] + 1 : 1,
            }));
        }
    };

    const handleGroupMessage = (newMessage) => {
        if (!selectedUser) return;

        const isCurrentGroupChat = selectedUser._id === newMessage.groupId;

        if (isCurrentGroupChat && selectedUser?.isGroup) {
            setMessages((prev) => [...prev, newMessage]);
        } else {
            // Update unseen message count
            const key = newMessage.groupId;
            setUnseenMessages((prev) => ({
                ...prev,
                [key]: prev[key] ? prev[key] + 1 : 1,
            }));
        }
    };


    //Function to unsubscribe from messages 
    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage", handleDirectMessage);
            socket.off("newGroupMessage", handleGroupMessage);
        }
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser])

    const value = {
        messages, users, selectedUser, getUsers,
        sendMessage, setMessages, getMessages,
        unseenMessages, setUnseenMessages, setSelectedUser
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}