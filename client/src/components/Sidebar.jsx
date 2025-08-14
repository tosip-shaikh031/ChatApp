import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { GroupContext } from '../../context/GroupContext';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const {
    groups,
    fetchGroups,
    createGroup,
    setSelectedGroup
  } = useContext(GroupContext);

  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const filteredUsers = input
    ? users.filter((user) =>
      user.fullName.toLowerCase().includes(input.toLowerCase())
    )
    : users;

  useEffect(() => {
    getUsers();
    fetchGroups();
  }, [onlineUsers]);

  const handleCreateGroup = async () => {
    if (groupName && selectedGroupUsers.length >= 2) {
      try {
        const newGroup = await createGroup({
          name: groupName,
          members: selectedGroupUsers,
        });

        setGroupName('');
        setSelectedGroupUsers([]);
        setIsCreatingGroup(false);
        setSelectedUser(newGroup);
        setSelectedGroup(newGroup);
      } catch (error) {
        console.error('Group creation failed:', error);
      }
    }
  };

  return (
    <div className={`bg-[#0f172a] h-full p-5 rounded-r-xl overflow-y-scroll text-[#f1f5f9] ${selectedUser ? 'max-md:hidden' : ''}`}>
      {/* Header */}
      <div className='pb-5'>
        <div className='flex items-center justify-between'>
          <img src={assets.logo} alt='logo' className='max-w-40' />
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt='Menu' className='max-h-5 cursor-pointer' />
            <div className='absolute top-full right-0 z-20 w-32 p-5 bg-[#1e293b] text-[#f1f5f9] hidden rounded-md border border-[#334155] group-hover:block'>
              <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
              <hr className='my-2 border-t border-[#475569]' />
              <p onClick={logout} className='cursor-pointer text-sm'>Logout</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className='bg-[#1e293b] rounded-full mt-5 py-3 px-4 flex items-center gap-2'>
          <img src={assets.search_icon} alt='Search' className='w-3' />
          <input
            onChange={(e) => setInput(e.target.value)}
            type='text'
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#94a3b8] flex-1'
            placeholder='Search User...'
          />
        </div>

        {/* Create Group Button */}
        <button
          onClick={() => setIsCreatingGroup(true)}
          className='mt-5 bg-violet-600 hover:bg-violet-700 text-white text-sm py-2 px-4 rounded-full'
        >
          + Create Group
        </button>
      </div>

      {/* Group List */}
      {groups.length > 0 && (
        <div className='mb-4'>
          <h3 className='text-sm text-[#94a3b8] mb-2'>Groups</h3>
          {groups.map((group) => (
            <div
              key={group._id}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === group._id ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/50'}`}
              onClick={() => {
                const groupWithFlag = { ...group, isGroup: true };
                setSelectedUser(groupWithFlag);
                setSelectedGroup(groupWithFlag);
                setUnseenMessages((prev) => ({ ...prev, [group._id]: 0 })); // Reset unseen count
              }}
            >
              <img
                src={assets.group_icon}
                alt='Group'
                className='w-[35px] h-[35px] rounded-full border border-[#334155]'
              />
              <p className='text-white'>{group.name}</p>

              {/* Unseen badge */}
              {unseenMessages[group._id] > 0 && (
                <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-[#3b82f6]/60'>
                  {unseenMessages[group._id]}
                </p>
              )}
            </div>
          ))}


        </div>
      )}


      {/* User List */}
      <h3 className='text-sm text-[#94a3b8] mb-2'>Contacts</h3>
      <div className='flex flex-col'>
        {filteredUsers.map((user) => (
          <div
            onClick={() => {
              setSelectedUser({ ...user, isGroup: false });  // 🟩 FIXED LINE
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/50'}`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=''
              className='w-[35px] aspect-[1/1] rounded-full border border-[#334155]'
            />
            <div className='flex flex-col leading-5'>
              <p className='text-[#f1f5f9]'>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className='text-green-400 text-xs'>Online</span>
              ) : (
                <span className='text-[#64748b] text-xs'>Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-[#3b82f6]/60'>
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Group Creation Modal */}
      {isCreatingGroup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#1e293b] p-6 rounded-lg w-96 text-white'>
            <h2 className='text-lg mb-4'>Create Group</h2>
            <input
              type='text'
              placeholder='Group Name'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className='w-full mb-3 p-2 rounded bg-[#0f172a] border border-gray-600 outline-none'
            />
            <div className='max-h-40 overflow-y-scroll space-y-2 mb-4'>
              {users.map((user) => (
                <label key={user._id} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={selectedGroupUsers.includes(user._id)}
                    onChange={() => {
                      if (selectedGroupUsers.includes(user._id)) {
                        setSelectedGroupUsers((prev) => prev.filter((id) => id !== user._id));
                      } else {
                        setSelectedGroupUsers((prev) => [...prev, user._id]);
                      }
                    }}
                  />
                  <span>{user.fullName}</span>
                </label>
              ))}
            </div>
            <div className='flex justify-end gap-2'>
              <button onClick={() => setIsCreatingGroup(false)} className='text-gray-400'>Cancel</button>
              <button onClick={handleCreateGroup} className='bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded'>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;