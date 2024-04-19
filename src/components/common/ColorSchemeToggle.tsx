import { useColorScheme } from '@mui/joy/styles'
import IconButton, { IconButtonProps } from '@mui/joy/IconButton'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useEffect, useState } from 'react'

const ColorSchemeToggle = (props: IconButtonProps) => {
	const { onClick, sx, ...other } = props
	const { mode, setMode } = useColorScheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	if (!mounted) {
		return (
			<IconButton
				size='sm'
				variant='soft'
				color='primary'
				{...other}
				sx={sx}
				disabled
			/>
		)
	}
	return (
		<IconButton
			id='toggle-mode'
			size='sm'
			variant='soft'
			color={mode === 'light' ? 'primary' : 'neutral'}
			{...other}
			onClick={(event) => {
				if (mode === 'light') {
					setMode('dark')
				} else {
					setMode('light')
				}
				onClick?.(event)
			}}
			sx={[
				{
					'& > *:first-child': {
						display: mode === 'dark' ? 'none' : 'initial',
					},
					'& > *:last-child': {
						display: mode === 'light' ? 'none' : 'initial',
					},
				},
				...(Array.isArray(sx) ? sx : [sx]),
			]}>
			<DarkModeRoundedIcon />
			<LightModeIcon />
		</IconButton>
	)
}

export default ColorSchemeToggle
