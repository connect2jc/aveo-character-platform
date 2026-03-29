'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHARACTER_NICHES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const steps = ['Basics', 'Appearance', 'Voice', 'Review'];

const basicSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  niche: z.string().min(1, 'Please select a niche'),
  description: z.string().optional(),
  target_audience: z.string().optional(),
  personality_traits: z.string().min(1, 'Add at least one trait'),
  speaking_style: z.string().optional(),
});

type BasicFormData = z.infer<typeof basicSchema>;

interface CharacterWizardProps {
  onSubmit: (data: BasicFormData) => void;
  isLoading?: boolean;
}

export function CharacterWizard({ onSubmit, isLoading }: CharacterWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BasicFormData>({
    resolver: zodResolver(basicSchema),
  });

  const formValues = watch();

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                index <= currentStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                'ml-2 text-sm font-medium',
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 w-12',
                  index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 0 && (
              <div className="space-y-4">
                <Input
                  label="Character Name"
                  placeholder="e.g., Alex Finance"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Select
                  label="Niche"
                  options={CHARACTER_NICHES.map((n) => ({ value: n, label: n }))}
                  placeholder="Select a niche"
                  error={errors.niche?.message}
                  {...register('niche')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Describe your character's background and purpose..."
                    {...register('description')}
                  />
                </div>
                <Input
                  label="Target Audience"
                  placeholder="e.g., Young professionals interested in investing"
                  {...register('target_audience')}
                />
                <Input
                  label="Personality Traits (comma separated)"
                  placeholder="e.g., Friendly, Knowledgeable, Witty"
                  error={errors.personality_traits?.message}
                  {...register('personality_traits')}
                />
                <Input
                  label="Speaking Style"
                  placeholder="e.g., Casual and conversational"
                  {...register('speaking_style')}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-900">
                    Upload a base image or generate one with AI
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG up to 10MB. Square images work best.
                  </p>
                  <Button type="button" variant="outline" className="mt-4">
                    Upload Image
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Select a voice for your character. You can preview each voice before selecting.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {['Professional Male', 'Professional Female', 'Casual Male', 'Casual Female', 'Energetic', 'Calm'].map(
                    (voice) => (
                      <button
                        key={voice}
                        type="button"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                          <span className="text-sm">🎙</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{voice}</p>
                          <p className="text-xs text-gray-500">Click to preview</p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Review your character</h4>
                <div className="rounded-lg bg-gray-50 p-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{formValues.name || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Niche</dt>
                      <dd className="text-sm text-gray-900">{formValues.niche || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Personality</dt>
                      <dd className="text-sm text-gray-900">{formValues.personality_traits || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Target Audience</dt>
                      <dd className="text-sm text-gray-900">{formValues.target_audience || 'Not set'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" isLoading={isLoading}>
                  Create Character
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
