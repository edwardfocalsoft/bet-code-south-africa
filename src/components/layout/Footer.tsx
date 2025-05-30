
import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-betting-black border-t border-betting-light-gray py-6">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/97acf725-8078-49e3-907a-5029e50b1175.png" 
              alt="Payment Methods - Visa, Mastercard, Maestro, InstantEFT, SCode" 
              className="h-8 object-contain"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-white transition-colors">
              FAQs
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-betting-green" />
            <span className="text-sm text-muted-foreground">support@betcode.co.za</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-betting-light-gray text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BetCode South Africa. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
