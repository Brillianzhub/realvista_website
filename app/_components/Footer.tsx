"use client"
import React from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  X,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { FaWhatsapp } from "react-icons/fa";
import { LuTwitter } from "react-icons/lu";
import Image from 'next/image';

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/share/1FaQPGrXEN/' },
    { icon: Instagram, href: 'https://www.instagram.com/realvista_ng?igsh=MXVtazk2aWV5Mzl1ZA==' },
    { icon: LuTwitter, href: 'https://x.com/Realvista_NG?t=4wyone_-O3TiMPEgw9Gw-w&s=09' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/realvista-ng/' },
    {
      icon: FaWhatsapp,
      href: "https://wa.me/2347043065222",
    },
  ];

  const companyLinks = [
    {
      name: "Agents", link: "/agents"
    },
    {
      name: "Contact Us", link: "/contact"
    },
    {
      name: "Privacy Policy", link: "/privacy-policy"
    },
    {
      name: "Terms of use", link: "/terms"
    }
  ];

  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        {/* App Description Column */}
        <div className="space-y-6">
          <Link href="/" className='cursor-pointer '>
            <Image src="/logo.webp" width={200} height={30} alt="logo" className='md:ml-[-1.3rem]' />
          </Link>
          <p className="text-white/80">
            Realvista is user-friendly and offers features like onboarding tutorials, simple tools for tracking finances, and guidance for first-time buyers and investors.
          </p>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                target='_blank'
                href={social.href}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              >
                <social.icon className="text-white" size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Company Links Column */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Company</h3>
          <ul className="space-y-4">
            {companyLinks.map((link, index) => (
              <Link
                key={index}
                href={link.link}
                className="flex items-center group text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight
                  size={16}
                  className="mr-2 text-white/50 group-hover:translate-x-1 transition-transform"
                />
                {link.name}
              </Link>

            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Contact</h3>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3">
              <MapPin size={20} className="text-white/50" />
              <span>No 7 MCC Road Owerri</span>
            </li>
            <li className="flex items-center space-x-3">
              <MapPin size={20} className="text-white/50" />
              <span>Imo State, Nigeria.</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={20} className="text-white/50" />
              <span>contact@realvistaproperties.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={20} className="text-white/50" />
              <span>+2347043065222
              </span>
            </li>
          </ul>
        </div>

        {/* QR Code and Download Column */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg">
              <img src="/qrcode.jpeg" alt="code" />
            </div>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=com.brillianzhub.realvista"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer justify-center gap-3 bg-[#FB902D] text-white font-medium py-2 px-10 rounded-full transition-colors shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M325.3 234.3L104.1 28.4C95.3 20.2 84.3 16 72.4 16a40 40 0 0 0-15.4 3C44.4 24.1 32 40.3 32 58.5v395c0 18.2 12.4 34.4 25 39.5a40 40 0 0 0 15.4 3c11.9 0 22.9-4.2 31.7-12.4l221.2-205.9-10-9.9z" fill="white" />
              <path d="M361.7 271.5 325.3 256 104.1 483.6a39.3 39.3 0 0 0 22.3 9.6c5.2 0 10.4-1 15.4-3l220-103.1c15.6-7.3 25.2-22.7 25.2-39.5 0-16.6-9.1-31.8-25.3-39.1z" fill="white" />
              <path d="M447.6 228.5 361.7 188.3l-36.4 35.9 36.4 36.1 85.9-40.3c10.4-4.8 10.4-17.7 0-22.5z" fill="white" />
              <path d="M361.7 240.2 72.4 16A39.9 39.9 0 0 0 66 15.2a37.3 37.3 0 0 0-13 2.8l254 247.9-254 248a39.3 39.3 0 0 0 13 2.8c2.2 0 4.3-.3 6.4-.8l289.3-224.2c10.4-8.1 10.4-24.1 0-32.3z" fill="white" />
            </svg>

            <div className="flex flex-col items-start">
              <span className="text-xs">Download on</span>
              <span className="text-sm font-semibold">Google Play</span>
            </div>
          </a>
        </div>
      </div>

      {/* Copyright and Additional Links */}
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
        <p className="text-white/70 text-sm">
          © Realvista 2025. All rights reserved.
        </p>
        <div className="flex space-x-4 text-sm text-white/70">
          <a href="https://www.realvistaproperties.com/privacy-policy" className="hover:text-white">Privacy Policy</a>
          <a href="https://www.realvistaproperties.com/terms" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}