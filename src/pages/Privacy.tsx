
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Shield } from "lucide-react";

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl flex justify-center items-center gap-2">
              <Shield className="h-6 w-6 text-betting-green" />
              Privacy Policy
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
                  At BetCode ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or any other services we offer (collectively, the "Services").
                </p>
                <p>
                  Please read this Privacy Policy carefully. By using our Services, you consent to the practices described in this policy.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">2. Information We Collect</Heading>
                <p>We collect information in various ways, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Information You Provide</strong>: We collect information that you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.
                  </li>
                  <li>
                    <strong>Automatically Collected Information</strong>: When you use our Services, we automatically collect certain information, including log data, device information, location information, and cookies.
                  </li>
                  <li>
                    <strong>Information from Third Parties</strong>: We may receive information about you from third parties, such as business partners, analytics providers, and social media platforms.
                  </li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">3. How We Use Your Information</Heading>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our Services;</li>
                  <li>Process transactions and send related information;</li>
                  <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
                  <li>Respond to your comments, questions, and requests;</li>
                  <li>Communicate with you about products, services, offers, promotions, and events;</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our Services;</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities;</li>
                  <li>Protect the rights and property of BetCode and others.</li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">4. How We Share Your Information</Heading>
                <p>We may share your information as follows:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>With Service Providers</strong>: We share your information with third-party vendors, consultants, and other service providers who need access to your information to perform services on our behalf.
                  </li>
                  <li>
                    <strong>With Users of our Services</strong>: When you create a profile, certain information may be visible to other users of our Services.
                  </li>
                  <li>
                    <strong>For Legal Reasons</strong>: We may share information if we believe disclosure is necessary or appropriate to comply with law, regulation, legal process, or governmental request.
                  </li>
                  <li>
                    <strong>In Connection with a Business Transaction</strong>: We may share information in connection with a merger, sale of company assets, financing, or acquisition of all or a portion of our business.
                  </li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">5. Security</Heading>
                <p>
                  We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable and we cannot guarantee the security of our systems.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">6. Your Choices</Heading>
                <p>You have certain choices about your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Information</strong>: You can update your account information at any time by logging into your account.
                  </li>
                  <li>
                    <strong>Marketing Communications</strong>: You can opt out of receiving promotional emails from us by following the instructions in those emails.
                  </li>
                  <li>
                    <strong>Cookies</strong>: Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies.
                  </li>
                </ul>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">7. Children's Privacy</Heading>
                <p>
                  Our Services are not directed to children under 18, and we do not knowingly collect personal information from children under 18. If we learn we have collected personal information from a child under 18, we will delete that information.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">8. International Users</Heading>
                <p>
                  Our Services are hosted in South Africa and intended for users in South Africa. If you access our Services from outside South Africa, please be advised that your information may be transferred to, stored, and processed in South Africa, where our servers are located.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">9. Changes to This Privacy Policy</Heading>
                <p>
                  We may revise this Privacy Policy at any time. When we make changes, we will update the "Last Updated" date at the top of this policy. We encourage you to review this Privacy Policy regularly to stay informed about our information practices.
                </p>
              </section>
              
              <section>
                <Heading as="h2" size="2xl" className="mb-4">10. Contact Us</Heading>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: 
                  <a href="mailto:privacy@betcode.co.za" className="text-betting-green ml-1">privacy@betcode.co.za</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Privacy;
