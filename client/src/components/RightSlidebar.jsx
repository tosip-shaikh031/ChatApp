import React, { useEffect, useState, useContext } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { GroupContext } from '../../context/GroupContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { authUser, logout } = useContext(AuthContext);
  const {
    selectedGroup,
    removeMember,
    fetchGroups,
    addMembers
  } = useContext(GroupContext);

  const [msgImages, setMsgImages] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  const isAdmin = selectedGroup?.admin === authUser._id;

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  const handleRemoveMember = async (memberId) => {
    if (memberId === authUser._id) return toast.error("You can't remove yourself.");
    try {
      await removeMember(selectedGroup._id, memberId);
      fetchGroups();
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await axios.get("/api/messages/users");
      const allUsers = res.data.users;
      const memberIds = selectedGroup.members.map((m) => m._id);
      const nonMembers = allUsers.filter((u) => !memberIds.includes(u._id));
      setAvailableUsers(nonMembers);
      setShowAddModal(true);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedToAdd.length === 0) return toast.error("No members selected");

    try {
      await addMembers(selectedGroup._id, selectedToAdd); // ✅ use context function
      toast.success("Members added");
      setShowAddModal(false);
      setSelectedToAdd([]);
      fetchGroups(); // refresh updated group
    } catch (err) {
      toast.error("Failed to add members");
    }
  };


  return selectedUser && (
    <div className={`bg-[#0f172a] text-[#f1f5f9] w-full h-full relative overflow-y-auto ${selectedUser ? 'max-md:hidden' : ''}`}>

      {/* Header */}
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img
          src={selectedUser?.profilePic || assets.group_icon || assets.avatar_icon}
          alt=""
          className='w-20 aspect-square rounded-full border border-[#334155]'
        />
        <h1 className='px-10 text-xl font-medium'>
          {selectedUser?.isGroup ? selectedUser.name : selectedUser.fullName}
        </h1>
        {!selectedUser?.isGroup && (
          <p className='px-10 text-[#94a3b8]'>{selectedUser.bio}</p>
        )}
      </div>

      {/* Group Members */}
      {selectedUser?.isGroup && selectedGroup?.members?.length > 0 && (
        <>
          <hr className="border-[#334155] my-4 mx-6" />
          <div className='px-5'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm'>Group Members</p>
              {isAdmin && (
                <button
                  onClick={fetchAvailableUsers}
                  className='bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-4xl'>
                  + Add
                </button>
              )}
            </div>
            <div className='flex flex-col gap-2 max-h-52 overflow-y-auto'>
              {selectedGroup.members.map((member) => (
                <div key={member._id} className='flex items-center justify-between bg-[#1e293b] p-2 rounded'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={member.profilePic || assets.avatar_icon}
                      alt=""
                      className='w-8 h-8 rounded-full border border-[#475569]'
                    />
                    <div>
                      <p className='text-sm'>{member.fullName}</p>
                      {selectedGroup.admin === member._id && (
                        <p className='text-xs text-green-400'>Admin</p>
                      )}
                    </div>
                  </div>
                  {isAdmin && member._id !== selectedGroup.admin && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className='text-xs font-medium px-2 py-1 rounded border border-red-500 bg-red-500 hover:text-white'>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Media Section */}
      {msgImages.length > 0 && (
        <>
          <hr className="border-[#334155] my-4 mx-6" />
          <div className="px-5 text-xs">
            <p className="text-[#f1f5f9]">Media</p>
            <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-90">
              {msgImages.map((url, index) => (
                <div
                  key={index}
                  onClick={() => window.open(url)}
                  className='cursor-pointer rounded'>
                  <img src={url} alt="" className='h-full rounded-md border border-[#475569]' />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
          <div className='bg-[#1e293b] p-6 rounded-lg w-96 text-white max-h-[80vh] overflow-y-auto'>
            <h2 className='text-lg mb-4'>Add Members</h2>
            {availableUsers.length === 0 ? (
              <p className='text-sm text-gray-400'>No users available</p>
            ) : (
              availableUsers.map((user) => (
                <label key={user._id} className='flex items-center gap-3 py-1'>
                  <input
                    type='checkbox'
                    checked={selectedToAdd.includes(user._id)}
                    onChange={() => {
                      setSelectedToAdd((prev) =>
                        prev.includes(user._id)
                          ? prev.filter((id) => id !== user._id)
                          : [...prev, user._id]
                      );
                    }}
                  />
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt=""
                    className='w-6 h-6 rounded-full'
                  />
                  <span>{user.fullName}</span>
                </label>
              ))
            )}
            <div className='flex justify-end gap-2 mt-4'>
              <button onClick={() => setShowAddModal(false)} className='text-gray-400'>Cancel</button>
              <button onClick={handleConfirmAdd} className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white'>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
