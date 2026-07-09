-- Seed 6 SEO-focused blog posts to improve site content
INSERT INTO public.blog_posts (slug, title, excerpt, content, author, published, cover_image, created_at, updated_at)
VALUES
('corporate-gifting-trends-2026', 'Corporate Gifting Trends for 2026: What Buyers Want',
 'Key gifting trends for 2026: personalization, sustainability, and hybrid-work essentials.',
 '<p>Corporate gifting is evolving. In 2026 buyers favour personalised, sustainable gifts that support hybrid teams. This post explores top trends, product ideas, and how to align gifting with employer branding.</p>',
 'GiftSphere', true, null, NOW(), NOW()),

('measuring-roi-of-branded-gifts', 'Measuring ROI of Branded Gifts: Metrics That Matter',
 'How to track engagement, retention and conversion from branded gifting programs.',
 '<p>Branded gifts can drive awareness and loyalty — when measured correctly. Learn which metrics to track, how to set benchmarks, and case examples for ROI calculations.</p>',
 'GiftSphere', true, null, NOW(), NOW()),

('sustainable-corporate-gifts', 'Sustainable Corporate Gifts: Eco-friendly Options That Impress',
 'Choose sustainable materials and local sourcing to reduce carbon footprint and boost perception.',
 '<p>Sustainability is more than a buzzword. This guide lists vetted eco-friendly gift options, certification tips, and packaging strategies that reduce waste and resonate with recipients.</p>',
 'GiftSphere', true, null, NOW(), NOW()),

('personalisation-strategies-gifts', 'Personalisation Strategies for Corporate Gifts',
 'Practical ways to personalise at scale — engraving, curated bundles, and digital experiences.',
 '<p>Personalisation increases perceived value. Explore cost-effective techniques to personalise gifts at scale, including data-driven segmentation and sample templates.</p>',
 'GiftSphere', true, null, NOW(), NOW()),

('bulk-order-logistics-tips', 'Bulk Order Logistics: Simplifying Large-Scale Corporate Gifting',
 'Logistics guide for bulk orders: timelines, warehousing, and fulfillment partners.',
 '<p>Bulk gifting requires planning. This checklist covers lead times, packaging, fulfilment models and customs considerations for pan-India distribution.</p>',
 'GiftSphere', true, null, NOW(), NOW()),

('gift-program-best-practices', 'Gift Program Best Practices: From Brief to Delivery',
 'Build repeatable gifting programs with clear briefs, vendor SLAs and feedback loops.',
 '<p>Turn one-off gifts into repeatable programs. Learn how to create briefs, set SLAs with vendors, measure results and iterate based on feedback.</p>',
 'GiftSphere', true, null, NOW(), NOW());
