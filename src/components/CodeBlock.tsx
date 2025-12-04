import React from 'react';

interface CodeBlockProps {
	code: string;
	language: string;
	className?: string;
}

// A very simplified colorizer since we can't pull in Shiki/Prism in this specific environment constraints
// In a real app, we would just: import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
export const CodeBlock: React.FC<CodeBlockProps> = ({
	code,
	language,
	className = '',
}) => {
	return (
		<div
			className={`relative rounded-md bg-zinc-950 p-4 overflow-x-auto font-mono text-sm border border-zinc-800 ${className}`}>
			<div className='absolute right-2 top-2 text-xs text-zinc-500 uppercase select-none'>
				{language}
			</div>
			<pre className='leading-relaxed'>
				<code className='text-zinc-100 whitespace-pre'>{code}</code>
			</pre>
		</div>
	);
};
