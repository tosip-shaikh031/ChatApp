import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-3xl bg-[#1e293b] text-white rounded-xl shadow-md p-6 flex max-md:flex-col items-center gap-10">

        {/* Left: Profile Image Preview */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full border-2 border-violet-500"
          />
          <label htmlFor="avatar" className="text-sm text-violet-300 hover:text-violet-400 cursor-pointer">
            Change Profile Picture
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
          </label>
        </div>

        {/* Right: Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
          <h2 className="text-2xl font-semibold">Edit Profile</h2>

          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-gray-300">Full Name</label>
            <input
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Enter your name"
              className="p-2 bg-[#0f172a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Bio Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="bio" className="text-sm text-gray-300">Bio</label>
            <textarea
              id="bio"
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              required
              placeholder="Write something about yourself..."
              className="p-2 bg-[#0f172a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Save Changes
          </button>
        </form>

      </div>
    </div>
  );
};

export default ProfilePage;
