
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-betting-black border-t border-betting-light-gray py-8">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-betting-green text-xl font-bold flex items-center mb-4">
              <span className="text-betting-accent">Bet</span>Code<span className="text-xs text-muted-foreground ml-1">South Africa</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              South Africa's premier platform for sharing and selling sports betting codes. Trusted by thousands of bettors nationwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="text-muted-foreground hover:text-white transition-colors">
                  Browse Tickets
                </Link>
              </li>
              <li>
                <Link to="/sellers" className="text-muted-foreground hover:text-white transition-colors">
                  Top Sellers
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Connect With Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest betting insights and special offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-betting-light-gray border-0 text-white text-sm rounded-l-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-betting-green"
              />
              <button className="bg-betting-green hover:bg-betting-green-dark text-white text-sm font-medium px-3 py-2 rounded-r-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-betting-light-gray text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BetCode South Africa. All rights reserved.</p>
          <p className="mt-1">
            This site is intended for users 18 years and older. Please bet responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
