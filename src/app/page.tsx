'use client';

import React, { useState, useEffect } from 'react';
import {
	Snippet,
	ViewMode,
	FilterState,
	CreateSnippetDTO,
	User,
} from '@/types';
import {
	getSnippets,
	createSnippet,
	updateSnippet,
	deleteSnippet,
	toggleFavorite,
	syncLocalToCloud,
} from '@/services/storageService';
import { login, logout } from '@/services/authService';
import { explainCode } from '@/services/geminiService';
import { Layout } from '@/components/Layout';
import { SnippetEditor } from '@/components/SnippetEditor';
import { CodeBlock } from '@/components/CodeBlock';
import { Button, Badge, Card } from '@/components/UIComponents';
import { LoginBanner } from '@/components/LoginBanner';
import { useSession } from '@/lib/auth-client';

import { subscribeUser, unsubscribeUser, sendNotification } from './actions';

export default function Home() {
	// Real Auth Session
	const { data: session, isPending } = useSession();

	const [user, setUser] = useState<User | null>(null);
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [view, setView] = useState<ViewMode>('LIST');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);

	// AI State
	const [explanation, setExplanation] = useState<string | null>(null);
	const [explaining, setExplaining] = useState(false);

	const [filter, setFilter] = useState<FilterState>({
		search: '',
		language: 'ALL',
		favoritesOnly: false,
	});

	// --- EFFECT: Handle Real Auth Session Sync ---
	useEffect(() => {
		// If we are using real API and NextAuth has a session, sync it to our app state
		if (session && session?.user) {
			const authenticatedUser: User = {
				id: (session.user as any).id || 'unknown',
				name: session.user.name || 'User',
				email: session.user.email || '',
				image: session.user.image || undefined,
			};

			// If we just logged in (user state was null), trigger sync
			if (!user) {
				handlePostLoginSync(authenticatedUser);
			}
		}
	}, [session, user]);

	// Initial Load
	useEffect(() => {
		// Only load initial data if we aren't waiting for a real session
		if (!isPending) {
			loadData();
		}
	}, [user, isPending]);

	const loadData = async () => {
		setLoading(true);
		try {
			const data = await getSnippets(user);
			setSnippets(data);
		} catch (err) {
			console.error('Failed to load snippets', err);
		}
		setLoading(false);
	};

	const handlePostLoginSync = async (loggedInUser: User) => {
		setSyncing(true);
		try {
			await syncLocalToCloud(loggedInUser);
			setUser(loggedInUser);
			await loadData(); // Reload to get cloud snippets
			setView('LIST');
		} catch (error) {
			console.error('Sync failed', error);
		} finally {
			setSyncing(false);
		}
	};

	// --- Auth Logic (Manual / Mock) ---

	const handleLogin = async (provider: 'google' | 'github') => {
		try {
			// If false, it returns a mock user immediately.
			await login(provider);
		} catch (error) {
			console.error('Login failed', error);
		}
	};

	const handleLogout = async () => {
		await logout();
		setUser(null);
		setView('LIST');
		setSnippets([]); // clear sensitive data
		// In Real mode, logout() redirects, so we might not reach here, which is fine.
		loadData(); // reload local snippets if any
	};

	// --- CRUD Operations ---

	const handleCreate = async (data: CreateSnippetDTO) => {
		await createSnippet(data, user);
		await loadData();
		setView('LIST');
	};

	const handleUpdate = async (data: CreateSnippetDTO) => {
		if (selectedId) {
			await updateSnippet(selectedId, data, user);
			await loadData();
			setView('DETAIL');
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure?')) {
			await deleteSnippet(id, user);
			await loadData();
			if (selectedId === id) {
				setSelectedId(null);
				setView('LIST');
			}
		}
	};

	const handleFavorite = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		await toggleFavorite(id, user);
		await loadData();
	};

	// --- AI ---

	const handleExplain = async (code: string) => {
		setExplaining(true);
		setExplanation(null);
		const text = await explainCode(code);
		setExplanation(text);
		setExplaining(false);
	};

	// --- Filtering ---

	const filteredSnippets = snippets.filter((s) => {
		const matchesSearch =
			s.title.toLowerCase().includes(filter.search.toLowerCase()) ||
			s.tags.some((t) => t.includes(filter.search.toLowerCase()));
		const matchesLang =
			filter.language === 'ALL' || s.language === filter.language;
		const matchesFav = !filter.favoritesOnly || s.isFavorite;
		return matchesSearch && matchesLang && matchesFav;
	});

	const selectedSnippet = snippets.find((s) => s.id === selectedId);

	// --- Render Helpers ---

	const renderLoginView = () => (
		<div className='max-w-md mx-auto mt-10 sm:mt-20 text-center space-y-6 animate-in fade-in zoom-in duration-300 p-4'>
			<div className='space-y-2'>
				<h2 className='text-3xl font-bold'>Welcome Back</h2>
				<p className='text-muted-foreground'>
					Sign in to sync your snippets to the cloud.
				</p>
			</div>
			<Card className='p-6 space-y-4'>
				<Button
					variant='outline'
					className='w-full h-12 gap-3 text-base'
					onClick={() => handleLogin('google')}>
					<span className='text-lg'>G</span> Continue with Google
				</Button>
				<Button
					variant='outline'
					className='w-full h-12 gap-3 text-base'
					onClick={() => handleLogin('github')}>
					<span className='text-lg'>⌘</span> Continue with GitHub
				</Button>
			</Card>
			<button
				onClick={() => setView('LIST')}
				className='text-sm text-muted-foreground hover:underline'>
				Continue as Guest (Offline Mode)
			</button>
		</div>
	);

	const renderContent = () => {
		if (syncing) {
			return (
				<div className='flex flex-col h-full items-center justify-center space-y-4'>
					<div className='w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
					<p className='text-muted-foreground'>
						Syncing local snippets to cloud...
					</p>
				</div>
			);
		}

		if (view === 'LOGIN') return renderLoginView();

		if (view === 'CREATE') {
			return (
				<SnippetEditor
					onSave={handleCreate}
					onCancel={() => setView('LIST')}
				/>
			);
		}

		if (view === 'EDIT' && selectedSnippet) {
			return (
				<SnippetEditor
					initialData={selectedSnippet}
					onSave={handleUpdate}
					onCancel={() => setView('DETAIL')}
				/>
			);
		}

		if (view === 'DETAIL' && selectedSnippet) {
			return (
				<div className='max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300'>
					<div className='flex flex-col md:flex-row items-start justify-between gap-4'>
						<div>
							<div className='flex items-center gap-3 mb-2'>
								<h1 className='text-2xl md:text-3xl font-bold text-foreground'>
									{selectedSnippet.title}
								</h1>
								<Badge>{selectedSnippet.language}</Badge>
							</div>
							<div className='flex flex-wrap gap-2'>
								{selectedSnippet.tags.map((tag) => (
									<span
										key={tag}
										className='text-xs text-muted-foreground'>
										#{tag}
									</span>
								))}
							</div>
						</div>
						<div className='flex gap-2 w-full md:w-auto'>
							<Button
								variant='secondary'
								onClick={() => setView('LIST')}
								className='flex-1 md:flex-initial'>
								Back
							</Button>
							<Button
								variant='primary'
								onClick={() => setView('EDIT')}
								className='flex-1 md:flex-initial'>
								Edit
							</Button>
							<Button
								variant='destructive'
								onClick={() => handleDelete(selectedSnippet.id)}
								className='flex-1 md:flex-initial'>
								Delete
							</Button>
						</div>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						<div className='lg:col-span-2 space-y-4'>
							<CodeBlock
								code={selectedSnippet.code}
								language={selectedSnippet.language}
							/>
						</div>
						<div className='space-y-6'>
							<Card className='p-4 space-y-4'>
								<h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
									Description
								</h3>
								<p className='text-sm leading-relaxed'>
									{selectedSnippet.description ||
										'No description provided.'}
								</p>
							</Card>

							<Card className='p-4 space-y-4 bg-indigo-500/5 border-indigo-500/20'>
								<div className='flex items-center justify-between'>
									<h3 className='font-semibold text-sm text-indigo-400 uppercase tracking-wider'>
										AI Analysis
									</h3>
									<Button
										size='sm'
										variant='ghost'
										onClick={() =>
											handleExplain(selectedSnippet.code)
										}
										disabled={explaining}>
										{explaining
											? 'Analyzing...'
											: 'Explain Code'}
									</Button>
								</div>
								{explanation && (
									<div className='text-sm leading-relaxed animate-in fade-in'>
										{explanation}
									</div>
								)}
							</Card>
						</div>
					</div>
				</div>
			);
		}

		// List View
		return (
			<div className='space-y-6'>
				{!user && snippets.length > 0 && (
					<LoginBanner onLoginClick={() => setView('LOGIN')} />
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
					{filteredSnippets.length === 0 ? (
						<div className='col-span-full text-center py-20 text-muted-foreground'>
							<p className='text-lg'>No snippets found.</p>
							<Button
								variant='ghost'
								onClick={() =>
									setFilter({
										...filter,
										search: '',
										language: 'ALL',
									})
								}>
								Clear filters
							</Button>
						</div>
					) : (
						filteredSnippets.map((snippet) => (
							<Card
								key={snippet.id}
								onClick={() => {
									setSelectedId(snippet.id);
									setView('DETAIL');
								}}
								className='flex flex-col overflow-hidden group transition-all hover:shadow-lg hover:shadow-primary/5 border-border/50 hover:border-primary/20'>
								<div className='p-4 border-b border-border bg-card flex justify-between items-start'>
									<div className='space-y-1 w-full'>
										<h3 className='font-semibold truncate group-hover:text-primary transition-colors pr-2'>
											{snippet.title}
										</h3>
										<div className='text-xs text-muted-foreground flex gap-2'>
											<span className='capitalize'>
												{snippet.language}
											</span>
											<span>•</span>
											<span>
												{new Date(
													snippet.updatedAt
												).toLocaleDateString()}
											</span>
										</div>
									</div>
									<button
										onClick={(e) =>
											handleFavorite(e, snippet.id)
										}
										className={`text-lg transition-transform hover:scale-110 ${
											snippet.isFavorite
												? 'text-yellow-500'
												: 'text-muted-foreground/30'
										}`}>
										★
									</button>
								</div>
								<div className='flex-1 bg-muted/30 p-4 relative overflow-hidden'>
									<pre className='text-xs text-muted-foreground font-mono opacity-80 whitespace-pre-wrap break-all'>
										{snippet.code.slice(0, 200)}
									</pre>
									<div className='absolute inset-0 bg-linear-to-t from-card to-transparent' />
								</div>
								<div className='px-4 py-2 bg-card text-xs text-muted-foreground flex flex-wrap gap-2 overflow-hidden'>
									{snippet.tags.slice(0, 4).map((tag) => (
										<span
											key={tag}
											className='bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground'>
											#{tag}
										</span>
									))}
								</div>
							</Card>
						))
					)}
				</div>
			</div>
		);
	};

	return (
		<Layout
			currentView={view}
			onChangeView={setView}
			filter={filter}
			onFilterChange={setFilter}
			user={user}
			onLogout={handleLogout}>
			{loading ? (
				<div className='flex h-full items-center justify-center text-muted-foreground'>
					Loading Vault...
				</div>
			) : (
				<>
					<div>
						<PushNotificationManager />
						<InstallPrompt />
					</div>
					{renderContent()}
				</>
			)}
		</Layout>
	);
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null
	);
	const [message, setMessage] = useState('');

	useEffect(() => {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, []);

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none',
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}

	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
			),
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await subscribeUser(serializedSub);
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(message);
			setMessage('');
		}
	}

	if (!isSupported) {
		return <p>Push notifications are not supported in this browser.</p>;
	}

	return (
		<div>
			<h3>Push Notifications</h3>
			{subscription ? (
				<>
					<p>You are subscribed to push notifications.</p>
					<button onClick={unsubscribeFromPush}>Unsubscribe</button>
					<input
						type='text'
						placeholder='Enter notification message'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button onClick={sendTestNotification}>Send Test</button>
				</>
			) : (
				<>
					<p>You are not subscribed to push notifications.</p>
					<button onClick={subscribeToPush}>Subscribe</button>
				</>
			)}
		</div>
	);
}

function InstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		setIsIOS(
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as any).MSStream
		);

		setIsStandalone(
			window.matchMedia('(display-mode: standalone)').matches
		);
	}, []);

	if (isStandalone) {
		return null; // Don't show install button if already installed
	}

	return (
		<div>
			<h3>Install App</h3>
			<button>Add to Home Screen</button>
			{isIOS && (
				<p>
					To install this app on your iOS device, tap the share button
					<span role='img' aria-label='share icon'>
						{' '}
						⎋{' '}
					</span>
					and then "Add to Home Screen"
					<span role='img' aria-label='plus icon'>
						{' '}
						➕{' '}
					</span>
					.
				</p>
			)}
		</div>
	);
}
