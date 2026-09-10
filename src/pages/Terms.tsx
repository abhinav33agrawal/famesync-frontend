import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using FameSync, you accept and agree to be bound by these Terms of Service.',
        'If you do not agree to these terms, please do not use our platform.',
        'We reserve the right to modify these terms at any time with notice to users.',
      ],
    },
    {
      title: 'User Accounts',
      content: [
        'You must create an account to access platform features.',
        'You are responsible for maintaining the security of your account.',
        'You must provide accurate and complete information.',
        'One person or entity may only maintain one account.',
        'You must be at least 18 years old to use the platform.',
      ],
    },
    {
      title: 'User Conduct',
      content: [
        'Users must not engage in fraudulent or deceptive practices.',
        'All profile information must be accurate and truthful.',
        'Users must not harass, abuse, or harm other users.',
        'Spam, bot activity, and automated actions are prohibited.',
        'Users must comply with all applicable laws and regulations.',
      ],
    },
    {
      title: 'Content and Intellectual Property',
      content: [
        'Users retain ownership of content they submit to the platform.',
        'By submitting content, you grant FameSync a license to use it for platform operations.',
        'Users must not infringe on others\' intellectual property rights.',
        'FameSync reserves all rights to the platform\'s design and functionality.',
      ],
    },
    {
      title: 'Payment and Subscriptions',
      content: [
        'Subscription fees are charged on a recurring basis.',
        'All fees are non-refundable except as required by law.',
        'We reserve the right to change pricing with 30 days notice.',
        'Payment processing is handled securely through Stripe.',
        'Users are responsible for maintaining valid payment methods.',
      ],
    },
    {
      title: 'Campaign Collaborations',
      content: [
        'FameSync facilitates connections but is not party to agreements between brands and influencers.',
        'Users are responsible for fulfilling their obligations in collaborations.',
        'Disputes should be resolved directly between parties.',
        'FameSync may intervene in cases of clear policy violations.',
      ],
    },
    {
      title: 'Termination',
      content: [
        'We reserve the right to suspend or terminate accounts that violate these terms.',
        'Users may delete their accounts at any time through platform settings.',
        'Upon termination, certain data may be retained as required by law.',
        'Paid subscriptions will not be refunded upon voluntary termination.',
      ],
    },
    {
      title: 'Limitation of Liability',
      content: [
        'FameSync is provided "as is" without warranties of any kind.',
        'We are not liable for indirect, incidental, or consequential damages.',
        'Our total liability is limited to the amount paid by the user in the past 12 months.',
        'We are not responsible for the actions of users or third parties.',
      ],
    },
    {
      title: 'Dispute Resolution',
      content: [
        'Any disputes will be resolved through binding arbitration.',
        'Arbitration will be conducted in San Francisco, California.',
        'Users waive the right to participate in class action lawsuits.',
        'Small claims court actions are permitted for qualifying claims.',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service - FameSync | User Agreement</title>
        <meta name="description" content="Read FameSync's terms of service to understand your rights and responsibilities when using our influencer marketing platform." />
        <meta name="keywords" content="terms of service, user agreement, terms and conditions, legal agreement" />
        <link rel="canonical" href="https://famesync.com/terms" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/terms" />
        <meta property="og:title" content="Terms of Service - FameSync" />
        <meta property="og:description" content="FameSync terms of service and user agreement." />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service - FameSync" />
        <meta name="twitter:description" content="FameSync terms of service and user agreement." />
      </Helmet>

      <article className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 gradient-instagram text-white" variant="secondary">
              <FileText className="w-4 h-4 mr-2" />
              Last Updated: January 2025
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using FameSync. They govern your access to and use of our platform.
            </p>
          </motion.header>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass border-2">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">
                      {section.title}
                    </h2>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.section>
            ))}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-dark border-2">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                  <p className="text-muted-foreground mb-4">
                    For questions about these Terms of Service, please contact:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Email: <a href="mailto:info@famesync.com" className="text-primary hover:underline">info@famesync.com</a></p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </article>
    </>
  );
};

export default Terms;
