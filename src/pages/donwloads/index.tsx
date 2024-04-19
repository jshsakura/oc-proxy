import Greet from '@/app/greet'
import DownloadsList from '@/pages/donwloads/components/DownloadsList'
import DownloadsTable from '@/pages/donwloads/components/DownloadsTable'

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
