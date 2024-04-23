import React from 'react'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import PauseIcon from '@mui/icons-material/Pause'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import BlockIcon from '@mui/icons-material/Block'
import Chip from '@mui/joy/Chip'
import { ColorPaletteProp } from '@mui/joy/styles/types'
import { DownloadItem, Status } from '@/types/downloads'

// Icon 매핑
const statusIcons: { [key in Status]?: JSX.Element } = {
	S: <AutorenewRoundedIcon />,
	P: <PauseIcon />,
	C: <CheckRoundedIcon />,
	R: <BlockIcon />,
}

// Color 매핑
const statusColors: { [key in Status]?: ColorPaletteProp } = {
	N: 'neutral',
	S: 'primary',
	P: 'warning',
	C: 'success',
	R: 'danger',
}

// 컴포넌트 정의
const StatusChip: React.FC<{ row: DownloadItem }> = ({ row }) => {
	return (
		<Chip
			variant='soft'
			size='sm'
			startDecorator={statusIcons[row.fileStatus]}
			color={statusColors[row.fileStatus]}
		/>
	)
}

export default StatusChip
