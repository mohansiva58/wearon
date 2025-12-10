import React from 'react';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const footerLinks = {
  Shop: ['New Arrivals', 'Bestsellers', 'Sale', 'Collections', 'Gift Cards'],
  Help: ['Customer Service', 'Shipping & Returns', 'Size Guide', 'FAQs', 'Contact Us'],
  Company: ['About Us', 'Sustainability', 'Careers', 'Press', 'Stores'],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/rofero.in?igsh=N3N5enl6bW5pMG9z' },
  { icon: Twitter, href: 'https://youtube.com/@roferoclothing?si=GR3PtaK2WTX3Dsj9' },
  { icon: Facebook, href: 'https://www.instagram.com/rofero.in?igsh=N3N5enl6bW5pMG9z' },
  { icon: Youtube, href: 'https://youtube.com/@roferoclothing?si=GR3PtaK2WTX3Dsj9' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
             
              <span className="text-xl font-semibold tracking-tight">ROFERO</span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6 max-w-sm">
              Redefining fashion with purpose. Sustainable, ethical, 
              and designed for the modern individual.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-black mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-neutral-500 text-sm hover:text-black transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-400 text-sm">
            © 2025 ROFERO. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-neutral-400 text-sm hover:text-black transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 text-sm hover:text-black transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 text-sm hover:text-black transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
