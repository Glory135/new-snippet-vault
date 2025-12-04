'use client';

import React, { useState } from 'react';
import { ViewMode, FilterState, User } from '@/types';
import { Button, Input } from './UIComponents';
import { LANGUAGES } from '@/constants';
import { LogIn } from 'lucide-react';

interface LayoutProps {
	children: React.ReactNode;
	currentView: ViewMode;
	onChangeView: (view: ViewMode) => void;
	filter: FilterState;
	onFilterChange: (filter: FilterState) => void;
	user: User | null;
	onLogout: () => void;
}

interface SidebarItemProps {
	active: boolean;
	children: React.ReactNode;
	onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
	active,
	children,
	onClick,
}) => (
	<button
		onClick={onClick}
		className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
			active
				? 'bg-secondary text-secondary-foreground'
				: 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
		}`}>
		{children}
	</button>
);

export const Layout: React.FC<LayoutProps> = ({
	children,
	currentView,
	onChangeView,
	filter,
	onFilterChange,
	user,
	onLogout,
}) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const renderSidebarContent = () => (
		<>
			<div className='h-16 px-6 border-b border-border flex items-center'>
				<h1 className='text-xl font-bold flex items-center gap-2'>
					<span className='text-indigo-500'>⚡</span> SnippetVault
				</h1>
			</div>

			<div className='flex-1 p-4 space-y-6 overflow-y-auto'>
				<div className='space-y-1'>
					<h3 className='px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
						Library
					</h3>
					<SidebarItem
						active={currentView === 'LIST' && !filter.favoritesOnly}
						onClick={() => {
							onFilterChange({
								...filter,
								favoritesOnly: false,
							});
							onChangeView('LIST');
							setSidebarOpen(false); // Close sidebar on mobile
						}}>
						All Snippets
					</SidebarItem>
					<SidebarItem
						active={currentView === 'LIST' && filter.favoritesOnly}
						onClick={() => {
							onFilterChange({
								...filter,
								favoritesOnly: true,
							});
							onChangeView('LIST');
							setSidebarOpen(false); // Close sidebar on mobile
						}}>
						Favorites
					</SidebarItem>
				</div>

				<div className='space-y-1'>
					<h3 className='px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
						Languages
					</h3>
					<SidebarItem
						active={filter.language === 'ALL'}
						onClick={() =>
							onFilterChange({ ...filter, language: 'ALL' })
						}>
						All Languages
					</SidebarItem>
					{LANGUAGES.slice(0, 5).map((lang) => (
						<SidebarItem
							key={lang.value}
							active={filter.language === lang.value}
							onClick={() =>
								onFilterChange({
									...filter,
									language: lang.value,
								})
							}>
							{lang.label}
						</SidebarItem>
					))}
				</div>
			</div>

			<div className='p-4 border-t border-border'>
				{user ? (
					<div className='flex items-center justify-between px-2'>
						<div className='flex items-center gap-3'>
							<img
								src={user.image || ''}
								alt={user.name || ''}
								className='h-8 w-8 rounded-full border border-indigo-500/50'
							/>
							<div className='text-sm overflow-hidden'>
								<div className='font-medium truncate w-24'>
									{user.name}
								</div>
							</div>
						</div>
						<Button
							variant='ghost'
							size='icon'
							onClick={onLogout}
							title='Logout'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'>
								<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
								<polyline points='16 17 21 12 16 7' />
								<line x1='21' x2='9' y1='12' y2='12' />
							</svg>
						</Button>
					</div>
				) : (
					<Button
						variant='secondary'
						className='w-full flex items-center justify-center gap-1'
						onClick={() => onChangeView('LOGIN')}>
						<LogIn size={16} /> <p>Sign In</p>
					</Button>
				)}
			</div>
		</>
	);

	return (
		<div className='min-h-screen relative bg-background text-foreground md:flex'>
			{/* Mobile Sidebar Overlay */}
			<div
				className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${
					sidebarOpen
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				}`}
				onClick={() => setSidebarOpen(false)}></div>

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-screen w-64 border-r border-border flex flex-col bg-background z-30 transform transition-transform md:relative md:translate-x-0 ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				}`}>
				{renderSidebarContent()}
			</aside>

			{/* Main Content */}
			<main className='flex-1 flex flex-col min-w-0'>
				{/* Header */}
				<header className='h-16 border-b border-border px-4 sm:px-6 md:px-8 flex items-center justify-between bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10'>
					<div className='flex items-center gap-2'>
						{/* Hamburger Menu for Mobile */}
						<Button
							variant='ghost'
							size='icon'
							className='md:hidden'
							onClick={() => setSidebarOpen(true)}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'>
								<line x1='3' y1='12' x2='21' y2='12' />
								<line x1='3' y1='6' x2='21' y2='6' />
								<line x1='3' y1='18' x2='21' y2='18' />
							</svg>
						</Button>

						{/* Search Input */}
						<div className='w-full max-w-xs'>
							<Input
								placeholder='Search snippets...'
								value={filter.search}
								onChange={(e) =>
									onFilterChange({
										...filter,
										search: e.target.value,
									})
								}
								className='bg-secondary/50 border-transparent focus:bg-background focus:border-ring'
							/>
						</div>
					</div>
					<div className='flex items-center gap-4'>
						<Button
							variant='primary'
							onClick={() => onChangeView('CREATE')}>
							<span className='sm:hidden'>+</span>
							<span className='hidden sm:inline'>
								+ New Snippet
							</span>
						</Button>
					</div>
				</header>

				<div className='flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative'>
					{children}
				</div>
			</main>
		</div>
	);
};
