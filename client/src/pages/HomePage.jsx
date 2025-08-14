import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSlidebar from '../components/RightSlidebar';
import GroupContainer from '../components/GroupContainer';
import { ChatContext } from '../../context/ChatContext';

const Home = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl h-[100%] overflow-hidden grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar />
        {selectedUser && (
          selectedUser.isGroup ? <GroupContainer /> : <ChatContainer />
        )}
        <RightSlidebar />
      </div>
    </div>
  );
};

export default Home;
