import ChatInterface from '@/components/chat-interface'

export default function Home() {
  return (
    <div className="flex flex-col w-full h-screen p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Printavo Chat</h1>
        <p className="text-muted-foreground">
          Chat with your Printavo GraphQL data
        </p>
      </header>
      <ChatInterface />
    </div>
  )
}