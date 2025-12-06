'use client';

import { useEffect } from 'react';
// import { useToast } from '@/components/ui/use-toast';

export default function PWAUpdateToast() {
	// const { toast } = useToast();

	// useEffect(() => {
	// 	const showUpdateToast = () => {
	// 		toast({
	// 			title: 'Update available 🚀',
	// 			description:
	// 				'A new version of this app is ready. Refresh to update.',
	// 			action: (
	// 				<button
	// 					onClick={() => window.location.reload()}
	// 					className='px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm'>
	// 					Refresh
	// 				</button>
	// 			),
	// 		});
	// 	};

	// 	window.addEventListener('sw_updated', showUpdateToast);

	// 	return () => window.removeEventListener('sw_updated', showUpdateToast);
	// }, [toast]);

	return null;
}
