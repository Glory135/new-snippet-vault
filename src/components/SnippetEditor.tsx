'use client';

import React, { useState } from 'react';
import { CreateSnippetDTO, Snippet, SnippetLanguage } from '@/types';
import { Button, Input, Textarea } from './UIComponents';
import { LANGUAGES } from '@/constants';
import { generateCodeSnippet } from '@/services/geminiService';

interface SnippetEditorProps {
	initialData?: Snippet;
	onSave: (data: CreateSnippetDTO) => void;
	onCancel: () => void;
}

export const SnippetEditor: React.FC<SnippetEditorProps> = ({
	initialData,
	onSave,
	onCancel,
}) => {
	const [title, setTitle] = useState(initialData?.title || '');
	const [description, setDescription] = useState(
		initialData?.description || ''
	);
	const [code, setCode] = useState(initialData?.code || '');
	const [language, setLanguage] = useState<SnippetLanguage>(
		initialData?.language || SnippetLanguage.TypeScript
	);
	const [tags, setTags] = useState(initialData?.tags.join(', ') || '');

	// AI State
	const [isGenerating, setIsGenerating] = useState(false);
	const [aiPrompt, setAiPrompt] = useState('');
	const [showAiPrompt, setShowAiPrompt] = useState(false);

	const handleSave = () => {
		onSave({
			title,
			description,
			code,
			language,
			tags: tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
		});
	};

	const handleGenerate = async () => {
		if (!aiPrompt) return;
		setIsGenerating(true);
		const generated = await generateCodeSnippet(aiPrompt, language);
		setCode(generated);
		setIsGenerating(false);
		setShowAiPrompt(false);
		// Auto-fill description if empty
		if (!description) setDescription(aiPrompt);
	};

	return (
		<div className='space-y-6 max-w-4xl mx-auto p-1'>
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
				<h2 className='text-2xl font-bold tracking-tight'>
					{initialData ? 'Edit Snippet' : 'New Snippet'}
				</h2>
				<div className='flex gap-2 w-full sm:w-auto'>
					<Button
						variant='ghost'
						onClick={onCancel}
						className='flex-1 sm:flex-initial'>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						className='flex-1 sm:flex-initial'>
						Save Snippet
					</Button>
				</div>
			</div>

			<div className='grid gap-6'>
				<div className='grid gap-2'>
					<label htmlFor='title' className='text-sm font-medium'>
						Title
					</label>
					<Input
						id='title'
						placeholder='e.g., React UseEffect Fetch'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div className='grid gap-2'>
						<label
							htmlFor='language'
							className='text-sm font-medium'>
							Language
						</label>
						<select
							id='language'
							className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
							value={language}
							onChange={(e) =>
								setLanguage(e.target.value as SnippetLanguage)
							}>
							{LANGUAGES.map((lang) => (
								<option key={lang.value} value={lang.value}>
									{lang.label}
								</option>
							))}
						</select>
					</div>
					<div className='grid gap-2'>
						<label htmlFor='tags' className='text-sm font-medium'>
							Tags (comma separated)
						</label>
						<Input
							id='tags'
							placeholder='react, hooks, api'
							value={tags}
							onChange={(e) => setTags(e.target.value)}
						/>
					</div>
				</div>

				<div className='grid gap-2'>
					<label
						htmlFor='description'
						className='text-sm font-medium'>
						Description
					</label>
					<Textarea
						id='description'
						placeholder='What does this code do?'
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				<div className='grid gap-2 relative'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
						<label htmlFor='code' className='text-sm font-medium'>
							Code
						</label>
						<Button
							type='button'
							variant='secondary'
							size='sm'
							onClick={() => setShowAiPrompt(!showAiPrompt)}>
							✨ Generate with AI
						</Button>
					</div>

					{showAiPrompt && (
						<div className='mt-2 mb-4 p-4 rounded-md border border-indigo-500/30 bg-indigo-500/10 animate-in fade-in zoom-in duration-200'>
							<div className='flex flex-col sm:flex-row gap-2'>
								<Input
									placeholder="Describe the code you need (e.g., 'Binary search implementation')"
									value={aiPrompt}
									onChange={(e) =>
										setAiPrompt(e.target.value)
									}
									onKeyDown={(e) =>
										e.key === 'Enter' && handleGenerate()
									}
									autoFocus
								/>
								<Button
									onClick={handleGenerate}
									disabled={isGenerating || !aiPrompt}
									className='mt-2 sm:mt-0'>
									{isGenerating ? 'Thinking...' : 'Generate'}
								</Button>
							</div>
						</div>
					)}

					<Textarea
						id='code'
						className='font-mono min-h-[300px] bg-zinc-950 text-zinc-100 border-zinc-800'
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder='// Type or paste your code here...'
						spellCheck={false}
					/>
				</div>
			</div>
		</div>
	);
};
