"""
Management command to seed realistic Indian brand campaigns.
Run with: python manage.py seed_indian_campaigns
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with realistic Indian brand campaigns'

    def handle(self, *args, **options):
        from campaigns.models import Campaign
        from profiles.models import BrandProfile

        # Find or create brand users for campaigns
        brand_profiles = BrandProfile.objects.filter(user__is_approved=True)
        
        if not brand_profiles.exists():
            self.stdout.write(self.style.WARNING('No approved brand profiles found. Creating demo brands...'))
            # Create demo brand users if none exist
            demo_brands = self.create_demo_brands()
        else:
            demo_brands = list(brand_profiles)

        # Realistic Indian brand campaigns
        campaigns_data = [
            # Fashion & Apparel
            {
                'title': 'Myntra End of Reason Sale Promotion',
                'description': 'We are looking for fashion-forward influencers to create buzz around our biggest sale of the year - the End of Reason Sale! Create engaging content showcasing your favorite picks, styling tips, and exclusive deals. We want authentic, relatable content that resonates with young India. Share your shopping haul, try-on videos, and honest reviews to help your followers discover amazing fashion at unbeatable prices.',
                'category': 'fashion',
                'objective': 'sales',
                'budget': 25000,
                'budget_type': 'negotiable',
                'requirements': 'Minimum 10K followers on Instagram. Should have posted fashion content in the last 30 days. Authentic engagement is a must. Located in metro cities preferred.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 5},
                    {'type': 'Post', 'count': 1}
                ],
                'target_cities': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
                'target_gender': 'female',
                'min_followers': 10000,
                'max_followers': 500000,
                'hashtags': '#MyntraEORS #EndOfReasonSale #FashionDeals #MyntraHaul',
                'key_messages': 'Up to 80% off on top brands. Free shipping on orders above ₹499. Easy returns.',
            },
            {
                'title': 'Fabindia Handloom Collection Launch',
                'description': 'Fabindia is launching an exclusive handloom collection celebrating the artisans of India. We are seeking influencers who appreciate sustainable fashion and Indian craftsmanship. Create content that tells the story behind each piece - the weavers, the tradition, and the timeless elegance. Perfect for influencers who focus on slow fashion, sustainability, and cultural heritage.',
                'category': 'fashion',
                'objective': 'awareness',
                'budget': 40000,
                'budget_type': 'fixed',
                'requirements': 'Must have interest in sustainable/slow fashion. Previous content on Indian wear or handloom is a plus. Authentic storytelling ability required. Age 25-45 preferred.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 3},
                    {'type': 'Post', 'count': 2}
                ],
                'target_cities': ['Delhi', 'Jaipur', 'Chennai', 'Kolkata', 'Mumbai'],
                'target_niche': 'Sustainable Fashion',
                'hashtags': '#FabindiaHandloom #MadeInIndia #SustainableFashion #IndianCraft',
                'key_messages': 'Each piece tells a story. Supporting 55000+ artisans across India.',
            },
            # Beauty & Cosmetics
            {
                'title': 'Nykaa Pink Friday Sale Campaign',
                'description': 'Get ready for India\'s biggest beauty sale! We need beauty influencers to create exciting content around Nykaa Pink Friday Sale. Show your favorite makeup picks, skincare essentials, and exclusive deals. Create GRWM (Get Ready With Me) content, product reviews, and shopping guides that help your followers make the best choices during the sale.',
                'category': 'beauty',
                'objective': 'sales',
                'budget': 20000,
                'budget_type': 'negotiable',
                'requirements': 'Beauty/makeup content creators with 5K+ followers. Should have good lighting setup for product shots. Must be comfortable with on-camera content.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 7},
                    {'type': 'Post', 'count': 1}
                ],
                'min_followers': 5000,
                'max_followers': 200000,
                'hashtags': '#NykaaPinkFriday #BeautySale #NykaaHaul #MakeupDeals',
                'key_messages': 'Up to 50% off on premium brands. Free gifts on orders above ₹1500.',
            },
            {
                'title': 'Mamaearth Onion Hair Oil - Honest Review',
                'description': 'Mamaearth is looking for authentic voices to share their genuine experience with our bestselling Onion Hair Oil. We want real stories of hair transformation - before/after content, honest reviews, and personal hair care journeys. No scripted content - just your true experience with the product over 3-4 weeks of usage.',
                'category': 'beauty',
                'objective': 'ugc',
                'budget': 15000,
                'budget_type': 'fixed',
                'requirements': 'Must be willing to use product for minimum 3 weeks before posting. Hair care/beauty niche preferred. Authentic, relatable content style. No heavy filters on product shots.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 4},
                    {'type': 'Post', 'count': 1}
                ],
                'hashtags': '#Mamaearth #OnionHairOil #HairCareJourney #NaturalHairCare',
                'key_messages': 'Made with natural ingredients. No toxins. Cruelty-free.',
            },
            # Food & Beverage
            {
                'title': 'Swiggy Instamart Quick Commerce Promo',
                'description': 'Swiggy Instamart delivers groceries in 10 minutes! We need lifestyle and food influencers to showcase the convenience of instant grocery delivery. Create relatable content around last-minute cooking, midnight cravings, or busy weekday meals where Instamart saves the day. Show real usage scenarios that your followers can relate to.',
                'category': 'food',
                'objective': 'awareness',
                'budget': 18000,
                'budget_type': 'negotiable',
                'requirements': 'Lifestyle/food content creators in metro cities. Should be an active Swiggy user. Relatable, slice-of-life content style preferred.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 5}
                ],
                'target_cities': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'],
                'hashtags': '#SwiggyInstamart #10MinuteDelivery #GroceryDelivery #QuickCommerce',
                'key_messages': 'Groceries in 10 minutes. 5000+ products. Free delivery on first 3 orders.',
            },
            {
                'title': 'Bira 91 Weekend Vibes Campaign',
                'description': 'Bira 91 is looking for lifestyle influencers to capture the essence of good times with friends. Create content around weekend hangouts, house parties, rooftop sessions, or casual dinner scenes featuring Bira 91. We want vibrant, fun, and aspirational content that celebrates friendship and good vibes. Must be 25+ years old.',
                'category': 'food',
                'objective': 'engagement',
                'budget': 35000,
                'budget_type': 'fixed',
                'requirements': 'Must be 25+ years old. Lifestyle/party content creators. Located in metro cities. Previous brand collaboration experience preferred. High-quality photography/videography skills.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 3},
                    {'type': 'Post', 'count': 2}
                ],
                'target_cities': ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Goa'],
                'min_followers': 20000,
                'hashtags': '#Bira91 #MakePlayWithFlavor #WeekendVibes #GoodTimes',
                'key_messages': 'Imagined in India. Drink responsibly.',
            },
            # Technology
            {
                'title': 'boAt Earbuds Gen Z Campaign',
                'description': 'boAt is launching a new range of wireless earbuds designed for Gen Z. We need young, energetic influencers to create content that showcases the earbuds in action - during workouts, commutes, gaming sessions, or study time. Emphasis on bass quality, battery life, and style quotient. Content should be high-energy and relatable to young India.',
                'category': 'tech',
                'objective': 'awareness',
                'budget': 22000,
                'budget_type': 'negotiable',
                'requirements': 'Age 18-28. Tech/lifestyle content creators. Must have experience with tech product content. High-quality video content capability.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 4},
                    {'type': 'Unboxing Video', 'count': 1}
                ],
                'target_gender': 'all',
                'min_followers': 10000,
                'max_followers': 300000,
                'hashtags': '#boAt #boAthead #WirelessEarbuds #TechLife',
                'key_messages': 'India\'s #1 audio brand. 40-hour battery life. IPX5 water resistant.',
            },
            {
                'title': 'Croma Electronics Back to College Sale',
                'description': 'Croma\'s Back to College sale is here! We need student and young professional influencers to create content around essential tech for college life - laptops, tablets, earphones, and accessories. Share your tech setup, study essentials, or dorm room tech tour. Content should resonate with students preparing for the new academic year.',
                'category': 'tech',
                'objective': 'sales',
                'budget': 15000,
                'budget_type': 'negotiable',
                'requirements': 'College students or recent graduates. Tech/student life content creators. Should have posted tech or study-related content before.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 5},
                    {'type': 'Post', 'count': 1}
                ],
                'hashtags': '#CromaRetail #BackToCollege #TechEssentials #StudentLife',
                'key_messages': 'Up to 40% off on laptops. Easy EMI options. Student discounts available.',
            },
            # Fitness & Wellness
            {
                'title': 'Cult.fit Transformation Stories',
                'description': 'Cult.fit is collecting real transformation stories from our community. If you have been working out with Cult.fit and have seen visible results, we want to feature your journey. Share your before/after, workout routines, and how Cult.fit has changed your lifestyle. Authentic stories only - we celebrate real progress, not perfection.',
                'category': 'fitness',
                'objective': 'ugc',
                'budget': 30000,
                'budget_type': 'fixed',
                'requirements': 'Must be an active Cult.fit member for at least 3 months. Visible fitness transformation or consistent workout journey. Fitness/health content creators preferred.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 5},
                    {'type': 'Post', 'count': 1}
                ],
                'target_cities': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'],
                'hashtags': '#CultFit #FitnessTransformation #CultFitJourney #DoTheCult',
                'key_messages': 'Real people. Real results. Join India\'s largest fitness community.',
            },
            {
                'title': 'Decathlon Sports Gear Review',
                'description': 'Decathlon India is looking for sports enthusiasts to review our latest sports gear - from running shoes to cycling gear to fitness equipment. We want honest, detailed reviews from people who actually use the products. Show the gear in action, share performance insights, and help fellow sports lovers make informed decisions.',
                'category': 'fitness',
                'objective': 'awareness',
                'budget': 12000,
                'budget_type': 'negotiable',
                'requirements': 'Active sports enthusiasts. Should regularly participate in sports/fitness activities. Review/educational content style preferred. All sports welcome - running, cycling, badminton, cricket, etc.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 3},
                    {'type': 'Post', 'count': 1}
                ],
                'hashtags': '#Decathlon #SportsForAll #DecathlonIndia #GearReview',
                'key_messages': 'Quality sports gear at accessible prices. 2-year warranty on all products.',
            },
            # Travel & Tourism
            {
                'title': 'MakeMyTrip Goa Season Campaign',
                'description': 'The Goa season is here! MakeMyTrip is looking for travel influencers to create aspirational content around Goa trips - from beach hopping to nightlife, from heritage to adventure. Show the best of Goa and how MakeMyTrip makes planning the perfect trip effortless. Content should inspire wanderlust and drive bookings.',
                'category': 'travel',
                'objective': 'sales',
                'budget': 50000,
                'budget_type': 'fixed',
                'requirements': 'Travel content creators with 25K+ followers. High-quality travel photography/videography skills. Previous travel brand collaborations preferred. Should be available to travel to Goa.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 3},
                    {'type': 'Story', 'count': 10},
                    {'type': 'Post', 'count': 3}
                ],
                'campaign_type': 'onfield',
                'location': 'Goa',
                'min_followers': 25000,
                'hashtags': '#MakeMyTrip #GoaVibes #TravelWithMMT #GoaSeason',
                'key_messages': 'Best prices guaranteed. Instant booking confirmation. 24/7 support.',
            },
            {
                'title': 'Zostel Backpacker Diaries',
                'description': 'Zostel is looking for backpackers and budget travelers to share their hostel stories. Stay at any Zostel property and document your experience - the people you meet, the local experiences, and the adventures you have. We want raw, authentic travel content that captures the spirit of backpacking in India.',
                'category': 'travel',
                'objective': 'awareness',
                'budget': 20000,
                'budget_type': 'barter',
                'requirements': 'Backpacking/budget travel content creators. Age 20-35. Adventure-loving personality. Should be comfortable staying in hostel dormitories. Available for a 3-4 day trip.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 8},
                    {'type': 'Post', 'count': 2}
                ],
                'campaign_type': 'onfield',
                'location': 'Multiple Zostel properties',
                'hashtags': '#Zostel #BackpackerDiaries #HostelLife #BudgetTravel',
                'key_messages': 'Meet fellow travelers. Explore local experiences. Travel on a budget.',
            },
            # Lifestyle
            {
                'title': 'Urban Company Home Services Launch',
                'description': 'Urban Company is expanding home services in new cities. We need lifestyle and home decor influencers to showcase our services - from deep cleaning to AC servicing to beauty services at home. Create content that shows the convenience and quality of our trained professionals. Real usage content works best.',
                'category': 'lifestyle',
                'objective': 'awareness',
                'budget': 18000,
                'budget_type': 'negotiable',
                'requirements': 'Lifestyle/home content creators. Should be in service areas - metro cities. Family-oriented content welcome. Must be willing to use and review services honestly.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 1},
                    {'type': 'Story', 'count': 5},
                    {'type': 'Post', 'count': 1}
                ],
                'target_cities': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad'],
                'hashtags': '#UrbanCompany #HomeServices #ConvenienceAtHome #UCPartner',
                'key_messages': 'Trained professionals. Transparent pricing. 30-day service guarantee.',
            },
            {
                'title': 'Pepperfry Furniture Makeover',
                'description': 'Pepperfry is looking for home decor enthusiasts to showcase room makeovers using our furniture. Before/after content, styling tips, and honest reviews of furniture quality and delivery experience. Perfect for influencers who love interior design and home aesthetics.',
                'category': 'lifestyle',
                'objective': 'ugc',
                'budget': 35000,
                'budget_type': 'fixed',
                'requirements': 'Home decor/interior design content creators. Should have space for furniture placement. High-quality interior photography skills. Genuine interest in home styling.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 5},
                    {'type': 'Post', 'count': 3}
                ],
                'hashtags': '#Pepperfry #HomeMakeover #FurnitureStyling #HomeDecor',
                'key_messages': 'Free shipping on orders above ₹2999. Easy EMI. 10-year warranty on select items.',
            },
            # Gaming
            {
                'title': 'BGMI Tournament Promotion',
                'description': 'Major BGMI tournament coming up! We need gaming influencers to create hype around the tournament - gameplay content, tips and tricks, squad highlights, and tournament coverage. Looking for both pro players and content creators who can drive engagement in the gaming community.',
                'category': 'gaming',
                'objective': 'engagement',
                'budget': 28000,
                'budget_type': 'fixed',
                'requirements': 'BGMI content creators. Should have gaming setup for quality streaming/recording. Minimum Ace tier in game. Active in gaming community. Age 16-30.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 3},
                    {'type': 'Story', 'count': 10},
                    {'type': 'YouTube Video', 'count': 1}
                ],
                'target_gender': 'all',
                'min_followers': 15000,
                'hashtags': '#BGMI #BGMITournament #MobileGaming #GamingIndia',
                'key_messages': 'Prize pool of ₹1 Crore. Register now. India\'s biggest mobile gaming tournament.',
            },
            {
                'title': 'PlayStation India New Game Launch',
                'description': 'PlayStation India is launching a major new title and we need gaming content creators to create launch content - gameplay, first impressions, reviews, and streaming. Looking for diverse gaming voices across different genres. Early access will be provided to selected creators.',
                'category': 'gaming',
                'objective': 'awareness',
                'budget': 45000,
                'budget_type': 'fixed',
                'requirements': 'Console gaming content creators. Must own a PS5. Experience with game review content. Quality streaming/recording setup. Active YouTube/Instagram gaming presence.',
                'deliverables_required': [
                    {'type': 'Reel', 'count': 2},
                    {'type': 'Story', 'count': 5},
                    {'type': 'YouTube Video', 'count': 1}
                ],
                'min_followers': 20000,
                'hashtags': '#PlayStation #PS5 #Gaming #PlayStationIndia',
                'key_messages': 'Play Has No Limits. Available in India. Exclusive features.',
            },
        ]

        created_count = 0
        today = timezone.now().date()

        for i, campaign_data in enumerate(campaigns_data):
            # Assign to a random brand if multiple exist
            if demo_brands:
                if hasattr(demo_brands[0], 'user'):
                    brand = demo_brands[i % len(demo_brands)].user
                else:
                    brand = demo_brands[i % len(demo_brands)]
            else:
                self.stdout.write(self.style.ERROR('No brands available to assign campaigns'))
                return

            # Set realistic deadlines (2-6 weeks from now)
            deadline = today + timedelta(days=random.randint(14, 45))
            post_date = deadline + timedelta(days=random.randint(3, 10))

            try:
                campaign = Campaign.objects.create(
                    brand=brand,
                    title=campaign_data['title'],
                    description=campaign_data['description'],
                    category=campaign_data['category'],
                    objective=campaign_data.get('objective', 'awareness'),
                    budget=campaign_data['budget'],
                    budget_type=campaign_data.get('budget_type', 'negotiable'),
                    requirements=campaign_data['requirements'],
                    deliverables_required=campaign_data['deliverables_required'],
                    deadline=deadline,
                    post_date=post_date,
                    campaign_type=campaign_data.get('campaign_type', 'online'),
                    location=campaign_data.get('location', ''),
                    target_cities=campaign_data.get('target_cities', []),
                    target_gender=campaign_data.get('target_gender', 'all'),
                    min_followers=campaign_data.get('min_followers'),
                    max_followers=campaign_data.get('max_followers'),
                    target_niche=campaign_data.get('target_niche', ''),
                    hashtags=campaign_data.get('hashtags', ''),
                    key_messages=campaign_data.get('key_messages', ''),
                    status='active',
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {campaign.title}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to create {campaign_data["title"]}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {created_count} Indian brand campaigns!'))

    def create_demo_brands(self):
        """Create demo brand users and profiles if none exist"""
        from profiles.models import BrandProfile
        
        demo_brand_data = [
            {'email': 'myntra@demo.famesync.in', 'company': 'Myntra Fashion', 'industry': 'fashion'},
            {'email': 'nykaa@demo.famesync.in', 'company': 'Nykaa Beauty', 'industry': 'beauty'},
            {'email': 'swiggy@demo.famesync.in', 'company': 'Swiggy', 'industry': 'food'},
            {'email': 'boat@demo.famesync.in', 'company': 'boAt Lifestyle', 'industry': 'tech'},
            {'email': 'cultfit@demo.famesync.in', 'company': 'Cult.fit', 'industry': 'fitness'},
        ]
        
        created_brands = []
        for brand_data in demo_brand_data:
            user, created = User.objects.get_or_create(
                email=brand_data['email'],
                defaults={
                    'role': 'brand',
                    'is_approved': True,
                    'is_setup_complete': True,
                }
            )
            if created:
                user.set_password('demo123456')
                user.save()
                
            profile, _ = BrandProfile.objects.get_or_create(
                user=user,
                defaults={
                    'company_name': brand_data['company'],
                    'industry': brand_data['industry'],
                    'company_size': '500+',
                    'website': f'https://{brand_data["company"].lower().replace(" ", "")}.com',
                }
            )
            created_brands.append(user)
        
        return created_brands
