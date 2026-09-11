import { Helmet } from 'react-helmet-async';
import { Rise } from '@/components/motion';

/* Long-form reading page: one measured prose column (~68ch), hairline
   dividers instead of a card per clause, display face on headings only.
   The policy wording itself is unchanged. Removed: the `text-white` badge,
   the `bg-card border border-border border-2` codemod artefact and the
   per-section stagger. */

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

      <article className="container py-16 sm:py-20">
        <div className="max-w-[68ch]">
          <Rise>
            <p className="eyebrow mb-5">Last Updated: March 2026</p>
            <h1 className="font-display text-display-2">Privacy Policy</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Your privacy is important to us. This Privacy Policy explains how
              FameSync collects, uses, and protects your information.
            </p>
          </Rise>

          <div className="mt-14 divide-y divide-border border-t border-border">
            {sections.map((section) => (
              <Rise key={section.title}>
                <section className="py-10">
                  <h2 className="font-display text-display-3">{section.title}</h2>

                  {section.paragraphs.length > 0 && (
                    <div className="mt-5 space-y-4 leading-[1.7] text-muted-foreground">
                      {section.paragraphs.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  <ul className="mt-5 space-y-3.5">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex gap-3.5 leading-[1.7] text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary/45"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </Rise>
            ))}

            <Rise>
              <section className="py-10">
                <h2 className="font-display text-display-3">Contact Us</h2>
                <p className="mt-5 leading-[1.7] text-muted-foreground">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <p className="mt-4 leading-[1.7] text-muted-foreground">
                  Email:{' '}
                  <a
                    href="mailto:info@famesync.com"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    info@famesync.com
                  </a>
                </p>
              </section>
            </Rise>
          </div>
        </div>
      </article>
    </>
  );
};

export default Privacy;
