import AuthContext from './context/AuthContext'
import './globals.css'

import ToasterContext from './context/ToasterContext'

export const metadata = {
  title: 'Messenger',
  description: 'Messenger Clone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          <ToasterContext />

          {children}
        </AuthContext>
      </body>
    </html>
  )
}