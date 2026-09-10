import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      paragraphs: [],
      content: [
        'Personal information you provide (name, email, profile details)',
        'Instagram Business account data (profile information, media/posts, and insights such as reach, impressions, and engagement), collected only after user authorization via Instagram Login',
        'Campaign and collaboration data between brands and influencers',
        'Payment and billing information',
        'Usage data and analytics',
      ],
    },
    {
      title: 'How We Use Your Information',
      paragraphs: [],
      content: [
        'To provide and improve our platform services',
        'To connect brands and influencers for collaborations',
        'To display influencer profiles and performance insights',
        'To process payments and manage subscriptions',
        'To send important updates and notifications',
        'To analyze usage patterns and improve user experience',
      ],
    },
    {
      title: 'Instagram Data Usage',
      paragraphs: [
        'FameSync uses Instagram APIs to access data from Instagram Business accounts that explicitly authorize our application.',
        'This data is used solely to provide analytics and collaboration features within the FameSync platform.',
        'We do not access Instagram data without user consent and do not use this data for advertising or resale purposes.',
      ],
      content: [
        'Profile information',
        'Media content (posts)',
        'Insights data (reach, impressions, engagement)',
      ],
    },
    {
      title: 'Information Sharing',
      paragraphs: [],
      content: [
        'We do not sell your personal information to third parties',
        'Profile and Instagram data may be shared with brands or collaboration partners within the platform to enable campaign collaborations, only after the user has connected their account and consented',
        'Payment processing is handled by secure third-party providers (e.g., Stripe)',
        'Analytics data may be processed by service providers to improve functionality',
        'Legal disclosures may be made if required by law',
      ],
    },
    {
      title: 'Data Security',
      paragraphs: [],
      content: [
        'Industry-standard encryption for data transmission',
        'Secure storage of personal and financial information',
        'Access controls and authentication measures',
        'Regular security audits and updates',
      ],
    },
    {
      title: 'Your Rights',
      paragraphs: [],
      content: [
        'Access your personal data',
        'Request correction of inaccurate information',
        'Delete your account and associated data',
        'Opt-out of marketing communications',
      ],
    },
    {
      title: 'Data Deletion',
      paragraphs: ['Users can delete their data at any time by:'],
      content: [
        'Disconnecting their Instagram account from the FameSync dashboard, which removes Instagram data and revokes access',
        'Deleting their FameSync account, which permanently removes all associated data',
        'Contacting us at info@famesync.com with a deletion request',
      ],
    },
    {
      title: 'Cookies and Tracking',
      paragraphs: [],
      content: [
        'Essential cookies for platform functionality',
        'Analytics cookies to improve user experience',
        'Preference cookies to remember your settings',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - FameSync | Data Protection & Security</title>
        <meta
          name="description"
          content="Read FameSync's privacy policy to understand how we collect, use, and protect your information, including authorized Instagram Business account data."
        />
        <meta
          name="keywords"
          content="privacy policy, data protection, personal information, data security, gdpr"
        />
        <link rel="canonical" href="https://famesync.com/privacy" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/privacy" />
        <meta property="og:title" content="Privacy Policy - FameSync" />
        <meta
          property="og:description"
          content="How FameSync collects, uses, and protects your information, including authorized Instagram Business account data."
        />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - FameSync" />
        <meta
          name="twitter:description"
          content="How FameSync collects, uses, and protects your information, including authorized Instagram Business account data."
        />
      </Helmet>

      <article className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-white" variant="secondary">
              <Shield className="w-4 h-4 mr-2" />
              Last Updated: March 2026
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="text-foreground">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This Privacy Policy explains how
              FameSync collects, uses, and protects your information.
            </p>
          </motion.header>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border border-border border-2">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    {section.paragraphs.length > 0 && (
                      <div className="space-y-4 mb-6 text-muted-foreground">
                        {section.paragraphs.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-primary mt-1">&bull;</span>
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
              <Card className="bg-card border border-border border-2">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about this Privacy Policy, please
                    contact us:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      Email:{' '}
                      <a
                        href="mailto:info@famesync.com"
                        className="text-primary hover:underline"
                      >
                        info@famesync.com
                      </a>
                    </p>
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

export default Privacy;
