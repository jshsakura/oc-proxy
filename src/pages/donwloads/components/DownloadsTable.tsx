/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import { ColorPaletteProp } from '@mui/joy/styles'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Link from '@mui/joy/Link'
import Input from '@mui/joy/Input'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import ModalClose from '@mui/joy/ModalClose'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Table from '@mui/joy/Table'
import Sheet from '@mui/joy/Sheet'
import Checkbox from '@mui/joy/Checkbox'
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import Dropdown from '@mui/joy/Dropdown'

import FilterAltIcon from '@mui/icons-material/FilterAlt'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import BlockIcon from '@mui/icons-material/Block'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone'
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone'
import AssignmentReturnedTwoToneIcon from '@mui/icons-material/AssignmentReturnedTwoTone'
import PauseIcon from '@mui/icons-material/Pause'
import { DownloadsListRow } from '../../../types/downloads'
import CircularProgressWithLabel from '../../../components/common/CircularProgressWithLabel'
import { formatBytes } from '../../../components/utils'
import { useEffect, useState } from 'react'

const rows: DownloadsListRow[] = [
	{
		id: 'INV-1234',
		date: 'Feb 3, 2023',
		status: 'S',
		file: {
			initial: 'O',
			name: 'Olivia Ryhe',
			size: 309200000,
		},
		progress: 60,
	},
	{
		id: 'INV-1233',
		date: 'Feb 3, 2023',
		status: 'P',
		file: {
			initial: 'S',
			name: 'Steve Hampton',
			size: 204800000,
		},
		progress: 40,
	},
	{
		id: 'INV-1232',
		date: 'Feb 3, 2023',
		status: 'R',
		file: {
			initial: 'C',
			name: 'Ciaran Murray',
			size: 204800000,
		},
		progress: 30,
	},
	{
		id: 'INV-1231',
		date: 'Feb 3, 2023',
		status: 'S',
		file: {
			initial: 'M',
			name: 'Maria Macdonald',
			size: 204800000,
		},
		progress: 20,
	},
	{
		id: 'INV-1230',
		date: 'Feb 3, 2023',
		status: 'P',
		file: {
			initial: 'P',
			name: 'Charles Fulton',
			size: 204800000,
		},
		progress: 50,
	},
	{
		id: 'INV-1226',
		date: 'Feb 3, 2023',
		status: 'C',
		file: {
			initial: 'C',
			name: 'Bradley Rosales',
			size: 4092000000,
		},
		progress: 100,
	},
]

function getStatusName(status: string): string {
	const statusNames: { [key: string]: string } = {
		S: 'Started',
		P: 'Paused',
		C: 'Completed',
		R: 'Removed',
	}
	return statusNames[status] || 'None'
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1
	}
	if (b[orderBy] > a[orderBy]) {
		return 1
	}
	return 0
}

type Order = 'asc' | 'desc'

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

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
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

function RowMenu() {
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
	const [order, setOrder] = React.useState<Order>('desc')
	const [selected, setSelected] = React.useState<readonly string[]>([])
	const [open, setOpen] = React.useState(false)

	const [data, setData] = useState([])

	const renderFilters = () => (
		<FormControl size='sm'>
			<FormLabel>Status</FormLabel>
			<Select
				size='sm'
				placeholder='Filter by status'
				slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}>
				<Option value='T'>Try Proxy</Option>
				<Option value='S'>Started</Option>
				<Option value='P'>Paused</Option>
				<Option value='R'>Removed</Option>
				<Option value='C'>Completed</Option>
			</Select>
		</FormControl>
	)
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
					<FormLabel>Search for File Name</FormLabel>
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
									indeterminate={selected.length > 0 && selected.length !== rows.length}
									checked={selected.length === rows.length}
									onChange={(event) => {
										setSelected(event.target.checked ? rows.map((row) => row.id) : [])
									}}
									color={
										selected.length > 0 || selected.length === rows.length
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
						{stableSort(rows, getComparator(order, 'id')).map((row) => (
							<tr key={row.id}>
								<td style={{ textAlign: 'center', width: 120 }}>
									<Checkbox
										size='sm'
										checked={selected.includes(row.id)}
										color={selected.includes(row.id) ? 'primary' : undefined}
										onChange={(event) => {
											setSelected((ids) =>
												event.target.checked
													? ids.concat(row.id)
													: ids.filter((itemId) => itemId !== row.id),
											)
										}}
										slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
										sx={{ verticalAlign: 'text-bottom' }}
									/>
								</td>
								<td>
									<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
										{row.progress ? (
											<CircularProgressWithLabel
												value={row.progress}
												status={row.status}
											/>
										) : (
											<CircularProgressWithLabel value={0} status={'N'} />
										)}
										<div>
											<Typography level='body-xs'>{row.file.name}</Typography>
											<Typography level='body-xs'>{formatBytes(row.file.size)}</Typography>
										</div>
									</Box>
								</td>
								<td>
									<Typography level='body-xs'>{row.date}</Typography>
								</td>
								<td>
									<Chip
										variant='soft'
										size='sm'
										startDecorator={
											{
												S: <AutorenewRoundedIcon />,
												P: <PauseIcon />,
												C: <CheckRoundedIcon />,
												R: <BlockIcon />,
											}[row.status]
										}
										color={
											{
												N: 'neutral',
												S: 'primary',
												P: 'warning',
												C: 'success',
												R: 'danger',
											}[row.status] as ColorPaletteProp
										}>
										{getStatusName(row.status)}
									</Chip>
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
			</Sheet>
			<Sheet
				sx={{
					display: { xs: 'none', sm: 'initial' },
					width: '100%',
					backgroundColor: 'transparent',
					textAlign: 'right',
				}}>
				<Box>
					<Button
						color='neutral'
						startDecorator={<AssignmentReturnedTwoToneIcon />}
						size='sm'
						style={{ marginLeft: '8px' }}
						variant='outlined'>
						Add Clipboard URL
					</Button>

					<Button
						color='primary'
						startDecorator={<PlayCircleFilledTwoToneIcon />}
						size='sm'
						style={{ marginLeft: '8px' }}
						variant='soft'>
						Start
					</Button>
					<Button
						color='warning'
						startDecorator={<StopCircleTwoToneIcon />}
						size='sm'
						style={{ marginLeft: '8px' }}
						variant='soft'>
						Pause
					</Button>

					<Button
						color='danger'
						startDecorator={<DeleteForeverTwoToneIcon />}
						size='sm'
						style={{ marginLeft: '8px' }}
						variant='soft'>
						Remove
					</Button>
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
					Previous
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
					Next
				</Button>
			</Box>
		</>
	)
}

export default DownloadsTable
