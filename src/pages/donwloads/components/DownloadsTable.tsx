import { useEffect, useState } from 'react'
/* eslint-disable jsx-a11y/anchor-is-valid */
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import Divider from '@mui/joy/Divider'
import Dropdown from '@mui/joy/Dropdown'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Link from '@mui/joy/Link'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Sheet from '@mui/joy/Sheet'
import Table from '@mui/joy/Table'
import Typography from '@mui/joy/Typography'

import StatusChip from '@/pages/donwloads/components/StatusChip'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import AssignmentReturnedTwoToneIcon from '@mui/icons-material/AssignmentReturnedTwoTone'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone'
import SearchIcon from '@mui/icons-material/Search'
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone'
import CircularProgressWithLabel from '../../../components/common/CircularProgressWithLabel'
import { formatBytes } from '../../../components/utils'
import { DownloadItem } from '../../../types/downloads'
import { invoke, clipboard } from '@tauri-apps/api'
import FileDownloadOffTwoToneIcon from '@mui/icons-material/FileDownloadOffTwoTone'
import { BypassResponse, Order, SnackbarState } from '@/types/common'
import Snackbar from '@mui/joy/Snackbar'
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone'
import { useTranslation } from 'react-i18next'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1
	}
	if (b[orderBy] > a[orderBy]) {
		return 1
	}
	return 0
}

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key,
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string },
) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(
	array: readonly T[],
	comparator: (a: T, b: T) => number,
) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if (order !== 0) {
			return order
		}
		return a[1] - b[1]
	})
	return stabilizedThis.map((el) => el[0])
}

const RowMenu = () => {
	return (
		<Dropdown>
			<MenuButton
				slots={{ root: IconButton }}
				slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}>
				<MoreHorizRoundedIcon />
			</MenuButton>
			<Menu size='sm' sx={{ minWidth: 140 }}>
				<MenuItem>Copy Download URL</MenuItem>
				<MenuItem>Open Directory</MenuItem>
				<Divider />
				{/* <MenuItem color="success">Start</MenuItem>
        <MenuItem color="warning">Pause</MenuItem> */}
				<MenuItem color='danger'>Remove</MenuItem>
			</Menu>
		</Dropdown>
	)
}

const DownloadsTable = () => {
	const [order, setOrder] = useState<Order>('desc')
	const [selected, setSelected] = useState<readonly string[]>([])
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState<string>('SELECT * FROM TB_DOWNLOAD_LIST;')

	const [results, setResults] = useState<DownloadItem[]>([])
	const [error, setError] = useState<string | null>(null)
	const { t } = useTranslation()

	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		vertical: 'bottom',
		horizontal: 'right',
		message: '',
		color: 'neutral',
	})
	const {
		vertical,
		horizontal,
		open: isSnackbarOpen,
		message: snackbarMessage,
		color,
	} = snackbarState

	const handleSnackbarClose = () => {
		setSnackbarState({ ...snackbarState, open: false })
	}

	useEffect(() => {
		invoke('execute_query', {
			db_path: './mydatabase.db',
			query,
		})
			.then((response: unknown) => {
				if (
					Array.isArray(response) &&
					response.every((item) => typeof item === 'object' && item !== null)
				) {
					setResults(response as DownloadItem[])
					setError(null)
				} else {
					throw new Error('Invalid data format received')
				}
			})
			.catch((err: Error) => {
				setError(`Error executing query: ${err.message}`)
			})
	}, [query])

	const fetchBypassedLink = async (url: string): Promise<string> => {
		try {
			const response: BypassResponse = await invoke<BypassResponse>('ouo_bypass', {
				url,
			})
			return response.bypassed_link
		} catch (error) {
			console.error('Error fetching bypassed link:', error)
			throw new Error('Failed to fetch the bypassed link.')
		}
	}

	const fetchAndValidateURL = async () => {
		try {
			// 클립보드에서 텍스트 읽기
			let textFromClipboard = await clipboard.readText()

			if (!textFromClipboard) {
				return
			}

			console.log(`클립보드의 URL: ${textFromClipboard}`)
			if (textFromClipboard.indexOf('https') < 0) {
				textFromClipboard = 'https://' + textFromClipboard
			}

			// URL 유효성 검사
			const url = new URL(textFromClipboard) // 이 부분에서 예외가 발생하면 유효하지 않은 URL입니다.

			console.log(`클립보드의 URL은 유효합니다: ${url.href}`)

			const realUrl = await fetchBypassedLink(url.href)
			setSnackbarState({
				...snackbarState,
				open: true,
				message: realUrl,
				color: 'success',
			})
			return url.href
		} catch (error) {
			console.error('클립보드의 내용이 유효한 URL이 아닙니다.', error)
			setSnackbarState({
				...snackbarState,
				open: true,
				message: '클립보드의 내용이 유효한 URL이 아닙니다.',
				color: 'danger',
			})
			return // 혹은 유효하지 않을 때 처리 로직
		}
	}

	const renderFilters = () => {
		return (
			<FormControl size='sm'>
				<FormLabel>{t(`page.downloads.status`)}</FormLabel>
				<Select
					size='sm'
					placeholder={t(`page.downloads.filter_by_status`)}
					slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}>
					<Option value='T'>{t(`page.downloads.try_proxy`)}</Option>
					<Option value='S'>{t(`page.downloads.started`)}</Option>
					<Option value='P'>{t(`page.downloads.paused`)}</Option>
					<Option value='R'>{t(`page.downloads.removed`)}</Option>
					<Option value='C'>{t(`page.downloads.completed`)}</Option>
				</Select>
			</FormControl>
		)
	}

	return (
		<>
			<Sheet
				className='SearchAndFilters-mobile'
				sx={{
					display: { xs: 'flex', sm: 'none' },
					my: 1,
					gap: 1,
				}}>
				<Input
					size='sm'
					placeholder='Search'
					startDecorator={<SearchIcon />}
					sx={{ flexGrow: 1 }}
				/>
				<IconButton
					size='sm'
					variant='outlined'
					color='neutral'
					onClick={() => setOpen(true)}>
					<FilterAltIcon />
				</IconButton>
				<Modal open={open} onClose={() => setOpen(false)}>
					<ModalDialog aria-labelledby='filter-modal' layout='fullscreen'>
						<ModalClose />
						<Typography id='filter-modal' level='h2'>
							Filters
						</Typography>
						<Divider sx={{ my: 2 }} />
						<Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{renderFilters()}
							<Button color='primary' onClick={() => setOpen(false)}>
								Submit
							</Button>
						</Sheet>
					</ModalDialog>
				</Modal>
			</Sheet>
			<Box
				className='SearchAndFilters-tabletUp'
				sx={{
					borderRadius: 'sm',
					py: 2,
					display: { xs: 'none', sm: 'flex' },
					flexWrap: 'wrap',
					gap: 1.5,
					'& > *': {
						minWidth: { xs: '120px', md: '160px' },
					},
				}}>
				<FormControl sx={{ flex: 1 }} size='sm'>
					<FormLabel>{t(`page.downloads.search_for_file_name`)}</FormLabel>
					<Input size='sm' placeholder='Search' startDecorator={<SearchIcon />} />
				</FormControl>
				{renderFilters()}
			</Box>

			<Sheet
				className='DownloadsTableContainer'
				variant='outlined'
				sx={{
					display: { xs: 'none', sm: 'initial' },
					width: '100%',
					borderRadius: 'sm',
					flexShrink: 1,
					overflow: 'auto',
					minHeight: 0,
				}}>
				{results.length > 0 ? (
					<Table
						aria-labelledby='tableTitle'
						stickyHeader
						hoverRow
						sx={{
							'--TableCell-headBackground': 'var(--joy-palette-background-level1)',
							'--Table-headerUnderlineThickness': '1px',
							'--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
							'--TableCell-paddingY': '4px',
							'--TableCell-paddingX': '8px',
							minHeight: '440px',
						}}>
						<thead>
							<tr>
								<th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
									<Checkbox
										size='sm'
										indeterminate={
											selected.length > 0 && selected.length !== results.length
										}
										checked={selected.length === results.length}
										onChange={(event) => {
											setSelected(
												event.target.checked
													? results.map((row) => row.fileId.toString())
													: [],
											)
										}}
										color={
											selected.length > 0 || selected.length === results.length
												? 'primary'
												: undefined
										}
										sx={{ verticalAlign: 'text-bottom' }}
									/>
								</th>
								<th style={{ width: 220, padding: '12px 6px' }}>
									<Link
										underline='none'
										color='primary'
										component='button'
										onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
										fontWeight='lg'
										endDecorator={<ArrowDropDownIcon />}
										sx={{
											'& svg': {
												transition: '0.2s',
												transform: order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
											},
										}}>
										File Name
									</Link>
								</th>
								<th style={{ width: 140, padding: '12px 6px' }}>Date</th>
								<th style={{ width: 140, padding: '12px 6px' }}>Status</th>
								<th style={{ width: 100, padding: '12px 6px' }}> </th>
							</tr>
						</thead>
						<tbody>
							{stableSort(results, getComparator(order, 'fileId')).map((row) => (
								<tr key={row.fileId}>
									<td style={{ textAlign: 'center', width: 120 }}>
										<Checkbox
											size='sm'
											checked={selected.includes(row.fileId.toString())}
											color={
												selected.includes(row.fileId.toString()) ? 'primary' : undefined
											}
											onChange={(event) => {
												setSelected((ids) =>
													event.target.checked
														? ids.concat(row.fileId.toString())
														: ids.filter((itemId) => itemId !== row.fileId.toString()),
												)
											}}
											slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
											sx={{ verticalAlign: 'text-bottom' }}
										/>
									</td>
									<td>
										<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
											{row.nowProgress ? (
												<CircularProgressWithLabel
													value={row.nowProgress}
													status={row.fileStatus}
												/>
											) : (
												<CircularProgressWithLabel value={0} status={'N'} />
											)}
											<div>
												<Typography level='body-xs'>{row.fileName}</Typography>
												<Typography level='body-xs'>{formatBytes(row.fileSize)}</Typography>
											</div>
										</Box>
									</td>
									<td>
										<Typography level='body-xs'>
											{row.createdAt.toLocaleString()}
										</Typography>
									</td>
									<td>
										<StatusChip row={row} />
									</td>
									<td>
										<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
											<RowMenu />
										</Box>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				) : (
					<Table
						aria-labelledby='tableTitle'
						stickyHeader
						hoverRow
						sx={{
							'--TableRow-hoverBackground': 'none',
							'--TableCell-paddingY': '4px',
							'--TableCell-paddingX': '8px',
							textAlign: 'center',
							minHeight: '350px',
						}}>
						<tbody>
							<tr>
								<td>
									<FileDownloadOffTwoToneIcon
										sx={{
											fontSize: '40px',
											marginBottom: '15px',
										}}
									/>
									<Typography level='body-md'>
										{t(`page.downloads.work_info_blank`)}
									</Typography>
								</td>
							</tr>
						</tbody>
					</Table>
				)}
			</Sheet>
			<Sheet
				sx={{
					display: { xs: 'none', sm: 'initial' },
					width: '100%',
					backgroundColor: 'transparent',
					textAlign: 'right',
				}}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between', // 좌우 공간을 균등하게 나누어 버튼 그룹을 양쪽 끝으로 정렬
						alignItems: 'center', // 세로 중앙 정렬
					}}>
					<Box>
						<Button
							color='neutral'
							startDecorator={<AssignmentReturnedTwoToneIcon />}
							size='sm'
							style={{ marginRight: '8px' }}
							variant='soft'
							onClick={fetchAndValidateURL}>
							{t(`page.downloads.add_clipboard_url`)}
						</Button>
					</Box>
					<Box>
						<Button
							color='primary'
							startDecorator={<PlayCircleFilledTwoToneIcon />}
							size='sm'
							style={{ marginLeft: '8px' }}
							variant='soft'>
							{t(`page.downloads.start`)}
						</Button>
						<Button
							color='warning'
							startDecorator={<StopCircleTwoToneIcon />}
							size='sm'
							style={{ marginLeft: '8px' }}
							variant='soft'>
							{t(`page.downloads.pause`)}
						</Button>

						<Button
							color='danger'
							startDecorator={<DeleteForeverTwoToneIcon />}
							size='sm'
							style={{ marginLeft: '8px' }}
							variant='soft'>
							{t(`page.downloads.remove`)}
						</Button>
					</Box>
				</Box>
			</Sheet>
			<Box
				className='Pagination-laptopUp'
				sx={{
					pt: 2,
					gap: 1,
					[`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
					display: {
						xs: 'none',
						sm: 'flex',
						md: 'flex',
					},
				}}>
				<Button
					size='sm'
					variant='outlined'
					color='neutral'
					startDecorator={<KeyboardArrowLeftIcon />}>
					{t(`page.downloads.previous`)}
				</Button>

				<Box sx={{ flex: 1 }} />
				{['1', '2', '3', '…', '8', '9', '10'].map((page) => (
					<IconButton
						key={page}
						size='sm'
						variant={Number(page) ? 'outlined' : 'plain'}
						color='neutral'>
						{page}
					</IconButton>
				))}
				<Box sx={{ flex: 1 }} />

				<Button
					size='sm'
					variant='outlined'
					color='neutral'
					endDecorator={<KeyboardArrowRightIcon />}>
					{t(`page.downloads.next`)}
				</Button>
			</Box>
			<Snackbar
				anchorOrigin={{ vertical, horizontal }}
				open={isSnackbarOpen}
				onClose={handleSnackbarClose}
				startDecorator={<NotificationsActiveTwoToneIcon />}
				endDecorator={
					<Button
						onClick={handleSnackbarClose}
						size='sm'
						variant='soft'
						color={color}>
						{t(`page.downloads.dismiss`)}
					</Button>
				}
				variant='soft'
				color={color}
				key={color + vertical + horizontal}>
				{snackbarMessage}
			</Snackbar>
		</>
	)
}

export default DownloadsTable
