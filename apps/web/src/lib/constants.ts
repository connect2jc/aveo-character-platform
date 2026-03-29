import { PricingPlan } from '@/types';

export const PLANS: Record<string, PricingPlan> = {
  starter: {
    name: 'Starter',
    price: 79,
    characters: 1,
    videos: 30,
    distribution: 'manual',
    features: [
      '1 AI character',
      '30 videos per month',
      'Basic script generation',
      'Manual publishing',
      'Email support',
      '720p video quality',
    ],
    cta: 'Start Free Trial',
  },
  growth: {
    name: 'Growth',
    price: 199,
    characters: 3,
    videos: 90,
    distribution: '2 platforms',
    highlighted: true,
    features: [
      '3 AI characters',
      '90 videos per month',
      'Advanced script generation',
      '2 platform auto-publish',
      'Content calendar',
      'Priority support',
      '1080p video quality',
      'A/B testing',
    ],
    cta: 'Start Free Trial',
  },
  pro: {
    name: 'Pro',
    price: 499,
    characters: 10,
    videos: 300,
    distribution: 'unlimited',
    features: [
      '10 AI characters',
      '300 videos per month',
      'Premium script generation',
      'Unlimited platform publishing',
      'Advanced content calendar',
      'Dedicated support',
      '4K video quality',
      'A/B testing',
      'Custom branding',
      'API access',
    ],
    cta: 'Contact Sales',
  },
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: 'music' },
  { id: 'youtube_shorts', name: 'YouTube Shorts', icon: 'youtube' },
  { id: 'instagram_reels', name: 'Instagram Reels', icon: 'instagram' },
] as const;

export const VIDEO_STATUSES = {
  queued: { label: 'Queued', color: 'bg-gray-500' },
  generating_audio: { label: 'Generating Audio', color: 'bg-blue-500' },
  generating_lipsync: { label: 'Lip Syncing', color: 'bg-purple-500' },
  compositing: { label: 'Compositing', color: 'bg-orange-500' },
  ready: { label: 'Ready', color: 'bg-green-500' },
  failed: { label: 'Failed', color: 'bg-red-500' },
} as const;

export const CHARACTER_NICHES = [
  'Finance & Investing',
  'Health & Fitness',
  'Tech & AI',
  'Cooking & Food',
  'Travel & Lifestyle',
  'Education & Learning',
  'Entertainment & Comedy',
  'Fashion & Beauty',
  'Business & Entrepreneurship',
  'Gaming',
  'Music',
  'Sports',
  'Other',
] as const;
