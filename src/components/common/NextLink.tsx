import Link from 'next/link'

const NextLink = ({
	to,
	children,
}: {
	to: string
	children: React.ReactNode
}) => (
	<Link href={to} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
		{children}
	</Link>
)

export default NextLink
