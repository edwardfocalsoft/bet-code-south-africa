
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { toast } from "sonner";
import { Mail, MessageSquare, Send } from "lucide-react";

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    toast.success("Thank you for your message. We'll get back to you soon!");
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl flex justify-center items-center gap-2">
              <Mail className="h-6 w-6 text-betting-green" />
              Contact Us
            </CardTitle>
            <CardDescription className="text-lg">
              Have questions or feedback? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Heading as="h3" size="xl" className="mb-4">Get in Touch</Heading>
                <p className="text-muted-foreground mb-6">
                  Our team is here to help with any questions about our platform, 
                  tickets, or your account. We typically respond within 24 hours.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-betting-green" />
                    <span>support@betcode.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-betting-green" />
                    <span>WhatsApp Support: +27 XX XXX XXXX</span>
                  </div>
                </div>
              </div>
              
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      required 
                      className="bg-betting-black border-betting-light-gray"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email address" 
                      required 
                      className="bg-betting-black border-betting-light-gray"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <Input 
                      id="subject" 
                      placeholder="What is this regarding?" 
                      required 
                      className="bg-betting-black border-betting-light-gray"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Your message" 
                      required 
                      rows={5}
                      className="bg-betting-black border-betting-light-gray"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-betting-green hover:bg-betting-green-dark"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Contact;
