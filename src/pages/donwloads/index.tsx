import Greet from '@/components/greet'
import dynamic from 'next/dynamic'

/* SSR 이슈를 피하기 위해 다이나믹으로 임포트 */
const DownloadsList = dynamic(
	() => import('@/pages/donwloads/components/DownloadsList'),
	{
		ssr: false,
	},
)

/* SSR 이슈를 피하기 위해 다이나믹으로 임포트 */
const DownloadsTable = dynamic(
	() => import('@/pages/donwloads/components/DownloadsTable'),
	{
		ssr: false,
	},
)

const Downloads = () => {
	return (
		<>
			<Greet />
			<DownloadsTable />
			<DownloadsList />
		</>
	)
}

export default Downloads
