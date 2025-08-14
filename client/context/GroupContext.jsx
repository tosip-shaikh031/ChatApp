import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { authUser } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // ✅ Fetch groups where user is a member
  const fetchGroups = async () => {
    try {
      const { data } = await axios.get('/api/group/my-groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error.message);
    }
  };

  // ✅ Create group
  const createGroup = async ({ name, members }) => {
    try {
      const { data } = await axios.post('/api/group/create', { name, members });
      setGroups((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Failed to create group:', error.message);
      throw error;
    }
  };

  // ✅ Rename group (admin only)
  const renameGroup = async (groupId, newName) => {
    try {
      const { data } = await axios.put(`/api/group/rename/${groupId}`, { newName });
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? { ...group, name: newName } : group))
      );
      return data;
    } catch (error) {
      console.error('Failed to rename group:', error.message);
    }
  };

  // ✅ Remove a member (admin only)
  const removeMember = async (groupId, memberId) => {
    try {
      const { data } = await axios.put(`/api/group/remove-member/${groupId}`, { memberId });
      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? data.group : g))
      );
      return data;
    } catch (error) {
      console.error('Failed to remove member:', error.message);
    }
  };

  // ✅ Transfer admin (admin only)
  const transferAdmin = async (groupId, newAdminId) => {
    try {
      const { data } = await axios.put(`/api/group/transfer-admin/${groupId}`, { newAdminId });
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? data.group : group))
      );
      return data;
    } catch (error) {
      console.error('Failed to transfer admin:', error.message);
    }
  };

  // ✅ Leave group
  const leaveGroup = async (groupId) => {
    try {
      const { data } = await axios.put(`/api/group/leave/${groupId}`);
      setGroups((prev) => prev.filter((group) => group._id !== groupId));
      if (selectedGroup && selectedGroup._id === groupId) {
        setSelectedGroup(null);
      }
      return data;
    } catch (error) {
      console.error('Failed to leave group:', error.message);
    }
  };

  // ✅ Delete group (admin only)
  const deleteGroup = async (groupId) => {
    try {
      await axios.delete(`/api/group/${groupId}`);
      setGroups((prev) => prev.filter((group) => group._id !== groupId));
      if (selectedGroup && selectedGroup._id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Failed to delete group:', error.message);
    }
  };

  // ✅ Add new members to group
  const addMembers = async (groupId, newMembers) => {
    try {
      const { data } = await axios.put(`/api/group/add-members/${groupId}`, { newMembers });
      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? data.group : g))
      );
      return data;
    } catch (error) {
      console.error('Failed to add members:', error.message);
      throw error;
    }
  };


  useEffect(() => {
    if (authUser) {
      fetchGroups();
    }
  }, [authUser]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        selectedGroup,
        setSelectedGroup,
        createGroup,
        fetchGroups,
        renameGroup,
        removeMember,
        transferAdmin,
        leaveGroup,
        deleteGroup,
        addMembers
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
