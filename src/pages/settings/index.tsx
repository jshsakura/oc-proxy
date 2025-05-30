import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Table from '@mui/joy/Table'
import ColorSchemeToggle from '@/components/common/ColorSchemeToggle'
import DirectoryPicker from '@/components/common/DirectoryPicker'
import Button from '@mui/joy/Button'
import ButtonGroup from '@mui/joy/ButtonGroup'
import i18n from '../../locales/i18n'
import { useTranslation } from 'react-i18next'

const Settings = () => {
	const { t, i18n } = useTranslation()
	const currentLang = i18n.language

	// 언어 변경하기
	const changeLanguage = (lang: string) => {
		i18n.changeLanguage(lang)
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
					{t(`page.settings.title`)}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Typography level='title-md'>{t(`page.settings.interface`)}</Typography>
			</Box>
			<Table
				aria-label='basic table'
				variant='soft'
				color='neutral'
				size='lg'
				sx={{ borderRadius: '5px' }}>
				<tr>
					<td width='40%'>{t(`page.settings.theme_toggle`)}</td>
					<td>
						<ColorSchemeToggle sx={{ ml: 'auto' }} />
					</td>
				</tr>
				<tr>
					<td>{t(`page.settings.default_download_path`)}</td>
					<td>
						<DirectoryPicker />
					</td>
				</tr>
				<tr>
					<td>{t(`page.settings.languages_settings`)}</td>
					<td>
						<ButtonGroup variant='solid'>
							<Button
								onClick={() => changeLanguage('en')}
								className={`lang-button ${currentLang === 'en' ? 'active' : ''}`}
								color={currentLang === 'en' ? 'primary' : undefined}>
								{t(`page.settings.english`)}
							</Button>
							<Button
								onClick={() => changeLanguage('ko')}
								className={`lang-button ${currentLang === 'ko' ? 'active' : ''}`}
								color={currentLang === 'ko' ? 'primary' : undefined}>
								{t(`page.settings.korean`)}
							</Button>
						</ButtonGroup>
					</td>
				</tr>
			</Table>
		</>
	)
}

export default Settings
