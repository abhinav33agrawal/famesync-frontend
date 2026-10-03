import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Rise } from '@/components/motion';

/* Long-form reading page: one measured prose column (~68ch), hairline
   dividers instead of a card per clause, display face on headings only.

   Keep this wording in step with the code and with the Meta App Review
   answers (data processors, Instagram fields, deletion). Reviewers compare
   them. Instagram fields: backend/instagram/services.py. Processors: AWS
   ap-south-1 (EC2, RDS, S3) and Sentry. Payments: Razorpay. */

const Privacy = () => {
  // The browser jumps to a #hash before React has rendered the target, so
  // do it ourselves -- after the web fonts land, because the fallback font
  // wraps taller and scrolling earlier overshoots by several hundred pixels.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let live = true;
    document.fonts.ready.then(() => {
      if (live) document.getElementById(id)?.scrollIntoView();
    });
    return () => {
      live = false;
    };
  }, []);

  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      paragraphs: [],
      content: [
        'Information you give us: your name, email address, password (stored only as a one-way hash), and the profile details you add, such as bio, niche, location, company and social links',
        'Instagram professional account data, collected only after you choose to connect Instagram and approve access (see “Instagram Data” below)',
        'Campaigns, applications and messages exchanged between brands and creators on FameSync',
        'Subscription and payment records, such as your plan, renewal date and payment reference. Card and bank details are entered with our payment provider, Razorpay, and never reach our servers',
        'Basic technical data needed to run the service, such as your IP address, browser type and error reports',
      ],
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      paragraphs: [],
      content: [
        'To create and secure your account and sign you in',
        'To show creator profiles to brands, and campaigns to creators',
        'To review new creator accounts before they are listed',
        'To process subscriptions and track credit usage',
        'To send account emails, such as verification, password reset and application updates',
        'To find and fix errors and keep the service secure',
      ],
    },
    {
      id: 'instagram-data',
      title: 'Instagram Data',
      paragraphs: [
        'If you are a creator, you can sign in with Instagram or connect your Instagram professional account. We only receive data after you approve access on Instagram, and only for your own account. We read:',
      ],
      content: [
        'Account details: Instagram user ID, username, account type, bio, profile picture, and follower, following and post counts',
        'Recent posts: caption, media type, image or thumbnail link, permalink, date, and like and comment counts',
        'Account insights for the last 30 days: reach, accounts engaged, total interactions and profile views',
        'An access token, which we store securely and use only to refresh the data above',
      ],
    },
    {
      id: 'instagram-data-use',
      title: 'How We Use Instagram Data',
      paragraphs: [
        'We use Instagram data only to verify that you own the account you list, to fill in blank fields on your FameSync profile, and to show your profile, recent posts and insights to brands on FameSync and to our review team.',
        'We never post, comment or send messages on Instagram for you. We do not use Instagram data for advertising, and we never sell it or share it with anyone outside FameSync except the service providers listed below, who process it only on our behalf.',
      ],
      content: [],
    },
    {
      id: 'service-providers',
      title: 'Service Providers',
      paragraphs: [
        'We do not sell your personal information. These companies process data on our behalf to run FameSync:',
      ],
      content: [
        'Amazon Web Services: hosts our servers, database and file storage in India (Mumbai region). This includes Instagram data',
        'Sentry (Functional Software, Inc.): error monitoring. Error reports can include details of the request that failed',
        'Razorpay: payment processing for subscriptions',
        'Hostinger: delivers our account emails',
        'Vercel: hosts the FameSync website',
        'OpenAI: generates campaign suggestions from a brand’s own profile. Creator and Instagram data are never sent to OpenAI',
        'Google: only if you choose to sign in with Google',
      ],
    },
    {
      id: 'sharing',
      title: 'Other Sharing',
      paragraphs: [],
      content: [
        'Brands on FameSync can see creator profiles, including connected Instagram data, so they can choose who to work with',
        'Creators can see the campaigns that brands publish',
        'We may disclose information if the law requires it, after reviewing whether the request is lawful',
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      paragraphs: [],
      content: [
        'All traffic to FameSync is encrypted with HTTPS',
        'Passwords are stored only as one-way hashes',
        'Access to our servers and database is restricted to FameSync systems and authorised staff',
        'Only authorised FameSync staff can open the admin tools, and admin actions are logged',
      ],
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      paragraphs: [],
      content: [
        'See and edit your profile at any time in FameSync',
        'Ask us for a copy of your personal data',
        'Ask us to correct or delete your data',
        'Disconnect Instagram at any time',
      ],
    },
    {
      id: 'data-deletion',
      title: 'Data Deletion',
      paragraphs: ['You can remove your data in either of these ways:'],
      content: [
        'Disconnect Instagram from the Instagram tab of your FameSync profile. We immediately delete your access token, recent posts, insights, follower counts and verified badge, and stop reading from your account. We keep your Instagram user ID so you can still sign in with Instagram later; your Instagram handle and any bio copied into your profile stay there as editable text until you change them. You can also remove FameSync under Settings → Apps and websites in Instagram',
        'Email info@famesync.com from your account’s email address and ask us to delete your account. We will delete your account and all associated data, including Instagram data, within 30 days and confirm by email. Records we must keep by law, such as payment records, are kept only as long as required',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and Local Storage',
      paragraphs: [],
      content: [
        'We do not use advertising or third-party tracking cookies',
        'Your browser’s local storage keeps you signed in, and one small cookie remembers your layout preferences',
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
            <p className="eyebrow mb-5">Last Updated: October 2026</p>
            <h1 className="font-display text-display-2">Privacy Policy</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Your privacy is important to us. This Privacy Policy explains how
              FameSync collects, uses, and protects your information.
            </p>
          </Rise>

          <div className="mt-14 divide-y divide-border border-t border-border">
            {sections.map((section) => (
              <Rise key={section.id}>
                {/* The id makes /privacy#data-deletion a stable link for
                    Meta's "Data deletion instructions URL" field. */}
                <section id={section.id} className="scroll-mt-24 py-10">
                  <h2 className="font-display text-display-3">{section.title}</h2>

                  {section.paragraphs.length > 0 && (
                    <div className="mt-5 space-y-4 leading-[1.7] text-muted-foreground">
                      {section.paragraphs.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {section.content.length > 0 && (
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
                  )}
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
