import { invoke } from '@tauri-apps/api'
import { useState } from 'react'

// Define a TypeScript interface for the response structure if known.
interface BypassResponse {
	bypassedLink: string
}

function BypassComponent() {
	const [link, setLink] = useState<string>('')
	const [result, setResult] = useState<string>('')

	const handleBypass = async () => {
		try {
			// Explicitly type the response with the expected structure.
			const bypassedLink: BypassResponse = await invoke<BypassResponse>(
				'ouo_bypass',
				{ url: link },
			)
			setResult(bypassedLink.bypassedLink)
		} catch (error) {
			console.error('Error:', error)
		}
	}

	return (
		<div>
			<input
				type='text'
				value={link}
				onChange={(e) => setLink(e.target.value)}
				placeholder='Enter OUO.io URL'
			/>
			<button onClick={handleBypass}>Bypass</button>
			<p>Result: {result}</p>
		</div>
	)
}

export default BypassComponent
