import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter'
import { AppProps } from 'next/app'
import RootLayout from '@/components/layout'
import CssBaseline from '@mui/joy/CssBaseline'
import { CssVarsProvider } from '@mui/joy/styles'
import '../locales/i18n'

const App: React.FC<AppProps> = (props: AppProps) => {
	const { Component, pageProps } = props
	return (
		<AppCacheProvider {...props}>
			<CssVarsProvider disableTransitionOnChange>
				<CssBaseline />
				<RootLayout>
					<Component {...pageProps} />
				</RootLayout>
			</CssVarsProvider>
		</AppCacheProvider>
	)
}
export default App
