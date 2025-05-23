import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6"; // Updated to Fa6 icons
import logo from "../../../assets/logo.png"; // Adjust the path as necessary

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-orange-100 via-orange-50 to-orange-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Logo Section */}
          <div className="space-y-4">
            <img src={logo} alt="Logo" className="ml-16 h-20 w-20 inline-block" />
            <p className="text-orange-600 text-sm">
              Your trusted partner for all things <br/> relates to culinary.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h5 className="text-lg font-semibold text-orange-600 mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/premium", label: "Premium" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-orange-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h5 className="text-lg font-semibold text-orange-600 mb-4">
              Follow Us
            </h5>
            <div className="flex justify-center md:justify-start gap-4">
              {[
                { href: "https://instagram.com", Icon: FaInstagram },
                { href: "https://facebook.com", Icon: FaFacebook },
                { href: "https://twitter.com", Icon: FaXTwitter },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-500 transition-colors"
                  aria-label={`Follow us on ${social.href.split(".")[1]}`}
                >
                  <social.Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-6 border-t border-orange-300 text-center">
          <p className="text-orange-500 text-sm">
            © {new Date().getFullYear()} ChefConnect. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;