import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import CreateNewFolderTwoToneIcon from '@mui/icons-material/CreateNewFolderTwoTone'
import { useTranslation } from 'react-i18next'

const DirectoryPicker: React.FC = () => {
	const [directory, setDirectory] = useState<string>('')
	const { t } = useTranslation()

	const selectDirectory = async () => {
		try {
			// Tauri 백엔드에서 'select_directory' 명령을 호출
			const path: string = await invoke('select_directory')
			if (path) {
				setDirectory(path)
			}
		} catch (error) {
			console.error('Failed to select directory:', error)
		}
	}

	return (
		<Input
			placeholder={t(`page.settings.no_directory_chosen`)}
			readOnly
			value={directory}
			startDecorator={
				<Button
					variant='soft'
					color='primary'
					onClick={selectDirectory}
					startDecorator={<CreateNewFolderTwoToneIcon />}>
					{t(`page.settings.locate`)}
				</Button>
			}
			sx={{ width: '100%' }}
		/>
	)
}

export default DirectoryPicker
