import React from "react";
import { logoTitle } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="md:mx-10">
      {/* Updated grid from 3 columns to 2 columns */}
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img
            src={logoTitle}
            alt="HuddleNode Logo"
            className="w-44 mb-5 hover:opacity-80 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            HuddleNode is a modern community forum empowering users to engage in
            structured discussions. We prioritize privacy with our unique
            identity shielding, providing a safe space for every voice.
          </p>
        </div>

        {/* Keeping only GET IN TOUCH */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91-72086-13298</li>
            <li>maazshaikh2079@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr className="border-none" />
        <p className="py-5 text-sm text-center border-t border-t-zinc-400">
          Copyright 2026 @ HuddleNode.vercel.app - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
