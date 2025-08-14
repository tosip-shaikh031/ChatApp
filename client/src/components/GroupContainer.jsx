import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMesssageTime } from '../lib/utils';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const GroupContainer = () => {
  const { messages, selectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  const [input, setInput] = useState('');
  const scrollEnd = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select a valid image');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser?.isGroup) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser?.isGroup ? (
    <div className="h-full relative bg-[#1E2633]/80 overflow-scroll">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-[#334155]">
        <img src={assets.group_icon || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-[#f1f5f9]">{selectedUser.name}</p>
        <img src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === authUser._id || msg.senderId?._id === authUser._id;
          const sender = msg.senderId?._id ? msg.senderId : { ...msg.senderId, fullName: "You" };

          return (
            <div
              key={index}
              className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {/* Message bubble */}
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-[#475569] rounded-lg overflow-hidden"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] text-sm font-light rounded-lg break-all
            ${isOwn ? 'bg-green-700 text-white' : 'bg-[#2F3548] text-[#f1f5f9]'}`}
                >
                  {msg.text}
                </p>
              )}

              {/* Avatar and info */}
              <div className="text-center text-xs">
                <img
                  src={msg.senderId?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
                <p className="text-[#94a3b8]">
                  {msg.senderId?.fullName || 'Member'}
                </p>
                <p className="text-[#64748b]">
                  {formatMesssageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3">
        <div className="flex flex-1 items-center bg-[#1e293b] px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 rounded-lg outline-none placeholder-[#94a3b8] bg-transparent text-white"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-[#94a3b8] bg-[#0f172a] max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-[#f1f5f9]">Start chatting in a group</p>
    </div>
  );
};

export default GroupContainer;

