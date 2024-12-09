import { Loader2 } from 'lucide-react'

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mt-4 text-foreground">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your data.</p>
        </div>
    )
}

export default Loading