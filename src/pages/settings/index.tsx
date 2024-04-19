import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Table from '@mui/joy/Table'
import ColorSchemeToggle from '@/components/common/ColorSchemeToggle'
import DirectoryPicker from '@/components/common/DirectoryPicker'

const Settings = () => {
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
					Settings
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Typography level='title-md'>Theme Change</Typography>
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
					<td>Default Download Path</td>
					<td>
						<DirectoryPicker />
					</td>
				</tr>
			</Table>
		</>
	)
}

export default Settings
