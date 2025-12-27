import React from "react";
import { logoTitle } from "../assets/assets.js";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img
            src={logoTitle}
            alt="logoTitle"
            className="w-50 mb-5 hover:opacity-80"
          />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

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
          Copyright 2025 @ Prescripto.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
