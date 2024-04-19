import {
	Html,
	Head,
	Main,
	NextScript,
	DocumentContext,
	DocumentProps,
} from 'next/document'
import {
	DocumentHeadTags,
	DocumentHeadTagsProps,
	documentGetInitialProps,
} from '@mui/material-nextjs/v13-pagesRouter'

const MyDocument = (props: DocumentProps & DocumentHeadTagsProps) => {
	return (
		<Html lang='en'>
			<Head>
				<DocumentHeadTags {...props} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
	const finalProps = await documentGetInitialProps(ctx)
	return finalProps
}

export default MyDocument
