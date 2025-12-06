'use client';

import { useEffect, useState } from 'react';

export default function UpdatePopup() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const handler = () => {
			setShow(true);
		};

		window.addEventListener('sw_updated', handler);
		return () => window.removeEventListener('sw_updated', handler);
	}, []);

	const refresh = () => {
		window.location.reload();
	};

	if (!show) return null;

	return (
		<div className='fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-3 rounded-lg shadow-lg z-50'>
			<p className='text-sm mb-2'>
				A new version of this app is available.
			</p>
			<button
				onClick={refresh}
				className='bg-white text-black px-3 py-1 rounded-md text-sm'>
				Refresh
			</button>
		</div>
	);
}
