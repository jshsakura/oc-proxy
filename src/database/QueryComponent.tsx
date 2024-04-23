import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api'

const QueryComponent = (query: string) => {
	const [results, setResults] = useState<string[]>([])
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		invoke('execute_query', {
			db_path: './mydatabase.db',
			query,
		})
			.then((response: string[]) => {
				setResults(response)
				setError(null)
			})
			.catch((err: Error) => {
				setError(`Error executing query: ${err.message}`)
			})
	}, [])

	return (
		<div>
			{error ? (
				<p>Error: {error}</p>
			) : (
				<ul>
					{results.map((result, index) => (
						<li key={index}>{result}</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default QueryComponent
