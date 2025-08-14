import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import assets from '../assets/assets';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-md border bg-[#1e293b] border-[#334155] text-white p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            required
            className="p-2 bg-transparent border border-gray-600 rounded-md focus:outline-none placeholder-gray-400"
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 bg-transparent border border-gray-600 rounded-md focus:outline-none placeholder-gray-400"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 bg-transparent border border-gray-600 rounded-md focus:outline-none placeholder-gray-400"
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            value={bio}
            placeholder="Bio"
            className="p-2 bg-transparent border border-gray-600 rounded-md focus:outline-none placeholder-gray-400"
          />
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-md"
        >
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" />
          <p>I agree to the Terms of Service and Privacy Policy.</p>
        </div>

        <div className="text-sm text-gray-400">
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="text-violet-500 cursor-pointer font-medium"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create an account?{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="text-violet-500 cursor-pointer font-medium"
              >
                Click here
              </span>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
