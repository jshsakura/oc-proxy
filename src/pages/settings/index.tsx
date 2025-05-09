import React from 'react'
import { Box, Select, Table, Typography } from '@mui/joy'
import ColorSchemeToggle from '@/components/common/ColorSchemeToggle'

const DirectoryPicker: React.FC<DirectoryPickerProps> = ({
	onChange,
	...props
}) => {
	return <input type='file' onChange={onChange} {...props} />
}

const SettingsPage: React.FC = () => {
	const updateLanguage = (lang: string) => {
		console.log(`Selected language: ${lang}`)
	}

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					mb: 1,
					gap: 1,
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: { xs: 'start', sm: 'center' },
					flexWrap: 'wrap',
					justifyContent: 'space-between',
				}}>
				<Typography level='h2' component='h1' sx={{ mb: 1 }}>
					Settings Title
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Typography level='title-md'>Interface Title</Typography>
			</Box>

			<Table
				aria-label='basic table'
				variant='soft'
				color='neutral'
				size='lg'
				sx={{ borderRadius: '5px' }}>
				<tr>
					<td width='40%'>Theme Toggle</td>
					<td>
						<ColorSchemeToggle sx={{ ml: 'auto' }} />
					</td>
				</tr>

				<tr>
					<td>Language Settings</td>
					<td>
						<DirectoryPicker
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								const selectedLang = event.target.value
								updateLanguage(selectedLang)
							}}
						/>
					</td>
				</tr>

				<tr>
					<td>Default Download Path</td>
					<td width='40%'>Theme Toggle</td>
					<td>
						<Select
							variant='plain'
							size='sm'
							defaultValue={'en'}
							onChange={(
								event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null,
								value: string | null,
							) => {
								if (value) {
									updateLanguage(value)
								}
							}}
							sx={{
								p: 1,
								border: '1px solid',
								borderColor: 'neutral.outline',
								borderRadius: '8px',
							}}>
							<option value='en'>English</option>
							<option value='ko'>Korean</option>
						</Select>
						<ColorSchemeToggle sx={{ ml: 'auto' }} />
					</td>
				</tr>
			</Table>
		</>
	)
}

export default SettingsPage

interface DirectoryPickerProps {
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}
