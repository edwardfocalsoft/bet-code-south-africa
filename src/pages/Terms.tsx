
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { FileText } from "lucide-react";

const Terms: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl flex justify-center items-center gap-2">
              <FileText className="h-6 w-6 text-betting-green" />
              Terms of Service
            </CardTitle>
            <CardDescription className="text-lg">
              Last updated: May 21, 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <Heading as="h2" size="2xl" className="mb-4">1. Introduction</Heading>
                <p>
                  Welcome to BetCode ("we," "our," or "us"). By accessing or using our website, mobile application, or any other services we offer (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). Please read these Terms carefully.
                </p>
                <p>
                  BetCode provides a platform connecting sports bettors with expert tipsters. We do not provide betting services directly and are not responsible for any losses incurred from following betting advice provided through our platform.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">2. Eligibility</Heading>
                <p>
                  You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you are at least 18 years old and that your use of the Services does not violate any applicable laws or regulations.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">3. Account Registration</Heading>
                <p>
                  To access certain features of our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p>
                  You are solely responsible for safeguarding your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">4. Buyer and Seller Relationships</Heading>
                <p>
                  BetCode serves as a platform connecting buyers and sellers of betting tickets. We do not guarantee the accuracy, quality, or reliability of any tickets sold on our platform.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>For Buyers:</strong> When you purchase a ticket, you are entering into an agreement with the seller, not with BetCode. We are not responsible for the content of tickets or any losses incurred as a result.
                  </li>
                  <li>
                    <strong>For Sellers:</strong> You are responsible for ensuring that the information in your tickets is accurate and complies with our guidelines. Repeated provision of inaccurate information may result in account suspension.
                  </li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">5. Payments and Fees</Heading>
                <p>
                  We process payments for tickets purchased on our platform. We charge a service fee for each transaction, which is deducted from the seller's earnings. The current fee structure is available on our website and may be updated from time to time.
                </p>
                <p>
                  All purchases are final and non-refundable, except in extraordinary circumstances at our discretion.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">6. Content Guidelines</Heading>
                <p>
                  Users of our platform may not post content that is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, or otherwise objectionable.
                </p>
                <p>
                  We reserve the right to remove any content that violates these guidelines and to suspend or terminate the accounts of users who repeatedly violate them.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">7. Intellectual Property</Heading>
                <p>
                  The Services and all content and materials available through the Services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the property of BetCode or our licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">8. Limitation of Liability</Heading>
                <p>
                  In no event shall BetCode, its affiliates, or their respective officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to or use of or inability to access or use the Services;</li>
                  <li>Any conduct or content of any third party on the Services;</li>
                  <li>Any content obtained from the Services; and</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">9. Governing Law</Heading>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">10. Changes to These Terms</Heading>
                <p>
                  We may revise these Terms at any time by updating this page. It is your responsibility to check this page periodically for changes. Your continued use of the Services following the posting of revised Terms means that you accept and agree to the changes.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">11. Contact Us</Heading>
                <p>
                  If you have any questions about these Terms, please contact us at support@betcode.co.za.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Terms;
