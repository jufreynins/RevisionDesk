export default function HtmlContent({ html, className = '' }: { html: string | null | undefined; className?: string }) {
    if (!html) return null;

    return <div className={`prose prose-sm max-w-none prose-zinc ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
