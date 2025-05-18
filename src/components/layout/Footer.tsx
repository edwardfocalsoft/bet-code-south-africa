import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
const Footer: React.FC = () => {
  return <footer className="mt-auto bg-betting-black border-t border-betting-light-gray py-6">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link to="/" className="text-betting-green text-xl font-bold flex items-center">
              <span className="text-betting-accent">Bet</span>Code<span className="text-xs text-muted-foreground ml-1">South Africa</span>
            </Link>
            
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/contact" className="text-muted-foreground hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-white transition-colors">
              FAQs
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-betting-green" />
            <span className="text-sm text-muted-foreground">support@betcode.co.za</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-betting-light-gray text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BetCode South Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;