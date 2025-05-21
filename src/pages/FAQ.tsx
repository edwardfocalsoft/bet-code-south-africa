
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { CircleHelp } from "lucide-react";

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is BetCode?",
      answer: "BetCode is a platform connecting sports bettors with expert tipsters. Buyers can purchase betting tickets from verified sellers who provide tips and predictions for various sports events."
    },
    {
      question: "How do I purchase a ticket?",
      answer: "To purchase a ticket, browse through available tickets, select one that interests you, and click the 'Purchase' button. You'll need to have sufficient credit in your wallet to complete the transaction."
    },
    {
      question: "How do I become a seller?",
      answer: "To become a seller, register for an account and select the 'Seller' role. After setting up your profile, you'll need to wait for admin approval before you can start creating and selling tickets."
    },
    {
      question: "How do withdrawals work?",
      answer: "Sellers can request withdrawals from their balance through the Withdrawals page. Once requested, administrators will review and process the withdrawal, with funds typically arriving in 1-3 business days."
    },
    {
      question: "What happens if a ticket doesn't win?",
      answer: "BetCode doesn't offer refunds for lost tickets, as this is the nature of sports betting. However, you can view a seller's win rate and reviews before purchasing to make informed decisions."
    },
    {
      question: "How do I add funds to my wallet?",
      answer: "Visit the Wallet page and click 'Add Credits'. We support various payment methods including credit/debit cards and instant EFT transfers."
    },
    {
      question: "What are free tickets?",
      answer: "Free tickets are predictions that sellers offer at no cost, often to showcase their expertise and attract potential subscribers."
    },
    {
      question: "What is the subscription model?",
      answer: "You can subscribe to a seller to receive all their tickets for a monthly fee. This is often more cost-effective than purchasing individual tickets if you follow a particular seller regularly."
    },
    {
      question: "How do I report an issue with a ticket?",
      answer: "If you have an issue with a purchased ticket, you can open a case from your Purchases page. Our support team will review the case and assist in resolving the matter."
    },
    {
      question: "What betting sites are supported?",
      answer: "BetCode supports tickets for multiple betting sites including Betway, Hollywoodbets, Supabets, Playa, 10bet, and Easybet."
    }
  ];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl flex justify-center items-center gap-2">
              <CircleHelp className="h-6 w-6 text-betting-green" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-lg">
              Find answers to common questions about BetCode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-betting-light-gray">
                    <AccordionTrigger className="text-left text-lg font-medium hover:text-betting-green">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-12 text-center">
                <Heading as="h3" size="xl" className="mb-4">Still have questions?</Heading>
                <p className="text-muted-foreground mb-6">
                  If you couldn't find the answer you were looking for, please contact our support team.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => window.location.href = "/contact"} 
                    variant="outline" 
                    className="border-betting-green text-betting-green hover:bg-betting-green hover:text-white"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Adding the Button component since it's used in this file but wasn't imported
import { Button } from "@/components/ui/button";

export default FAQ;

