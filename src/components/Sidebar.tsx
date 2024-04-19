import React from 'react'
import { useRouter } from 'next/router'
import ArrowCircleDownTwoToneIcon from '@mui/icons-material/ArrowCircleDownTwoTone'
import CoffeeTwoToneIcon from '@mui/icons-material/CoffeeTwoTone'
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone'
import Sheet from '@mui/joy/Sheet'
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton'
import ListItemContent from '@mui/joy/ListItemContent'
import { closeSidebar } from './utils'
import List from '@mui/joy/List'
import NextLink from './common/NextLink'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Avatar from '@mui/joy/Avatar'
import Divider from '@mui/joy/Divider'
import { GlobalStyles } from '@mui/joy'

interface NavigationLinkProps {
	to: string
	label: string
	icon: JSX.Element
}

interface TogglerProps {
	defaultExpanded?: boolean
	children: React.ReactNode
	renderToggle: (params: {
		open: boolean
		setOpen: React.Dispatch<React.SetStateAction<boolean>>
	}) => React.ReactNode
}

const NavigationLink = ({ to, label, icon }: NavigationLinkProps) => {
	const router = useRouter() // useRouter 훅을 사용하여 현재 경로 정보를 가져옵니다.
	const isActive = router.pathname === to // 현재 경로와 'to' 속성을 비교하여 선택 상태를 결정합니다.

	return (
		<NextLink to={to}>
			<ListItemButton selected={isActive}>
				{icon}
				<ListItemContent>
					<Typography level='title-sm'>{label}</Typography>
				</ListItemContent>
			</ListItemButton>
		</NextLink>
	)
}

const Toggler = ({
	defaultExpanded = false,
	renderToggle,
	children,
}: TogglerProps) => {
	const [open, setOpen] = React.useState(defaultExpanded)
	return (
		<>
			{renderToggle({ open, setOpen })}
			<Box
				sx={{
					display: 'grid',
					gridTemplateRows: open ? '1fr' : '0fr',
					transition: '0.2s ease',
					'& > *': {
						overflow: 'hidden',
					},
				}}>
				{children}
			</Box>
		</>
	)
}

const Sidebar = () => {
	return (
		<Sheet
			className='Sidebar'
			sx={{
				position: { xs: 'fixed', md: 'sticky' },
				transform: {
					xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
					md: 'none',
				},
				transition: 'transform 0.4s, width 0.4s',
				zIndex: 10000,
				height: '100dvh',
				width: 'var(--Sidebar-width)',
				top: 0,
				p: 2,
				flexShrink: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				borderRight: '1px solid',
				borderColor: 'divider',
			}}>
			<GlobalStyles
				styles={(theme) => ({
					':root': {
						'--Sidebar-width': '220px',
						[theme.breakpoints.up('lg')]: {
							'--Sidebar-width': '240px',
						},
					},
				})}
			/>
			<Box
				className='Sidebar-overlay'
				sx={{
					position: 'fixed',
					zIndex: 9998,
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					opacity: 'var(--SideNavigation-slideIn)',
					backgroundColor: 'var(--joy-palette-background-backdrop)',
					transition: 'opacity 0.4s',
					transform: {
						xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
						lg: 'translateX(-100%)',
					},
				}}
				onClick={() => closeSidebar()}
			/>

			<Box
				sx={{
					minHeight: 0,
					overflow: 'hidden auto',
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					[`& .${listItemButtonClasses.root}`]: {
						gap: 1.5,
					},
				}}>
				<List
					size='sm'
					sx={{
						gap: 1,
						'--List-nestedInsetStart': '30px',
						'--ListItem-radius': (theme) => theme.vars.radius.sm,
					}}>
					<NavigationLink
						to='/'
						label='Downloads'
						icon={<ArrowCircleDownTwoToneIcon />}
					/>

					{/* <ListItem nested>
                        <Toggler
                            renderToggle={({ open, setOpen }) => (
                                <ListItemButton onClick={() => setOpen(!open)}>
                                    <FactCheckTwoToneIcon />
                                    <ListItemContent>
                                        <Typography level="title-sm">Tasks</Typography>
                                    </ListItemContent>
                                    <KeyboardArrowDownIcon
                                        sx={{ transform: open ? "rotate(180deg)" : "none" }}
                                    />
                                </ListItemButton>
                            )}
                        >
                            <List sx={{ gap: 0.5 }}>
                                <ListItem sx={{ mt: 0.5 }}>
                                    <ListItemButton>All tasks</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton>Backlog</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton>In progress</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton>Done</ListItemButton>
                                </ListItem>
                            </List>
                        </Toggler>
                    </ListItem> */}

					{/* <ListItem>
                        <ListItemButton
                            role="menuitem"
                            component="a"
                            href="/joy-ui/getting-started/templates/messages/"
                        >
                            <QuestionAnswerRoundedIcon />
                            <ListItemContent>
                                <Typography level="title-sm">Messages</Typography>
                            </ListItemContent>
                            <Chip size="sm" color="primary" variant="solid">
                                4
                            </Chip>
                        </ListItemButton>
                    </ListItem> */}
				</List>

				<List
					size='sm'
					sx={{
						mt: 'auto',
						flexGrow: 0,
						'--ListItem-radius': (theme) => theme.vars.radius.sm,
						'--List-gap': '8px',
						mb: 2,
					}}>
					<NavigationLink
						to='/support'
						label='Support'
						icon={<CoffeeTwoToneIcon />}
					/>
					<NavigationLink
						to='/settings'
						label='Settings'
						icon={<SettingsTwoToneIcon />}
					/>
				</List>
			</Box>
			<Divider />
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Avatar
					variant='outlined'
					size='sm'
					src='https://avatars.githubusercontent.com/u/10691942?v=4'
				/>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Typography level='body-sm'>Need help?</Typography>
					<Typography level='body-xs'>support@opencourse.kr</Typography>
				</Box>
			</Box>
		</Sheet>
	)
}

export default Sidebar
