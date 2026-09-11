import { Helmet } from 'react-helmet-async';
import { Rise } from '@/components/motion';

/* Long-form reading page: one measured prose column (~68ch), hairline
   dividers instead of a card per clause, display face on headings only.
   The terms wording itself is unchanged. Removed: the `text-white` badge,
   the `bg-card border border-border border-2` codemod artefact and the
   per-section stagger. */

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

      <article className="container py-16 sm:py-20">
        <div className="max-w-[68ch]">
          <Rise>
            <p className="eyebrow mb-5">Last Updated: January 2025</p>
            <h1 className="font-display text-display-2">Terms of Service</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Please read these terms carefully before using FameSync. They govern your access to and use of our platform.
            </p>
          </Rise>

          <div className="mt-14 divide-y divide-border border-t border-border">
            {sections.map((section) => (
              <Rise key={section.title}>
                <section className="py-10">
                  <h2 className="font-display text-display-3">{section.title}</h2>
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
                <h2 className="font-display text-display-3">Contact Information</h2>
                <p className="mt-5 leading-[1.7] text-muted-foreground">
                  For questions about these Terms of Service, please contact:
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

export default Terms;
