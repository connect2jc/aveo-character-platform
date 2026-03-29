'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================
// Schema
// ============================================================

const wizardSchema = z.object({
  // Step 1: Niche
  niche: z.string().min(1, 'Please select a niche'),
  // Step 2: Audience
  age_range_min: z.number().min(13).max(65),
  age_range_max: z.number().min(18).max(80),
  pain_points: z.array(z.string()).min(1, 'Select at least one pain point'),
  desires: z.string().optional(),
  // Step 3: Character Concept
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18).max(80),
  gender: z.string().min(1, 'Please select a gender'),
  emotional_role: z.string().min(1, 'Please select an emotional role'),
  // Step 4: Tone & Personality
  warmth: z.number().min(0).max(100),
  energy: z.number().min(0).max(100),
  authority: z.number().min(0).max(100),
  personality_tags: z.array(z.string()).min(1, 'Add at least one personality tag'),
});

type WizardFormData = z.infer<typeof wizardSchema>;

// ============================================================
// Constants
// ============================================================

const STEPS = [
  { title: 'Niche', description: 'Choose your content niche' },
  { title: 'Audience', description: 'Define your target audience' },
  { title: 'Character', description: 'Shape your character' },
  { title: 'Personality', description: 'Set tone and style' },
  { title: 'Review', description: 'Review and generate' },
];

const NICHES = [
  { id: 'health', label: 'Health & Fitness', icon: '💪', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  { id: 'finance', label: 'Finance & Investing', icon: '📈', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { id: 'spirituality', label: 'Spirituality & Mindset', icon: '🧘', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
  { id: 'tech', label: 'Tech & AI', icon: '🤖', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30' },
  { id: 'relationships', label: 'Relationships', icon: '💕', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  { id: 'business', label: 'Business & Entrepreneurship', icon: '🚀', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30' },
  { id: 'education', label: 'Education & Learning', icon: '📚', color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30' },
  { id: 'cooking', label: 'Cooking & Food', icon: '🍳', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
  { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️', color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30' },
  { id: 'fashion', label: 'Fashion & Beauty', icon: '👗', color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
  { id: 'entertainment', label: 'Entertainment & Comedy', icon: '😂', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' },
];

const PAIN_POINTS: Record<string, string[]> = {
  health: ['Weight loss struggles', 'Low energy levels', 'Poor sleep quality', 'Injury recovery', 'Nutrition confusion', 'Lack of motivation'],
  finance: ['Living paycheck to paycheck', 'Investment confusion', 'Debt management', 'Retirement planning', 'Tax optimization', 'Side income ideas'],
  spirituality: ['Stress and anxiety', 'Feeling disconnected', 'Lack of purpose', 'Meditation difficulty', 'Negative thought patterns', 'Burnout recovery'],
  tech: ['Keeping up with AI', 'Career switching', 'Learning to code', 'Tool overwhelm', 'Privacy concerns', 'Automation anxiety'],
  relationships: ['Communication issues', 'Trust building', 'Dating confidence', 'Long distance struggles', 'Conflict resolution', 'Self love journey'],
  business: ['Getting first customers', 'Scaling challenges', 'Time management', 'Pricing strategy', 'Team building', 'Marketing on a budget'],
  education: ['Study habits', 'Information overload', 'Exam anxiety', 'Career clarity', 'Skill gap', 'Learning disabilities'],
  cooking: ['Meal planning', 'Healthy eating on budget', 'Time saving recipes', 'Dietary restrictions', 'Cooking for beginners', 'Meal prep routines'],
  travel: ['Budget travel', 'Solo travel safety', 'Packing efficiently', 'Finding hidden gems', 'Travel with kids', 'Remote work travel'],
  fashion: ['Dressing for body type', 'Budget style', 'Building a capsule wardrobe', 'Skin care routine', 'Seasonal transitions', 'Sustainable fashion'],
  gaming: ['Improving skills', 'Finding community', 'Stream setup', 'Game recommendations', 'Balancing gaming and life', 'Competitive anxiety'],
  entertainment: ['Content creation tips', 'Finding your humor style', 'Stage fright', 'Writing jokes', 'Improv skills', 'Growing an audience'],
};

const EMOTIONAL_ROLES = [
  { value: 'mentor', label: 'Mentor', description: 'Guides and teaches with experience' },
  { value: 'healer', label: 'Healer', description: 'Soothes and nurtures emotional wellbeing' },
  { value: 'motivator', label: 'Motivator', description: 'Energizes and pushes toward action' },
  { value: 'rebel', label: 'Rebel', description: 'Challenges norms and speaks hard truths' },
  { value: 'sage', label: 'Sage', description: 'Offers deep wisdom and perspective' },
  { value: 'friend', label: 'Friend', description: 'Relatable, casual, and supportive' },
];

const PERSONALITY_TAG_OPTIONS = [
  'Warm', 'Witty', 'Empathetic', 'Bold', 'Analytical', 'Playful',
  'Inspirational', 'Direct', 'Nurturing', 'Sarcastic', 'Calm',
  'Energetic', 'Professional', 'Casual', 'Provocative', 'Gentle',
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non binary' },
];

// ============================================================
// Sub Components
// ============================================================

function StepProgress({ currentStep, steps }: { currentStep: number; steps: typeof STEPS }) {
  return (
    <div className="mb-10">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-1 w-full rounded-full bg-gray-800">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                index < currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : index === currentStep
                  ? 'bg-purple-600 text-white ring-4 ring-purple-600/20'
                  : 'bg-gray-800 text-gray-500'
              )}
            >
              {index < currentStep ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                'mt-2 hidden text-xs font-medium sm:block',
                index <= currentStep ? 'text-white' : 'text-gray-600'
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NicheStep({
  selectedNiche,
  onSelect,
  error,
}: {
  selectedNiche: string;
  onSelect: (niche: string) => void;
  error?: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">What niche is your character in?</h2>
      <p className="mt-2 text-gray-400">
        Choose the content category your character will focus on. This shapes the audience and script style.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {NICHES.map((niche) => (
          <button
            key={niche.id}
            type="button"
            onClick={() => onSelect(niche.id)}
            className={cn(
              'group flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-300',
              selectedNiche === niche.id
                ? `bg-gradient-to-br ${niche.color} border-purple-500/50 ring-2 ring-purple-500/30`
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
            )}
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{niche.icon}</span>
            <span className={cn(
              'text-sm font-medium',
              selectedNiche === niche.id ? 'text-white' : 'text-gray-400'
            )}>
              {niche.label}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function AudienceStep({
  ageMin,
  ageMax,
  painPoints,
  desires,
  niche,
  onAgeMinChange,
  onAgeMaxChange,
  onPainPointsChange,
  onDesiresChange,
  painPointError,
}: {
  ageMin: number;
  ageMax: number;
  painPoints: string[];
  desires: string;
  niche: string;
  onAgeMinChange: (v: number) => void;
  onAgeMaxChange: (v: number) => void;
  onPainPointsChange: (v: string[]) => void;
  onDesiresChange: (v: string) => void;
  painPointError?: string;
}) {
  const availablePainPoints = PAIN_POINTS[niche] || PAIN_POINTS.health;

  const togglePainPoint = (point: string) => {
    if (painPoints.includes(point)) {
      onPainPointsChange(painPoints.filter((p) => p !== point));
    } else {
      onPainPointsChange([...painPoints, point]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Who is your audience?</h2>
      <p className="mt-2 text-gray-400">
        Define the people your character will speak to. This shapes the tone, topics, and hooks.
      </p>

      <div className="mt-8 space-y-8">
        {/* Age range */}
        <div>
          <label className="mb-4 block text-sm font-medium text-gray-300">
            Age Range: {ageMin} to {ageMax}
          </label>
          <div className="grid grid-cols-2 gap-6">
            <Slider
              label="Minimum age"
              value={ageMin}
              onChange={onAgeMinChange}
              min={13}
              max={65}
            />
            <Slider
              label="Maximum age"
              value={ageMax}
              onChange={onAgeMaxChange}
              min={18}
              max={80}
            />
          </div>
        </div>

        {/* Pain points */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">
            Audience pain points (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availablePainPoints.map((point) => (
              <button
                key={point}
                type="button"
                onClick={() => togglePainPoint(point)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200',
                  painPoints.includes(point)
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300'
                )}
              >
                {point}
              </button>
            ))}
          </div>
          {painPointError && <p className="mt-2 text-sm text-red-400">{painPointError}</p>}
        </div>

        {/* Desires */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            What does your audience desire? (optional)
          </label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            rows={3}
            placeholder="e.g., Financial freedom, better health, meaningful relationships..."
            value={desires}
            onChange={(e) => onDesiresChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function CharacterConceptStep({
  register,
  errors,
  emotionalRole,
  onEmotionalRoleChange,
  gender,
  onGenderChange,
  age,
  onAgeChange,
}: {
  register: ReturnType<typeof useForm<WizardFormData>>['register'];
  errors: Record<string, { message?: string }>;
  emotionalRole: string;
  onEmotionalRoleChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
  age: number;
  onAgeChange: (v: number) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Design your character</h2>
      <p className="mt-2 text-gray-400">
        Give your character an identity. This defines how they appear and connect with your audience.
      </p>

      <div className="mt-8 space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Character Name</label>
          <input
            className={cn(
              'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
              errors.name && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
            )}
            placeholder="e.g., Dr. Alex, Coach Maya, Chef Riku"
            {...register('name')}
          />
          {errors.name?.message && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>

        {/* Age */}
        <div>
          <Slider
            label={`Character Age: ${age}`}
            value={age}
            onChange={onAgeChange}
            min={18}
            max={80}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">Gender</label>
          <div className="flex gap-3">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => onGenderChange(g.value)}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200',
                  gender === g.value
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          {errors.gender?.message && <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>}
        </div>

        {/* Emotional Role */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">Emotional Role</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EMOTIONAL_ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => onEmotionalRoleChange(role.value)}
                className={cn(
                  'flex flex-col rounded-lg border p-4 text-left transition-all duration-200',
                  emotionalRole === role.value
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold',
                  emotionalRole === role.value ? 'text-purple-300' : 'text-gray-300'
                )}>
                  {role.label}
                </span>
                <span className="mt-1 text-xs text-gray-500">{role.description}</span>
              </button>
            ))}
          </div>
          {errors.emotional_role?.message && <p className="mt-1 text-sm text-red-400">{errors.emotional_role.message}</p>}
        </div>
      </div>
    </div>
  );
}

function PersonalityStep({
  warmth,
  energy,
  authority,
  tags,
  onWarmthChange,
  onEnergyChange,
  onAuthorityChange,
  onTagsChange,
  tagError,
}: {
  warmth: number;
  energy: number;
  authority: number;
  tags: string[];
  onWarmthChange: (v: number) => void;
  onEnergyChange: (v: number) => void;
  onAuthorityChange: (v: number) => void;
  onTagsChange: (v: string[]) => void;
  tagError?: string;
}) {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const getSliderLabel = (value: number, low: string, high: string) => {
    if (value < 33) return low;
    if (value > 66) return high;
    return 'Balanced';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Set the tone and personality</h2>
      <p className="mt-2 text-gray-400">
        Fine tune how your character sounds and feels. These sliders shape the script style and delivery.
      </p>

      <div className="mt-8 space-y-8">
        {/* Sliders */}
        <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Warmth</span>
              <span className="text-xs text-purple-400">{getSliderLabel(warmth, 'Professional', 'Very Warm')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Cool</span>
              <Slider value={warmth} onChange={onWarmthChange} min={0} max={100} showValue={false} className="flex-1" />
              <span className="text-xs text-gray-600">Warm</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Energy</span>
              <span className="text-xs text-purple-400">{getSliderLabel(energy, 'Calm', 'High Energy')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Low</span>
              <Slider value={energy} onChange={onEnergyChange} min={0} max={100} showValue={false} className="flex-1" />
              <span className="text-xs text-gray-600">High</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Authority</span>
              <span className="text-xs text-purple-400">{getSliderLabel(authority, 'Approachable', 'Authoritative')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Peer</span>
              <Slider value={authority} onChange={onAuthorityChange} min={0} max={100} showValue={false} className="flex-1" />
              <span className="text-xs text-gray-600">Expert</span>
            </div>
          </div>
        </div>

        {/* Personality tags */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">
            Personality keywords (select at least 1)
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                  tags.includes(tag)
                    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-400'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {tagError && <p className="mt-2 text-sm text-red-400">{tagError}</p>}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: Partial<WizardFormData> }) {
  const nicheName = NICHES.find((n) => n.id === data.niche)?.label || data.niche || 'Not set';
  const roleName = EMOTIONAL_ROLES.find((r) => r.value === data.emotional_role)?.label || data.emotional_role || 'Not set';
  const genderName = GENDERS.find((g) => g.value === data.gender)?.label || data.gender || 'Not set';

  const sections = [
    {
      title: 'Niche & Audience',
      items: [
        { label: 'Niche', value: nicheName },
        { label: 'Age Range', value: `${data.age_range_min || 18} to ${data.age_range_max || 45}` },
        { label: 'Pain Points', value: (data.pain_points || []).join(', ') || 'None selected' },
        { label: 'Audience Desires', value: data.desires || 'Not specified' },
      ],
    },
    {
      title: 'Character',
      items: [
        { label: 'Name', value: data.name || 'Not set' },
        { label: 'Age', value: String(data.age || 30) },
        { label: 'Gender', value: genderName },
        { label: 'Emotional Role', value: roleName },
      ],
    },
    {
      title: 'Personality',
      items: [
        { label: 'Warmth', value: `${data.warmth || 60}/100` },
        { label: 'Energy', value: `${data.energy || 50}/100` },
        { label: 'Authority', value: `${data.authority || 70}/100` },
        { label: 'Keywords', value: (data.personality_tags || []).join(', ') || 'None selected' },
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Review your character</h2>
      <p className="mt-2 text-gray-400">
        Review the details below. Click Generate to create your character profile using AI.
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-400">{section.title}</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-300">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Wizard
// ============================================================

interface CharacterWizardProps {
  onSubmit: (data: WizardFormData) => void;
  isLoading?: boolean;
}

export function CharacterWizard({ onSubmit, isLoading }: CharacterWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      niche: '',
      age_range_min: 18,
      age_range_max: 45,
      pain_points: [],
      desires: '',
      name: '',
      age: 30,
      gender: '',
      emotional_role: '',
      warmth: 60,
      energy: 50,
      authority: 70,
      personality_tags: [],
    },
  });

  const formValues = watch();

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger('niche');
      case 1:
        return await trigger(['age_range_min', 'age_range_max', 'pain_points']);
      case 2:
        return await trigger(['name', 'age', 'gender', 'emotional_role']);
      case 3:
        return await trigger(['warmth', 'energy', 'authority', 'personality_tags']);
      default:
        return true;
    }
  }, [trigger]);

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <StepProgress currentStep={currentStep} steps={STEPS} />

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Niche */}
            {currentStep === 0 && (
              <NicheStep
                selectedNiche={formValues.niche}
                onSelect={(niche) => setValue('niche', niche, { shouldValidate: true })}
                error={errors.niche?.message}
              />
            )}

            {/* Step 2: Audience */}
            {currentStep === 1 && (
              <AudienceStep
                ageMin={formValues.age_range_min}
                ageMax={formValues.age_range_max}
                painPoints={formValues.pain_points}
                desires={formValues.desires || ''}
                niche={formValues.niche}
                onAgeMinChange={(v) => setValue('age_range_min', v)}
                onAgeMaxChange={(v) => setValue('age_range_max', v)}
                onPainPointsChange={(v) => setValue('pain_points', v, { shouldValidate: true })}
                onDesiresChange={(v) => setValue('desires', v)}
                painPointError={errors.pain_points?.message}
              />
            )}

            {/* Step 3: Character Concept */}
            {currentStep === 2 && (
              <CharacterConceptStep
                register={register}
                errors={errors as Record<string, { message?: string }>}
                emotionalRole={formValues.emotional_role}
                onEmotionalRoleChange={(v) => setValue('emotional_role', v, { shouldValidate: true })}
                gender={formValues.gender}
                onGenderChange={(v) => setValue('gender', v, { shouldValidate: true })}
                age={formValues.age}
                onAgeChange={(v) => setValue('age', v)}
              />
            )}

            {/* Step 4: Personality */}
            {currentStep === 3 && (
              <PersonalityStep
                warmth={formValues.warmth}
                energy={formValues.energy}
                authority={formValues.authority}
                tags={formValues.personality_tags}
                onWarmthChange={(v) => setValue('warmth', v)}
                onEnergyChange={(v) => setValue('energy', v)}
                onAuthorityChange={(v) => setValue('authority', v)}
                onTagsChange={(v) => setValue('personality_tags', v, { shouldValidate: true })}
                tagError={errors.personality_tags?.message}
              />
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && <ReviewStep data={formValues} />}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-white/10 bg-transparent text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
                >
                  Continue
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate Character
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
